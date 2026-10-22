import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../../api'
import { mensajeDeError } from '../../api/cliente'
import { useAuth } from '../../context/AuthContext'
import { useCategorias } from '../../context/CategoriasContext'
import { useGrupos } from '../../context/GruposContext'
import { useConsulta } from '../../hooks/useConsulta'
import Badge from '../../components/Badge'
import EditarIncidenteModal from '../../components/EditarIncidenteModal'
import EmptyState from '../../components/EmptyState'
import EstadoConsulta from '../../components/EstadoConsulta'
import EstadoIncidenteModal from '../../components/EstadoIncidenteModal'
import MapaEmbed from '../../components/MapaEmbed'
import { ESTADOS } from '../../data/mock'
import { fechaLarga, textoVecinos, textoYaResuelto } from '../../utils/formato'
import { UMBRAL_YA_RESUELTO, esAbierto, esUrgenteActivo, estaIncompleto, puedeGestionar } from '../../utils/permisos'
import type { EstadoIncidencia } from '../../types'

export default function DetalleIncidencia() {
  const { id } = useParams()
  const { usuario } = useAuth()
  const { grupos } = useGrupos()
  const { categoriaPorId } = useCategorias()
  const { datos: incidencia, cargando, error, recargar } = useConsulta(() => api.incidencias.obtener(Number(id)), [id])

  const [enviando, setEnviando] = useState<'visto' | 'resuelto' | null>(null)
  const [mensaje, setMensaje] = useState('')
  const [errorAccion, setErrorAccion] = useState('')
  const [editando, setEditando] = useState(false)
  const [cambiandoEstado, setCambiandoEstado] = useState(false)
  const [estadoInicial, setEstadoInicial] = useState<EstadoIncidencia | undefined>()

  // "Yo también lo vi" / "Ya lo vi resuelto": avisa a la API y recarga los contadores reales
  async function confirmar(tipo: 'visto' | 'resuelto') {
    if (!incidencia) return
    setEnviando(tipo)
    setErrorAccion('')
    setMensaje('')
    try {
      if (tipo === 'visto') await api.incidencias.confirmar(incidencia.id)
      else await api.incidencias.confirmarResuelto(incidencia.id)
      setMensaje(tipo === 'visto' ? 'Gracias, sumaste tu confirmación.' : 'Gracias, avisaste que ya está resuelto.')
      recargar()
    } catch (e) {
      setErrorAccion(mensajeDeError(e))
    } finally {
      setEnviando(null)
    }
  }

  function abrirEstado(inicial?: EstadoIncidencia) {
    setEstadoInicial(inicial)
    setCambiandoEstado(true)
  }

  if (cargando || error) {
    return <EstadoConsulta cargando={cargando} error={error} onReintentar={recargar}>{null}</EstadoConsulta>
  }

  if (!incidencia) {
    return (
      <EmptyState icono="🧭" titulo="No encontramos ese incidente" texto="Puede que se haya eliminado o que el enlace sea incorrecto.">
        <Link to="/app/incidentes" className="btn btn-primary">Volver a incidentes</Link>
      </EmptyState>
    )
  }

  const categoria = categoriaPorId(incidencia.categoriaId)
  const abierto = esAbierto(incidencia)
  const puede = puedeGestionar(incidencia, usuario, grupos)
  const sugerirCierre = puede && abierto && incidencia.vecinosYaResuelto >= UMBRAL_YA_RESUELTO

  return (
    <article className="detalle">
      <Link to="/app/incidentes" className="volver">← Volver a incidentes</Link>

      <div className="detalle__principal">
        {/* Todavía no hay fotos reales: se muestra un marcador con el ícono de la categoría */}
        <div className="foto" role="img" aria-label="Foto no disponible en este ejemplo">
          <span aria-hidden="true">{categoria?.icono ?? (incidencia.tipo === 'URGENTE' ? '🆘' : '📌')}</span>
        </div>

        <div className="detalle__info">
          <div className="detalle__tags">
            {esUrgenteActivo(incidencia) && <Badge tipo="URGENTE" />}
            <Badge tipo={incidencia.estado} />
            <span className="tag-categoria">
              <span aria-hidden="true">{categoria?.icono}</span> {categoria?.nombre ?? 'Sin categoría'}
            </span>
          </div>
          <h2>{incidencia.titulo}</h2>
          <p className="detalle__meta">📅 {fechaLarga(incidencia.creada)}</p>
          <p className="detalle__meta">📍 {incidencia.ubicacion}</p>
          <p className="detalle__meta">
            {incidencia.estado === 'EXPIRADO' ? '⌛ Expiró el ' : '⏳ Vigente hasta el '}{fechaLarga(incidencia.fechaExpiracion)}
          </p>
          {incidencia.descripcion ? <p>{incidencia.descripcion}</p> : <p className="detalle__meta">Todavía no tiene descripción.</p>}

          {/* Cierre sugerido: varios vecinos dicen que ya se resolvió */}
          {sugerirCierre && (
            <div className="sugerencia" role="status">
              <p><strong>{textoYaResuelto(incidencia.vecinosYaResuelto)}.</strong> ¿Querés cerrarlo?</p>
              <button type="button" className="btn btn-primary" onClick={() => abrirEstado('RESUELTO')}>Cerrar como resuelto</button>
            </div>
          )}

          <div className="confirmar">
            <p className="confirmar__cuenta">👀 <strong>{textoVecinos(incidencia.vecinos)}</strong></p>
            {incidencia.vecinosYaResuelto > 0 && <p className="confirmar__cuenta">✔️ {textoYaResuelto(incidencia.vecinosYaResuelto)}</p>}
            {abierto ? (
              <div className="confirmar__botones">
                <button type="button" className="btn btn-primary" disabled={incidencia.yoConfirme || enviando !== null} onClick={() => confirmar('visto')}>
                  {incidencia.yoConfirme ? 'Ya lo confirmaste ✓' : enviando === 'visto' ? 'Enviando…' : 'Yo también lo vi'}
                </button>
                <button type="button" className="btn btn-outline" disabled={incidencia.yoMarqueResuelto || enviando !== null} onClick={() => confirmar('resuelto')}>
                  {incidencia.yoMarqueResuelto ? 'Avisaste que está resuelto ✓' : enviando === 'resuelto' ? 'Enviando…' : 'Ya lo vi resuelto'}
                </button>
              </div>
            ) : (
              <p className="detalle__meta">Este incidente ya está cerrado, no admite más confirmaciones.</p>
            )}
            {mensaje && <p role="status" className="detalle__meta">{mensaje}</p>}
            {errorAccion && <p className="campo__error" role="alert">{errorAccion}</p>}
          </div>

          {/* Solo el creador y el owner del grupo pueden actualizarlo o cerrarlo */}
          {puede && abierto && (
            <div className="panel-gestion">
              <h3>Gestionar este incidente</h3>
              {estaIncompleto(incidencia) && <p className="detalle__meta">Es un reporte urgente: completá los datos cuando puedas.</p>}
              <div className="confirmar__botones">
                <button type="button" className="btn btn-primary" onClick={() => abrirEstado()}>Actualizar estado</button>
                <button type="button" className="btn btn-outline" onClick={() => setEditando(true)}>
                  {estaIncompleto(incidencia) ? 'Completar datos' : 'Editar datos'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="detalle__secundario">
        <section>
          <h3>Ubicación</h3>
          {incidencia.lat !== null && incidencia.lng !== null ? (
            <>
              <MapaEmbed lat={incidencia.lat} lng={incidencia.lng} zoom={17} titulo={`Mapa de ${incidencia.ubicacion}`} className="map-frame--chico" />
              <p className="map-nota">Mapa de ejemplo de Google Maps.</p>
            </>
          ) : (
            <p className="detalle__meta">No se pudo obtener la ubicación de este reporte.</p>
          )}
        </section>

        <section>
          <h3>Historial</h3>
          <ol className="timeline">
            {incidencia.historial.map((h) => (
              <li key={`${h.estado}-${h.cuando}`} className={`timeline__item dot--${h.estado}`}>
                <span className="timeline__dot" aria-hidden="true" />
                <strong>{ESTADOS[h.estado]}</strong>
                <span className="timeline__fecha">{fechaLarga(h.cuando)}</span>
                <span className="timeline__nota">{h.nota}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <EstadoIncidenteModal incidencia={cambiandoEstado ? incidencia : null} estadoInicial={estadoInicial}
        onCerrar={() => setCambiandoEstado(false)} onGuardado={recargar} />
      <EditarIncidenteModal incidencia={editando ? incidencia : null} onCerrar={() => setEditando(false)} onGuardado={recargar} />
    </article>
  )
}
