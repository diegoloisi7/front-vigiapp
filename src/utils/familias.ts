import type { NombreIcono } from '../components/vecino/Icono'
import type { Categoria, Incidencia } from '../types'
import { normalizar } from './formato'

// Familias de incidente: cada una tiene su color (ver tokens.css) y su ícono.
export type Familia = 'emergencia' | 'seguridad' | 'servicios' | 'comunidad'

export const FAMILIAS: Record<Familia, { nombre: string; icono: NombreIcono }> = {
  emergencia: { nombre: 'Emergencias', icono: 'emergencia' },
  seguridad: { nombre: 'Seguridad', icono: 'seguridad' },
  servicios: { nombre: 'Servicios', icono: 'servicios' },
  comunidad: { nombre: 'Comunidad', icono: 'comunidad' },
}

export const ORDEN_FAMILIAS: Familia[] = ['emergencia', 'seguridad', 'servicios', 'comunidad']

// Las categorías las crea el admin, así que la familia se deduce del nombre.
// Si ninguna palabra coincide, va a "servicios" (la mayoría de los reclamos del barrio).
const PALABRAS: [Familia, string[]][] = [
  ['emergencia', ['incendio', 'fuego', 'humo', 'emergencia', 'medic', 'herido', 'accidente', 'inundacion', 'derrumbe']],
  ['seguridad', ['segur', 'robo', 'hurto', 'delito', 'sospech', 'vandal', 'arrebato', 'violencia', 'intrus', 'asalto']],
  ['servicios', ['alumbr', 'luz', 'agua', 'cloaca', 'bache', 'calle', 'vereda', 'basura', 'residuo', 'arbol', 'poda',
    'transito', 'semaforo', 'gas', 'electric', 'corte']],
  ['comunidad', ['comunidad', 'aviso', 'reunion', 'evento', 'mascota', 'perdid', 'ruido', 'vecin', 'otro']],
]

export function familiaDeCategoria(nombre?: string | null): Familia {
  const texto = normalizar(nombre ?? '')
  if (!texto) return 'servicios'
  for (const [familia, palabras] of PALABRAS) {
    if (palabras.some((p) => texto.includes(p))) return familia
  }
  return 'servicios'
}

// Un reporte urgente (pedido de ayuda) siempre es una emergencia, tenga o no categoría.
export function familiaDeIncidencia(incidencia: Incidencia, categoria?: Categoria): Familia {
  if (incidencia.tipo === 'URGENTE') return 'emergencia'
  return familiaDeCategoria(categoria?.nombre)
}

// Indicador de cada incidente: el ícono de su categoría (un farol para alumbrado, una gota para agua…).
// Como las categorías las crea el admin, se deduce del nombre; si no coincide, va el ícono de la familia.
const ICONOS_CATEGORIA: [NombreIcono, string[]][] = [
  ['llama', ['incendio', 'fuego', 'humo']],
  ['botiquin', ['medic', 'herido', 'salud', 'ambulancia']],
  ['farol', ['alumbr', 'luz', 'farol', 'luminaria']],
  ['gota', ['agua', 'cloaca', 'inund', 'pérdida de agua', 'perdida de agua']],
  ['arbol', ['arbol', 'poda', 'rama']],
  ['tacho', ['basura', 'residuo', 'contenedor']],
  ['semaforo', ['transito', 'semaforo', 'senal']],
  ['cono', ['bache', 'calle', 'vereda', 'obra', 'pozo']],
  ['seguridad', ['segur', 'robo', 'hurto', 'delito', 'sospech', 'vandal', 'arrebato', 'asalto']],
]

export function iconoDeCategoria(nombre?: string | null): NombreIcono {
  const texto = normalizar(nombre ?? '')
  for (const [icono, palabras] of ICONOS_CATEGORIA) {
    if (palabras.some((p) => texto.includes(p))) return icono
  }
  return FAMILIAS[familiaDeCategoria(nombre)].icono
}

export function iconoDeIncidencia(incidencia: Incidencia, categoria?: Categoria): NombreIcono {
  if (incidencia.tipo === 'URGENTE') return 'sos'
  return iconoDeCategoria(categoria?.nombre)
}

// Nombre visible de la categoría de un incidente (un pedido de ayuda puede no tener categoría todavía)
export function etiquetaDeIncidencia(incidencia: Incidencia, categoria?: Categoria): string {
  return categoria?.nombre ?? (incidencia.tipo === 'URGENTE' ? 'Pedido de ayuda' : 'Sin categoría')
}
