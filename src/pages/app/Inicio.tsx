import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api'
import { useAuth } from '../../context/AuthContext'
import { useGrupos } from '../../context/GruposContext'
import { useConsulta } from '../../hooks/useConsulta'
import AlertaCard from '../../components/AlertaCard'
import AvisoCard from '../../components/AvisoCard'
import EstadoConsulta from '../../components/EstadoConsulta'
import IncidentCard from '../../components/IncidentCard'
import PedirAyudaModal from '../../components/PedirAyudaModal'
import { tiempoRelativo } from '../../utils/formato'
import type { Alerta, Aviso, Incidencia } from '../../types'

// Inicio del vecino. Orden de prioridad: emergencia → alertas → incidencias → avisos.
export default function Inicio() {
  const { usuario } = useAuth()
  const [ayudaAbierta, setAyudaAbierta] = useState(false)
  const { grupoActivo } = useGrupos()
  const grupoId = grupoActivo?.id

  const { datos, cargando, error, recargar } = useConsulta(
    () => Promise.all([api.alertas.listar(grupoId), api.incidencias.listar(grupoId), api.avisos.listar(grupoId)]),
    [grupoId],
  )
  const [todasAlertas, todasIncidencias, todosAvisos] =
    datos ?? ([[], [], []] as [Alerta[], Incidencia[], Aviso[]])

  const activas = todasAlertas.filter((a) => a.estado === 'ACTIVA')
  const emergencias = activas.filter((a) => a.nivel === 'EMERGENCIA')
  const alertas = activas.filter((a) => a.nivel === 'ALERTA')
  const recientes = todasIncidencias
    .filter((i) => i.estado !== 'DESCARTADO')
    .sort((a, b) => new Date(b.creada).getTime() - new Date(a.creada).getTime())
    .slice(0, 4)
  const avisos = todosAvisos.filter((a) => a.prioridad === 'IMPORTANTE')

  return (
    <>
      <p className="saludo">Hola, {usuario?.nombre}. Esto pasa hoy en tu comunidad.</p>

      {/* 1. Banner rojo: solo si hay un pedido de ayuda activo */}
      {emergencias.map((e) => (
        <section key={e.id} className="banner-emergencia" aria-labelledby={`emerg-${e.id}`}>
          <span className="banner-emergencia__icon" aria-hidden="true">🚨</span>
          <div className="banner-emergencia__texto">
            <h2 id={`emerg-${e.id}`}>Emergencia activa: {e.tipo.toLowerCase()}</h2>
            <p>{e.ubicacion} · {tiempoRelativo(e.creada)}</p>
            <p>Si estás en peligro, llamá al 911.</p>
          </div>
          <Link to="/app/alertas" className="btn btn-light">Ver detalle</Link>
        </section>
      ))}

      {/* 2. Alertas activas (naranja) */}
      {alertas.length > 0 && (
        <section className="bloque" aria-labelledby="t-alertas">
          <div className="bloque__head">
            <h2 id="t-alertas">Alertas activas</h2>
            <Link to="/app/alertas">Ver todas</Link>
          </div>
          <div className="stack-list">
            {alertas.map((a) => <AlertaCard key={a.id} alerta={a} />)}
          </div>
        </section>
      )}

      {/* Accesos rápidos: siempre disponibles, aunque los datos todavía estén cargando */}
      <section className="acciones" aria-label="Accesos rápidos">
        <Link to="/app/reportar" className="accion accion--primaria">
          <span aria-hidden="true">📝</span>Reportar incidencia
        </Link>
        <button type="button" className="accion" onClick={() => setAyudaAbierta(true)}>
          <span aria-hidden="true">🆘</span>Pedir ayuda
        </button>
      </section>

      <EstadoConsulta cargando={cargando} error={error} onReintentar={recargar}>
        {/* 3. Incidencias recientes y cercanas */}
        <section className="bloque" aria-labelledby="t-incidencias">
          <div className="bloque__head">
            <h2 id="t-incidencias">Incidencias recientes y cercanas</h2>
            <Link to="/app/mapa">Ver mapa</Link>
          </div>
          <div className="stack-list">
            {recientes.map((i) => <IncidentCard key={i.id} incidencia={i} mostrarDistancia />)}
          </div>
        </section>

        {/* 4. Avisos importantes (azul) */}
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

      <PedirAyudaModal abierto={ayudaAbierta} onCerrar={() => setAyudaAbierta(false)} />
    </>
  )
}
