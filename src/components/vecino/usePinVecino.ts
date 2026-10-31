import { useCallback } from 'react'
import { useCategorias } from '../../context/CategoriasContext'
import type { Incidencia } from '../../types'
import { familiaDeIncidencia, iconoDeIncidencia } from '../../utils/familias'
import { esUrgenteActivo } from '../../utils/permisos'
import { iconoSvgHtml } from './Icono'

// Pin del mapa para la vista del vecino: el mismo indicador cuadrado que el tablero.
export function usePinVecino() {
  const { categoriaPorId } = useCategorias()
  return useCallback((i: Incidencia) => {
    const categoria = categoriaPorId(i.categoriaId)
    const familia = familiaDeIncidencia(i, categoria)
    return `<span class="vg-pin vg-pin--${familia}${esUrgenteActivo(i) ? ' vg-pin--latido' : ''}">${iconoSvgHtml(iconoDeIncidencia(i, categoria), 20)}</span>`
  }, [categoriaPorId])
}
