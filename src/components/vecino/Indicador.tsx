import { useCategorias } from '../../context/CategoriasContext'
import type { Categoria, Incidencia } from '../../types'
import { familiaDeCategoria, familiaDeIncidencia, iconoDeCategoria, iconoDeIncidencia, type Familia } from '../../utils/familias'
import Icono, { type NombreIcono } from './Icono'

interface Props {
  familia: Familia
  icono: NombreIcono
  tamano?: number
  className?: string
}

// Indicador del vecino: cuadrado del color del tipo con el ícono de la categoría (decorativo).
export default function Indicador({ familia, icono, tamano = 22, className = '' }: Props) {
  return (
    <span className={`vg-indicador vg-tile--${familia}${className ? ` ${className}` : ''}`} aria-hidden="true">
      <Icono nombre={icono} tamano={tamano} />
    </span>
  )
}

export function IndicadorCategoria({ categoria, tamano, className }: { categoria?: Categoria | null; tamano?: number; className?: string }) {
  return <Indicador familia={familiaDeCategoria(categoria?.nombre)} icono={iconoDeCategoria(categoria?.nombre)} tamano={tamano} className={className} />
}

export function IndicadorIncidencia({ incidencia, tamano, className }: { incidencia: Incidencia; tamano?: number; className?: string }) {
  const { categoriaPorId } = useCategorias()
  const categoria = categoriaPorId(incidencia.categoriaId)
  return <Indicador familia={familiaDeIncidencia(incidencia, categoria)} icono={iconoDeIncidencia(incidencia, categoria)} tamano={tamano} className={className} />
}
