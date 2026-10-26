import { Link } from 'react-router-dom'
import Badge from './Badge'
import IconoCategoria from './IconoCategoria'
import { useCategorias } from '../context/CategoriasContext'
import { iconoDeIncidencia } from '../data/incidentTypes'
import { esUrgenteActivo } from '../utils/permisos'
import { tiempoRelativo, textoVecinos, textoDistancia } from '../utils/formato'
import type { Incidencia } from '../types'

interface Props {
  incidencia: Incidencia
  mostrarDistancia?: boolean
}

// Tarjeta de incidente: toda la tarjeta es un enlace al detalle.
// Un reporte urgente activo se marca en rojo (pedido de ayuda activo).
export default function IncidentCard({ incidencia: i, mostrarDistancia = false }: Props) {
  const { categoriaPorId } = useCategorias()
  const categoria = categoriaPorId(i.categoriaId)
  const urgente = esUrgenteActivo(i)

  return (
    <Link to={`/app/incidencias/${i.id}`} className={`incident-card ${urgente ? 'incident-card--urgente' : ''}`}>
      <span className={`incident-card__icon ${urgente ? 'incident-card__icon--urgente' : ''}`} aria-hidden="true">
        <IconoCategoria icono={iconoDeIncidencia(i, categoria)} />
      </span>
      <span className="incident-card__body">
        <span className="incident-card__title">{i.titulo}</span>
        <span className="incident-card__meta">{categoria?.nombre ?? 'Sin categoría'} · {i.ubicacion}</span>
        <span className="incident-card__foot">
          {urgente && <Badge tipo="URGENTE" />}
          <Badge tipo={i.estado} />
          <span>{tiempoRelativo(i.creada)}</span>
          <span>👀 {textoVecinos(i.vecinos)}</span>
          {mostrarDistancia && <span>📍 {textoDistancia(i.distancia)}</span>}
        </span>
      </span>
    </Link>
  )
}
