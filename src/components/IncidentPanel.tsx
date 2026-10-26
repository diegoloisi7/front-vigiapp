import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import Badge from './Badge'
import IconoCategoria from './IconoCategoria'
import { useCategorias } from '../context/CategoriasContext'
import { estiloIncidencia } from '../data/incidentTypes'
import { fechaLarga, textoVecinos, tiempoRelativo } from '../utils/formato'
import type { Incidencia } from '../types'

// Panel con los datos del incidente seleccionado en el mapa (solo muestra lo que existe en el modelo real).
interface Props {
  incidencia: Incidencia
  onCerrar: () => void
}

export default function IncidentPanel({ incidencia: i, onCerrar }: Props) {
  const { categoriaPorId } = useCategorias()
  const estilo = estiloIncidencia(i, categoriaPorId(i.categoriaId))

  return (
    <article className="panel-incidente" aria-label={`Detalle de ${i.titulo}`} style={{ '--pin': estilo.color } as CSSProperties}>
      <header className="panel-incidente__head">
        <IconoCategoria className="panel-incidente__icono" icono={estilo.icono} />
        <div className="panel-incidente__titulo">
          <span className="panel-incidente__cat">{estilo.nombre} · #{i.id}</span>
          <h3>{i.titulo}</h3>
        </div>
        <button type="button" className="panel-incidente__cerrar" aria-label="Cerrar detalle y volver a la lista" onClick={onCerrar}>✕</button>
      </header>

      <div className="panel-incidente__tags">
        {estilo.urgente && <Badge tipo="URGENTE" />}
        <Badge tipo={i.estado} />
      </div>

      {i.fotoUrl && (
        <div className="foto-contenida">
          <img src={i.fotoUrl} alt={`Foto del incidente: ${i.titulo}`} />
        </div>
      )}

      {i.descripcion ? <p>{i.descripcion}</p> : <p className="detalle__meta">Todavía no tiene descripción.</p>}

      <dl className="panel-incidente__datos">
        <div><dt>📅 Fecha</dt><dd>{fechaLarga(i.creada)} ({tiempoRelativo(i.creada)})</dd></div>
        <div><dt>📍 Ubicación</dt><dd>{i.ubicacion}</dd></div>
        <div><dt>👀 Confirmaciones</dt><dd>{textoVecinos(i.vecinos)}</dd></div>
      </dl>

      {(i.lat === null || i.lng === null) && <p className="detalle__meta">Este reporte no tiene ubicación en el mapa.</p>}

      <Link to={`/app/incidencias/${i.id}`} className="btn btn-primary btn-ancho">Ver detalle completo</Link>
    </article>
  )
}
