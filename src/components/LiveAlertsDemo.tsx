import type { EventoDemo, TipoEvento } from '../types'
import { useEffect, useState } from 'react'
import { EVENTOS_DEMO } from '../data/mock'

const ETIQUETAS: Record<TipoEvento, string> = {
  EMERGENCIA: 'Emergencia',
  ALERTA: 'Alerta',
  INCIDENCIA: 'Incidente',
  AVISO: 'Aviso',
  RESUELTO: 'Resuelto',
}
const CLASE_NIVEL: Record<TipoEvento, string> = {
  EMERGENCIA: 'nivel-emergencia',
  ALERTA: 'nivel-alerta',
  INCIDENCIA: 'nivel-incidencia',
  AVISO: 'nivel-aviso',
  RESUELTO: 'nivel-resuelto',
}
const LEYENDA: [TipoEvento, string][] = [
  ['EMERGENCIA', 'Pedido de ayuda activo de un vecino.'],
  ['ALERTA', 'Situación de seguridad prioritaria.'],
  ['INCIDENCIA', 'Problema que requiere atención.'],
  ['AVISO', 'Información de la comunidad.'],
  ['RESUELTO', 'Ya se solucionó.'],
]
const HACE = ['Ahora', 'Hace 1 min', 'Hace 3 min', 'Hace 6 min']
const MAX_VISIBLES = 4
const CADA_MS = 4000

// Demo SIMULADA de cómo llegan las notificaciones. No usa backend ni la API de notificaciones del navegador.
export default function LiveAlertsDemo() {
  // Cantidad de eventos "recibidos": de ahí se deduce qué eventos se ven y cuál sigue
  const [recibidas, setRecibidas] = useState(2)
  // Si la persona pidió reducir movimiento, empieza en pausa
  const [pausado, setPausado] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [anuncio, setAnuncio] = useState('') // texto para lectores de pantalla

  // Llega un evento nuevo cada pocos segundos, salvo que esté en pausa
  useEffect(() => {
    if (pausado) return
    const id = setInterval(() => setRecibidas((n) => n + 1), CADA_MS)
    return () => clearInterval(id)
  }, [pausado])

  // Del más nuevo al más viejo
  const visibles: { clave: number; evento: EventoDemo }[] = []
  for (let i = recibidas - 1; i >= Math.max(0, recibidas - MAX_VISIBLES); i--) {
    visibles.push({ clave: i, evento: EVENTOS_DEMO[i % EVENTOS_DEMO.length] })
  }

  // Botón "Simular una alerta": adelanta el próximo evento y lo anuncia
  function simular() {
    const proximo = EVENTOS_DEMO[recibidas % EVENTOS_DEMO.length]
    setRecibidas((n) => n + 1)
    setAnuncio(`Llegó una notificación: ${ETIQUETAS[proximo.tipo]}, ${proximo.titulo}.`)
  }

  return (
    <div className="live">
      <div className="live__text">
        <h2>Cada aviso llega con su nivel de urgencia</h2>
        <p className="section-lead">
          Las notificaciones se ordenan por color para que lo importante no quede enterrado
          entre otros mensajes. Mirá cómo llegarían a tu celular.
        </p>

        <ul className="legend">
          {LEYENDA.map(([tipo, texto]) => (
            <li key={tipo} className={CLASE_NIVEL[tipo]}>
              <span className="legend__dot" aria-hidden="true" />
              <span><strong>{ETIQUETAS[tipo]}:</strong> {texto}</span>
            </li>
          ))}
        </ul>

        <div className="live__controls">
          <button type="button" className="btn btn-primary" onClick={simular}>
            Simular una alerta
          </button>
          <button
            type="button"
            className="btn btn-outline"
            aria-pressed={pausado}
            onClick={() => setPausado(!pausado)}
          >
            {pausado ? 'Reanudar' : 'Pausar'}
          </button>
        </div>
        <p className="live__note">
          Demostración con datos de ejemplo. En la app instalada, estas notificaciones llegarán
          al celular de los vecinos de tu comunidad.
        </p>
        <p className="sr-only" role="status">{anuncio}</p>
      </div>

      <div className="phone" aria-label="Celular de ejemplo recibiendo notificaciones" role="group">
        <div className="phone__screen">
          <div className="phone__bar">
            <span>Alertas</span>
            <span className="notif-badge">🔔 {recibidas > 9 ? '9+' : recibidas}</span>
          </div>
          <ul className="phone__body live-feed">
            {visibles.map(({ clave, evento }, posicion) => (
              <li
                key={clave}
                className={`mini-card live-item ${CLASE_NIVEL[evento.tipo]} ${posicion === 0 ? 'live-item--push' : ''}`}
              >
                <span className="nivel-tag">{ETIQUETAS[evento.tipo]} · {HACE[posicion]}</span>
                <strong>{evento.titulo}</strong>
                <span>{evento.detalle}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
