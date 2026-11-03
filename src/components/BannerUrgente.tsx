import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useGrupos } from '../context/GruposContext'
import { useNotificaciones } from '../context/NotificacionesContext'
import { tiempoRelativo } from '../utils/formato'
import Icono from './vecino/Icono'

// Banner rojo de pedido de ayuda: aparece debajo del encabezado cuando llega un SOS en vivo.
// No se cierra solo: el vecino decide verlo, llamar al 911 o descartarlo.
export default function BannerUrgente() {
  const contexto = useNotificaciones()
  const { grupos, cambiarGrupoActivo } = useGrupos()
  const navigate = useNavigate()
  const [, setPulso] = useState(0)
  const alerta = contexto?.alertas[0]
  const pendientes = (contexto?.alertas.length ?? 1) - 1

  // Actualiza el «hace X min» cada 30 segundos
  useEffect(() => {
    const id = setInterval(() => setPulso((n) => n + 1), 30000)
    return () => clearInterval(id)
  }, [])

  // Mientras haya un pedido de ayuda, el título de la pestaña parpadea
  useEffect(() => {
    if (!alerta) return
    const original = document.title
    let encendido = true
    document.title = '🆘 Pedido de ayuda'
    const id = setInterval(() => {
      encendido = !encendido
      document.title = encendido ? '🆘 Pedido de ayuda' : original
    }, 1200)
    return () => { clearInterval(id); document.title = original }
  }, [alerta?.clave])

  if (!contexto || !alerta) return null

  const grupo = grupos.find((g) => Number(g.id) === alerta.grupoId)
  const incidente = alerta.incidente
  // Un SOS recién creado todavía no tiene título propio: se muestra el mensaje del aviso
  const detalle = incidente && incidente.titulo !== 'Reporte urgente' ? incidente.titulo : alerta.mensaje

  function verIncidente() {
    if (!alerta) return
    cambiarGrupoActivo(alerta.grupoId)
    contexto?.descartarAlerta(alerta.clave)
    navigate(`/app/incidencias/${alerta.incidenteId}`)
  }

  return (
    <section className="sos-banner" role="alert" aria-labelledby="sos-titulo" key={alerta.clave}>
      <div className="sos-banner__inner">
        <span className="sos-banner__icono" aria-hidden="true"><Icono nombre="sos" tamano={28} /></span>
        <div className="sos-banner__texto">
          <h2 id="sos-titulo">Pedido de ayuda{grupo ? ` en ${grupo.nombre}` : ''}</h2>
          <p className="sos-banner__detalle">{detalle}</p>
          <p className="sos-banner__meta">
            <span><Icono nombre="pin" tamano={16} /> {incidente?.ubicacion || 'Ubicación compartida en vivo'}</span>
            <span>{tiempoRelativo(alerta.recibida)}</span>
          </p>
        </div>
        <div className="sos-banner__acciones">
          <button type="button" className="btn sos-banner__ver" onClick={verIncidente}>Ver incidente</button>
          <a className="btn sos-banner__911" href="tel:911">Llamar al 911</a>
          <button type="button" className="sos-banner__cerrar" aria-label="Cerrar este aviso" onClick={() => contexto.descartarAlerta(alerta.clave)}>✕</button>
        </div>
      </div>
      {pendientes > 0 && (
        <p className="sos-banner__mas">
          Hay {pendientes} {pendientes === 1 ? 'pedido de ayuda más' : 'pedidos de ayuda más'}. <Link to="/app/alertas">Ver alertas</Link>
        </p>
      )}
    </section>
  )
}
