import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../../api'
import { mensajeDeError } from '../../api/cliente'
import { useCategorias } from '../../context/CategoriasContext'
import { useConsulta } from '../../hooks/useConsulta'
import Badge from '../../components/Badge'
import EmptyState from '../../components/EmptyState'
import EstadoConsulta from '../../components/EstadoConsulta'
import MapaEmbed from '../../components/MapaEmbed'
import { ESTADOS } from '../../data/mock'
import { fechaLarga, textoVecinos } from '../../utils/formato'

export default function DetalleIncidencia() {
  const { id } = useParams()
  const { categoriaPorId } = useCategorias()
  const { datos: incidencia, cargando, error, recargar } = useConsulta(
    () => api.incidencias.obtener(Number(id)),
    [id],
  )
  const [confirmado, setConfirmado] = useState(false) // ya confirmó en esta visita
  const [enviando, setEnviando] = useState(false)
  const [errorConfirmar, setErrorConfirmar] = useState('')

  // "Yo también lo vi": avisa a la API y recarga el contador real
  async function confirmar() {
    if (!incidencia) return
    setEnviando(true)
    setErrorConfirmar('')
    try {
      await api.incidencias.confirmar(incidencia.id)
      setConfirmado(true)
      recargar()
    } catch (e) {
      setErrorConfirmar(mensajeDeError(e))
    } finally {
      setEnviando(false)
    }
  }

  if (cargando || error) {
    return <EstadoConsulta cargando={cargando} error={error} onReintentar={recargar}>{null}</EstadoConsulta>
  }

  if (!incidencia) {
    return (
      <EmptyState icono="🧭" titulo="No encontramos esa incidencia" texto="Puede que se haya eliminado o que el enlace sea incorrecto.">
        <Link to="/app/mapa" className="btn btn-primary">Volver al mapa</Link>
      </EmptyState>
    )
  }

  const categoria = categoriaPorId(incidencia.categoriaId)
  const abierta = incidencia.estado === 'REPORTADO' || incidencia.estado === 'EN_SEGUIMIENTO'

  return (
    <article className="detalle">
      <Link to="/app/mapa" className="volver">← Volver al mapa</Link>

      <div className="detalle__principal">
        {/* Todavía no hay fotos reales: se muestra un marcador con el ícono de la categoría */}
        <div className="foto" role="img" aria-label="Foto no disponible en este ejemplo">
          <span aria-hidden="true">{categoria?.icono}</span>
        </div>

        <div className="detalle__info">
          <div className="detalle__tags">
            <span className="tag-categoria"><span aria-hidden="true">{categoria?.icono}</span> {categoria?.nombre}</span>
            <Badge tipo={incidencia.estado} />
          </div>
          <h2>{incidencia.titulo}</h2>
          <p className="detalle__meta">📅 {fechaLarga(incidencia.creada)}</p>
          <p className="detalle__meta">📍 {incidencia.ubicacion}</p>
          <p>{incidencia.descripcion}</p>

          <div className="confirmar">
            <p className="confirmar__cuenta">👀 <strong>{textoVecinos(incidencia.vecinos)}</strong></p>
            {abierta ? (
              <button type="button" className="btn btn-primary" disabled={confirmado || enviando} onClick={confirmar}>
                {confirmado ? 'Ya lo confirmaste ✓' : enviando ? 'Enviando…' : 'Yo también lo vi'}
              </button>
            ) : (
              <p className="detalle__meta">Esta incidencia ya está cerrada, no admite más confirmaciones.</p>
            )}
            {confirmado && <p role="status" className="detalle__meta">Gracias, sumaste tu confirmación.</p>}
            {errorConfirmar && <p className="campo__error" role="alert">{errorConfirmar}</p>}
          </div>
        </div>
      </div>

      <div className="detalle__secundario">
        <section>
          <h3>Ubicación</h3>
          <MapaEmbed lat={incidencia.lat} lng={incidencia.lng} zoom={17} titulo={`Mapa de ${incidencia.ubicacion}`} className="map-frame--chico" />
          <p className="map-nota">Mapa de ejemplo de Google Maps.</p>
        </section>

        <section>
          <h3>Historial</h3>
          <ol className="timeline">
            {incidencia.historial.map((h) => (
              <li key={h.estado} className={`timeline__item dot--${h.estado}`}>
                <span className="timeline__dot" aria-hidden="true" />
                <strong>{ESTADOS[h.estado]}</strong>
                <span className="timeline__fecha">{fechaLarga(h.cuando)}</span>
                <span className="timeline__nota">{h.nota}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </article>
  )
}
