import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api'
import { useAuth } from '../../context/AuthContext'
import { useGrupos } from '../../context/GruposContext'
import { useConsulta } from '../../hooks/useConsulta'
import AvisoCard from '../../components/AvisoCard'
import EstadoConsulta from '../../components/EstadoConsulta'
import IncidentCard from '../../components/IncidentCard'
import PedirAyudaModal from '../../components/PedirAyudaModal'
import { tiempoRelativo } from '../../utils/formato'
import { esUrgenteActivo } from '../../utils/permisos'
import type { Aviso, Incidencia } from '../../types'

// Inicio del vecino. Orden de prioridad: alerta urgente (rojo) → accesos → incidentes → avisos importantes.
export default function Inicio() {
  const { usuario } = useAuth()
  const { grupoActivo } = useGrupos()
  const grupoId = grupoActivo?.id
  const [ayudaAbierta, setAyudaAbierta] = useState(false)

  const { datos, cargando, error, recargar } = useConsulta(
    () => Promise.all([api.incidencias.listar(grupoId), api.avisos.listar(grupoId)]),
    [grupoId],
  )
  const [todasIncidencias, todosAvisos] = datos ?? ([[], []] as [Incidencia[], Aviso[]])

  const urgentes = todasIncidencias.filter(esUrgenteActivo) // alertas: reportes urgentes activos del grupo
  const recientes = todasIncidencias
    .filter((i) => i.estado !== 'DESCARTADO' && i.estado !== 'EXPIRADO')
    .sort((a, b) => new Date(b.creada).getTime() - new Date(a.creada).getTime())
    .slice(0, 4)
  const avisos = todosAvisos.filter((a) => a.estado === 'VIGENTE' && a.prioridad === 'IMPORTANTE')

  return (
    <>
      <p className="saludo">Hola, {usuario?.nombre}. Esto pasa hoy en tu grupo.</p>

      {/* 1. Banner rojo: solo si hay un pedido de ayuda activo */}
      {urgentes.map((u) => {
        const esMio = u.autorId === usuario?.id
        return (
          <section key={u.id} className="banner-emergencia" aria-labelledby={`urg-${u.id}`}>
            <span className="banner-emergencia__icon" aria-hidden="true">🆘</span>
            <div className="banner-emergencia__texto">
              <h2 id={`urg-${u.id}`}>{esMio ? 'Tu reporte urgente está activo' : 'Un vecino pidió ayuda'}</h2>
              <p>{u.ubicacion} · {tiempoRelativo(u.creada)}</p>
              <p>Si estás en peligro, llamá al 911.</p>
            </div>
            <Link to={`/app/incidencias/${u.id}`} className="btn btn-light">{esMio ? 'Completar datos' : 'Ver detalle'}</Link>
          </section>
        )
      })}

      {/* Accesos rápidos: siempre disponibles, aunque los datos todavía estén cargando */}
      <section className="acciones" aria-label="Accesos rápidos">
        <Link to="/app/reportar" className="accion accion--primaria">
          <span aria-hidden="true">📝</span>Reportar incidente
        </Link>
        <button type="button" className="accion" onClick={() => setAyudaAbierta(true)}>
          <span aria-hidden="true">🆘</span>Pedir ayuda
        </button>
      </section>

      <EstadoConsulta cargando={cargando} error={error} onReintentar={recargar}>
        {/* 2. Incidentes recientes y cercanos */}
        <section className="bloque" aria-labelledby="t-incidentes">
          <div className="bloque__head">
            <h2 id="t-incidentes">Incidentes recientes y cercanos</h2>
            <Link to="/app/incidentes">Ver todos</Link>
          </div>
          <div className="stack-list">
            {recientes.map((i) => <IncidentCard key={i.id} incidencia={i} mostrarDistancia />)}
          </div>
        </section>

        {/* 3. Avisos importantes (azul) */}
        {avisos.length > 0 && (
          <section className="bloque" aria-labelledby="t-avisos">
            <div className="bloque__head">
              <h2 id="t-avisos">Avisos importantes</h2>
              <Link to="/app/alertas">Ver todos</Link>
            </div>
            <div className="stack-list">
              {avisos.map((a) => <AvisoCard key={a.id} aviso={a} />)}
            </div>
          </section>
        )}
      </EstadoConsulta>

      <PedirAyudaModal abierto={ayudaAbierta} onCerrar={() => setAyudaAbierta(false)} onEnviado={recargar} />
    </>
  )
}
