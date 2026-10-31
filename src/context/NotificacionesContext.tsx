import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { io } from 'socket.io-client'
import { api } from '../api'
import { pedir } from '../api/cliente'
import { API_URL, USAR_MOCK } from '../api/config'
import { useGrupos } from './GruposContext'
import type { Incidencia } from '../types'

/** Notificación guardada en el backend (GET /notificaciones). */
export interface Notificacion {
  id: number
  incidenteId: number | null
  grupoId: number | null
  tipo?: string
  titulo: string
  mensaje: string
  creada?: string
  leida: boolean
}

/** Pedido de ayuda recibido en vivo por Socket.IO ("incident:urgent"). */
export interface AlertaUrgente {
  clave: string
  grupoId: number
  incidenteId: number
  mensaje: string
  recibida: string // fecha ISO
  incidente: Incidencia | null // se completa después con el detalle del incidente
}

interface EventoUrgente {
  groupId: number
  incidentId: number
  message: string
}

interface NotificacionesValor {
  notificaciones: Notificacion[]
  noLeidas: number
  alertas: AlertaUrgente[] // pedidos de ayuda activos en pantalla, el más nuevo primero
  descartarAlerta: (clave: string) => void
  marcarLeida: (notificacion: Notificacion) => Promise<void>
  marcarTodas: () => Promise<void>
}

const NotificacionesContext = createContext<NotificacionesValor | null>(null)

// Dos tonos cortos para llamar la atención. Si el navegador bloquea el audio, no pasa nada.
function sonarAlerta() {
  try {
    const Contexto = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Contexto) return
    const ctx = new Contexto()
    const inicio = ctx.currentTime
    ;[880, 660].forEach((frecuencia, i) => {
      const t = inicio + i * 0.28
      const oscilador = ctx.createOscillator()
      const volumen = ctx.createGain()
      oscilador.frequency.value = frecuencia
      volumen.gain.setValueAtTime(0.0001, t)
      volumen.gain.exponentialRampToValueAtTime(0.25, t + 0.02)
      volumen.gain.exponentialRampToValueAtTime(0.0001, t + 0.24)
      oscilador.connect(volumen).connect(ctx.destination)
      oscilador.start(t)
      oscilador.stop(t + 0.25)
    })
    setTimeout(() => { void ctx.close() }, 900)
  } catch {
    /* sin audio: el aviso visual alcanza */
  }
}

function llamarAtencion() {
  navigator.vibrate?.([300, 150, 300, 150, 600]) // solo en celulares que lo soportan
  sonarAlerta()
}

// Escucha los pedidos de ayuda en vivo y mantiene las notificaciones del usuario.
// En modo mock no hay socket: el selector «Rol de prueba» puede simular un SOS.
export function NotificacionesProvider({ children }: { children: ReactNode }) {
  const { grupos, grupoActivo } = useGrupos()
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [alertas, setAlertas] = useState<AlertaUrgente[]>([])
  const idsGrupos = grupos.map((g) => g.id).sort((a, b) => a - b).join(',')

  const recibir = useCallback(async (evento: EventoUrgente, incidente: Incidencia | null = null) => {
    const alerta: AlertaUrgente = {
      clave: `${evento.incidentId}-${Date.now()}`,
      grupoId: Number(evento.groupId),
      incidenteId: Number(evento.incidentId),
      mensaje: evento.message,
      recibida: new Date().toISOString(),
      incidente,
    }
    // Si ya había una alerta del mismo incidente, se reemplaza por la nueva
    setAlertas((actuales) => [alerta, ...actuales.filter((a) => a.incidenteId !== alerta.incidenteId)])
    llamarAtencion()
    if (incidente) return
    try {
      const detalle = await api.incidencias.obtener(alerta.incidenteId)
      setAlertas((actuales) => actuales.map((a) => (a.clave === alerta.clave ? { ...a, incidente: detalle } : a)))
    } catch {
      /* el banner se muestra igual, sin el detalle */
    }
  }, [])

  // Modo real: Socket.IO + notificaciones guardadas
  useEffect(() => {
    if (USAR_MOCK) return
    const token = sessionStorage.getItem('vigiapp_token')
    if (!token) return
    const socket = io(API_URL.replace(/\/api$/, ''), { auth: { token }, transports: ['websocket'] })
    const cargarNotificaciones = () => {
      void pedir<Notificacion[]>('/notificaciones').then(setNotificaciones).catch(() => {})
    }
    const refrescar = () => {
      window.dispatchEvent(new Event('vigiapp:refrescar')) // las pantallas abiertas recargan sus datos
      cargarNotificaciones()
    }
    cargarNotificaciones() // el historial REST también aparece si el socket todavía no conecta
    socket.on('connect', refrescar)
    socket.on('incident:urgent', (evento: EventoUrgente) => {
      void recibir(evento)
      refrescar()
    })
    return () => { socket.disconnect() }
  }, [idsGrupos, recibir])

  // Modo mock: simulación disparada desde el selector «Rol de prueba»
  useEffect(() => {
    if (!USAR_MOCK) return
    async function simular() {
      const lista = await api.incidencias.listar(grupoActivo?.id).catch(() => [])
      const incidente = lista.find((i) => i.tipo === 'URGENTE') ?? lista[0]
      if (!incidente) return
      const evento = { groupId: incidente.grupoId ?? grupoActivo?.id ?? 0, incidentId: incidente.id, message: 'Se reportó una emergencia en tu grupo' }
      setNotificaciones((n) => [{ id: Date.now(), incidenteId: incidente.id, grupoId: evento.groupId, tipo: 'URGENT_INCIDENT', titulo: 'Pedido de ayuda urgente', mensaje: evento.message, creada: new Date().toISOString(), leida: false }, ...n])
      void recibir(evento, incidente)
    }
    const alSimular = () => { void simular() }
    window.addEventListener('vigiapp:simular-urgente', alSimular)
    return () => window.removeEventListener('vigiapp:simular-urgente', alSimular)
  }, [grupoActivo, recibir])

  const descartarAlerta = useCallback((clave: string) => {
    setAlertas((actuales) => actuales.filter((a) => a.clave !== clave))
  }, [])

  const marcarLeida = useCallback(async (notificacion: Notificacion) => {
    if (notificacion.leida) return
    setNotificaciones((n) => n.map((x) => (x.id === notificacion.id ? { ...x, leida: true } : x)))
    if (!USAR_MOCK) await pedir(`/notificaciones/${notificacion.id}/leida`, { metodo: 'PATCH' }).catch(() => {})
  }, [])

  const marcarTodas = useCallback(async () => {
    const pendientes = notificaciones.filter((n) => !n.leida)
    setNotificaciones((n) => n.map((x) => ({ ...x, leida: true })))
    if (!USAR_MOCK) await Promise.all(pendientes.map((n) => pedir(`/notificaciones/${n.id}/leida`, { metodo: 'PATCH' }).catch(() => {})))
  }, [notificaciones])

  const valor = useMemo<NotificacionesValor>(() => ({
    notificaciones,
    noLeidas: notificaciones.filter((n) => !n.leida).length,
    alertas,
    descartarAlerta,
    marcarLeida,
    marcarTodas,
  }), [notificaciones, alertas, descartarAlerta, marcarLeida, marcarTodas])

  return <NotificacionesContext.Provider value={valor}>{children}</NotificacionesContext.Provider>
}

// Devuelve null fuera del proveedor (por ejemplo en el panel admin), así los componentes no se muestran.
export function useNotificaciones(): NotificacionesValor | null {
  return useContext(NotificacionesContext)
}
