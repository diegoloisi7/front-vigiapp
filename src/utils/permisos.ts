import type { EstadoIncidencia, GrupoVecinal, Incidencia, Usuario } from '../types'

// Lo que tienen en común los incidentes y los avisos para decidir quién puede gestionarlos
interface Publicacion {
  autorId: number
  grupoId?: number
}

// Estados en los que el incidente sigue "vivo"
export const ESTADOS_ABIERTOS: EstadoIncidencia[] = ['REPORTADO', 'EN_SEGUIMIENTO']

// Ciclo de vida: a qué estado puede pasar un incidente desde cada estado.
// Los estados finales (resuelto, descartado, expirado) no admiten más cambios.
export const TRANSICIONES: Record<EstadoIncidencia, EstadoIncidencia[]> = {
  REPORTADO: ['EN_SEGUIMIENTO', 'RESUELTO', 'DESCARTADO'],
  EN_SEGUIMIENTO: ['RESUELTO', 'DESCARTADO'],
  RESUELTO: [],
  DESCARTADO: [],
  EXPIRADO: [],
}

export const esAbierto = (i: Pick<Incidencia, 'estado'>): boolean => ESTADOS_ABIERTOS.includes(i.estado)

// Un reporte urgente que todavía está activo (es el único caso donde se usa el rojo en la lista)
export const esUrgenteActivo = (i: Incidencia): boolean => i.tipo === 'URGENTE' && esAbierto(i)

// Un reporte urgente al que todavía le faltan datos
export const estaIncompleto = (i: Incidencia): boolean =>
  i.tipo === 'URGENTE' && (!i.descripcion.trim() || !i.categoriaId)

/** Pueden cerrar o actualizar un incidente o un aviso: su creador y el owner del grupo al que pertenece. */
export function puedeGestionar(publicacion: Publicacion, usuario: Usuario | null, grupos: GrupoVecinal[]): boolean {
  if (!usuario) return false
  if (publicacion.autorId === usuario.id) return true
  return grupos.some((g) => g.id === publicacion.grupoId && g.miRol === 'OWNER')
}
