import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGrupos } from '../context/GruposContext'
import { useNotificaciones, type Notificacion } from '../context/NotificacionesContext'
import { tiempoRelativo } from '../utils/formato'
import Icono from './vecino/Icono'

// Campana del encabezado: contador de no leídas y panel con las notificaciones.
export default function CampanaNotificaciones() {
  const contexto = useNotificaciones()
  const { cambiarGrupoActivo } = useGrupos()
  const navigate = useNavigate()
  const [abierto, setAbierto] = useState(false)
  const contenedor = useRef<HTMLDivElement>(null)

  // Se cierra con Escape o tocando afuera
  useEffect(() => {
    if (!abierto) return
    const alTeclear = (e: KeyboardEvent) => { if (e.key === 'Escape') setAbierto(false) }
    const alTocar = (e: PointerEvent) => { if (!contenedor.current?.contains(e.target as Node)) setAbierto(false) }
    document.addEventListener('keydown', alTeclear)
    document.addEventListener('pointerdown', alTocar)
    return () => { document.removeEventListener('keydown', alTeclear); document.removeEventListener('pointerdown', alTocar) }
  }, [abierto])

  if (!contexto) return null
  const { notificaciones, noLeidas, marcarLeida, marcarTodas } = contexto

  function abrir(n: Notificacion) {
    setAbierto(false)
    if (n.grupoId) cambiarGrupoActivo(n.grupoId)
    void marcarLeida(n)
    if (n.incidenteId) navigate(`/app/incidencias/${n.incidenteId}`)
  }

  return (
    <div className="campana" ref={contenedor}>
      <button
        type="button"
        className="campana__boton"
        aria-expanded={abierto}
        aria-controls="panel-notificaciones"
        aria-label={noLeidas > 0 ? `Notificaciones: ${noLeidas} sin leer` : 'Notificaciones'}
        onClick={() => setAbierto(!abierto)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {noLeidas > 0 && <span className="campana__contador" aria-hidden="true">{noLeidas > 9 ? '9+' : noLeidas}</span>}
      </button>

      {abierto && (
        <div id="panel-notificaciones" className="campana__panel" role="region" aria-label="Notificaciones">
          <div className="campana__cabecera">
            <h2>Notificaciones</h2>
            {noLeidas > 0 && <button type="button" className="btn btn-ghost" onClick={() => { void marcarTodas() }}>Marcar todas como leídas</button>}
          </div>
          {notificaciones.length === 0 ? (
            <p className="campana__vacio">No tenés notificaciones.</p>
          ) : (
            <ul className="campana__lista">
              {notificaciones.map((n) => (
                <li key={n.id} className={`campana__item ${n.leida ? '' : 'is-nueva'}`}>
                  <button type="button" className="campana__enlace" onClick={() => abrir(n)}>
                    <span className={`campana__icono${n.tipo === 'URGENT_INCIDENT' || n.incidenteId ? ' campana__icono--sos' : ''}`} aria-hidden="true"><Icono nombre={n.tipo === 'URGENT_INCIDENT' || n.incidenteId ? 'sos' : 'campana'} tamano={18} /></span>
                    <span className="campana__cuerpo">
                      <strong>{n.titulo}</strong>
                      <span>{n.mensaje}</span>
                      {n.creada && <small>{tiempoRelativo(n.creada)}</small>}
                    </span>
                    {!n.leida && <span className="sr-only">(sin leer)</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {noLeidas > 0 && <span className="sr-only" role="status">Tenés {noLeidas} notificaciones sin leer.</span>}
    </div>
  )
}
