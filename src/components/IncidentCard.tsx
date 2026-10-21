import type { Incidencia } from '../types'
import { Link } from 'react-router-dom'
import Badge from './Badge'
import { useCategorias } from '../context/CategoriasContext'
import { tiempoRelativo, textoVecinos, textoDistancia } from '../utils/formato'

// Tarjeta de incidencia: toda la tarjeta es un enlace al detalle.
interface Props {
  incidencia: Incidencia
  mostrarDistancia?: boolean
}

export default function IncidentCard({ incidencia: i, mostrarDistancia = false }: Props) {
  const { categoriaPorId } = useCategorias()
  const categoria = categoriaPorId(i.categoriaId)
  return (
    <Link to={`/app/incidencias/${i.id}`} className="incident-card">
      <span className="incident-card__icon" aria-hidden="true">{categoria?.icono}</span>
      <span className="incident-card__body">
        <span className="incident-card__title">{i.titulo}</span>
        <span className="incident-card__meta">{categoria?.nombre} · {i.ubicacion}</span>
        <span className="incident-card__foot">
          <Badge tipo={i.estado} />
          <span>{tiempoRelativo(i.creada)}</span>
          <span>👀 {textoVecinos(i.vecinos)}</span>
          {mostrarDistancia && <span>📍 {textoDistancia(i.distancia)}</span>}
        </span>
      </span>
    </Link>
  )
}
