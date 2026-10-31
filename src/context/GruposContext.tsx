import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { api } from '../api'
import { mensajeDeError } from '../api/cliente'
import { useAuth } from './AuthContext'
import type { GrupoVecinal, InvitacionGrupo } from '../types'

interface GruposValor {
  grupos: GrupoVecinal[] // grupos a los que pertenece el vecino
  invitaciones: InvitacionGrupo[] // invitaciones pendientes que recibió
  grupoActivo: GrupoVecinal | null // el grupo con el que se filtra toda la app
  cargando: boolean
  error: string | null
  cambiarGrupoActivo: (id: number) => void
  recargar: () => Promise<void>
}

const CLAVE_ACTIVO = 'vigiapp_grupo_activo'
const GruposContext = createContext<GruposValor | null>(null)

function leerActivo(): number | null {
  try {
    const guardado = localStorage.getItem(CLAVE_ACTIVO)
    return guardado ? Number(guardado) : null
  } catch {
    return null
  }
}

// Carga los grupos del vecino y recuerda cuál es el activo. Solo aplica al rol VECINO
// (el administrador global no pertenece a grupos y ve todo).
export function GruposProvider({ children }: { children: ReactNode }) {
  const { rol } = useAuth()
  const necesitaGrupos = rol === 'VECINO'

  const [grupos, setGrupos] = useState<GrupoVecinal[]>([])
  const [invitaciones, setInvitaciones] = useState<InvitacionGrupo[]>([])
  const [cargando, setCargando] = useState(necesitaGrupos)
  const [error, setError] = useState<string | null>(null)
  const [activoId, setActivoId] = useState<number | null>(leerActivo)
  const peticion = useRef(0) // descarta respuestas viejas si se pide de nuevo

  const recargar = useCallback(async () => {
    const mia = ++peticion.current
    try {
      const [misGrupos, misInvitaciones] = necesitaGrupos
        ? await Promise.all([api.grupos.listarMios(), api.invitaciones.listarMias()])
        : ([[], []] as [GrupoVecinal[], InvitacionGrupo[]])
      if (mia !== peticion.current) return
      setGrupos(misGrupos)
      setInvitaciones(misInvitaciones)
      setError(null)
    } catch (e) {
      if (mia === peticion.current) setError(mensajeDeError(e))
    } finally {
      if (mia === peticion.current) setCargando(false)
    }
  }, [necesitaGrupos])

  useEffect(() => {
    setCargando(necesitaGrupos)
    void recargar()
  }, [necesitaGrupos, recargar])

  function cambiarGrupoActivo(id: number) {
    setActivoId(id)
    try { localStorage.setItem(CLAVE_ACTIVO, String(id)) } catch { /* sin almacenamiento: se ignora */ }
  }

  // Si el grupo guardado ya no existe, se usa el primero
  const grupoActivo = useMemo(() => grupos.find((g) => g.id === activoId) ?? grupos[0] ?? null, [grupos, activoId])

  const valor = useMemo<GruposValor>(
    () => ({ grupos, invitaciones, grupoActivo, cargando, error, cambiarGrupoActivo, recargar }),
    [grupos, invitaciones, grupoActivo, cargando, error, recargar],
  )

  return <GruposContext.Provider value={valor}>{children}</GruposContext.Provider>
}

export function useGrupos(): GruposValor {
  const contexto = useContext(GruposContext)
  if (!contexto) throw new Error('useGrupos debe usarse dentro de <GruposProvider>')
  return contexto
}
