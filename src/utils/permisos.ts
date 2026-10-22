import type { EstadoIncidencia, GrupoVecinal, Incidencia, Usuario } from '../types'

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

// Con esta cantidad de "ya lo vi resuelto" se le sugiere al owner cerrarlo
export const UMBRAL_YA_RESUELTO = 3

export const esAbierto = (i: Pick<Incidencia, 'estado'>): boolean => ESTADOS_ABIERTOS.includes(i.estado)

// Un reporte urgente que todavía está activo (es el único caso donde se usa el rojo en la lista)
export const esUrgenteActivo = (i: Incidencia): boolean => i.tipo === 'URGENTE' && esAbierto(i)

// Un reporte urgente al que todavía le faltan datos
export const estaIncompleto = (i: Incidencia): boolean =>
  i.tipo === 'URGENTE' && (!i.descripcion.trim() || !i.categoriaId)

/** Pueden cerrar o actualizar un incidente: su creador y el owner del grupo al que pertenece. */
export function puedeGestionar(incidencia: Incidencia, usuario: Usuario | null, grupos: GrupoVecinal[]): boolean {
  if (!usuario) return false
  if (incidencia.autorId === usuario.id) return true
  return grupos.some((g) => g.id === incidencia.grupoId && g.miRol === 'OWNER')
}
