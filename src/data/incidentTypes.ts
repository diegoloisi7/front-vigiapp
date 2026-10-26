import type { Categoria, Incidencia } from '../types'
import { iconoDeCategoria } from '../components/IconoCategoria'

// Configuración CENTRALIZADA de cómo se ve cada categoría en el mapa (marcadores, panel, formulario).
// El ícono sale de la propia categoría (campo `icono`, que viene de la API), así que una categoría nueva
// ya tiene ícono sin tocar código. Acá solo se define el color; si falta, se asigna uno estable por id.

export const COLOR_URGENTE = '#C62828' // reservado a pedidos de ayuda activos (igual que en el resto de la app)
export const COLOR_PROVISIONAL = '#1F4E79' // marcador del reporte que se está creando
const COLOR_SIN_CATEGORIA = '#5C6B7A'

// Colores con buen contraste sobre el mapa y sobre fondo blanco
const COLORES_CATEGORIA: Record<string, string> = {
  seguridad: '#3949AB',
  alumbrado: '#B7791F',
  baches: '#8D5524',
  arboles: '#2E7D32',
  transito: '#E65100',
  agua: '#0277BD',
  basura: '#546E7A',
  incendios: '#D84315',
  medica: '#AD1457',
  otros: '#6A5ACD',
}

// Para categorías nuevas que no estén en la tabla: color estable según el id
const PALETA_RESPALDO = ['#00838F', '#7B1FA2', '#558B2F', '#C2185B', '#4527A0', '#00695C']
function colorDeRespaldo(id: string): string {
  let suma = 0
  for (const letra of id) suma += letra.charCodeAt(0)
  return PALETA_RESPALDO[suma % PALETA_RESPALDO.length]
}

export const colorDeCategoria = (categoriaId: string): string =>
  !categoriaId ? COLOR_SIN_CATEGORIA : (COLORES_CATEGORIA[categoriaId] ?? colorDeRespaldo(categoriaId))

export interface EstiloIncidencia {
  color: string
  icono: string
  nombre: string
  urgente: boolean
}

export function iconoDeIncidencia(i: Pick<Incidencia, 'tipo'>, categoria?: Categoria): string {
  return i.tipo === 'URGENTE' ? '🆘' : iconoDeCategoria(categoria?.icono)
}

// Cómo se dibuja un incidente: color + ícono + nombre de su categoría
export function estiloIncidencia(i: Pick<Incidencia, 'categoriaId' | 'tipo' | 'estado'>, categoria?: Categoria): EstiloIncidencia {
  const urgente = i.tipo === 'URGENTE' && (i.estado === 'REPORTADO' || i.estado === 'EN_SEGUIMIENTO')
  return {
    color: urgente ? COLOR_URGENTE : colorDeCategoria(i.categoriaId),
    icono: iconoDeIncidencia(i, categoria),
    nombre: categoria?.nombre ?? 'Sin categoría',
    urgente,
  }
}
