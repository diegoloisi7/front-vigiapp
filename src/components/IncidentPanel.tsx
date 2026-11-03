import { Link } from 'react-router-dom'
import Badge from './Badge'
import { useCategorias } from '../context/CategoriasContext'
import { esUrgenteActivo } from '../utils/permisos'
import { etiquetaDeIncidencia, familiaDeIncidencia } from '../utils/familias'
import Icono from './vecino/Icono'
import { IndicadorIncidencia } from './vecino/Indicador'
import { fechaLarga, textoVecinos, tiempoRelativo } from '../utils/formato'
import type { Incidencia } from '../types'

// Panel con los datos del incidente seleccionado en el mapa (solo muestra lo que existe en el modelo real).
interface Props {
  incidencia: Incidencia
  onCerrar: () => void
}

export default function IncidentPanel({ incidencia: i, onCerrar }: Props) {
  const { categoriaPorId } = useCategorias()
  const categoria = categoriaPorId(i.categoriaId)
  const familia = familiaDeIncidencia(i, categoria)

  return (
    <article className={`panel-incidente vg-tile--${familia}`} aria-label={`Detalle de ${i.titulo}`}>
      <header className="panel-incidente__head">
        <IndicadorIncidencia incidencia={i} tamano={26} className="panel-incidente__icono" />
        <div className="panel-incidente__titulo">
          <span className="panel-incidente__cat">{etiquetaDeIncidencia(i, categoria)}</span>
          <h3>{i.titulo}</h3>
        </div>
        <button type="button" className="panel-incidente__cerrar" aria-label="Cerrar detalle y volver a la lista" onClick={onCerrar}>✕</button>
      </header>

      <div className="panel-incidente__tags">
        {esUrgenteActivo(i) && <Badge tipo="URGENTE" />}
        <Badge tipo={i.estado} />
      </div>

      {i.fotoUrl && (
        <div className="foto-contenida">
          <img src={i.fotoUrl} alt={`Foto del incidente: ${i.titulo}`} />
        </div>
      )}

      {i.descripcion ? <p>{i.descripcion}</p> : <p className="detalle__meta">Todavía no tiene descripción.</p>}

      <dl className="panel-incidente__datos">
        <div><dt><Icono nombre="reloj" tamano={16} />Fecha</dt><dd>{fechaLarga(i.creada)} ({tiempoRelativo(i.creada)})</dd></div>
        <div><dt><Icono nombre="pin" tamano={16} />Ubicación</dt><dd>{i.ubicacion}</dd></div>
        <div><dt><Icono nombre="ojo" tamano={16} />Confirmaciones</dt><dd>{textoVecinos(i.vecinos)}</dd></div>
      </dl>

      {(i.lat === null || i.lng === null) && <p className="detalle__meta">Este reporte no tiene ubicación en el mapa.</p>}

      <Link to={`/app/incidencias/${i.id}`} className="btn btn-primary btn-ancho">Ver detalle completo</Link>
    </article>
  )
}
