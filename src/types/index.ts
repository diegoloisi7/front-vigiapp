// Tipos del dominio. Pensados para coincidir con lo que devolverá la API del backend (Next).

/** Rol global en el sistema. */
export type Rol = 'VISITANTE' | 'VECINO' | 'ADMINISTRADOR'

/** Rol dentro de un grupo vecinal: se define por membresía, no es global. */
export type RolGrupo = 'OWNER' | 'MIEMBRO'

export interface Usuario {
  nombre: string
  apellido: string
  email: string
  comunidad: string
}

/** Grupo vecinal. El creador es el owner. */
export interface Grupo {
  id: number
  nombre: string
  zona: string
  ownerId: number
  cantidadVecinos: number
}

/** Relación usuario ↔ grupo (un usuario puede tener varios grupos). */
export interface Membresia {
  usuarioId: number
  grupoId: number
  rol: RolGrupo
}

export interface Categoria {
  id: string
  nombre: string
  icono: string
  activa: boolean
}

export type EstadoIncidencia = 'REPORTADO' | 'EN_SEGUIMIENTO' | 'RESUELTO' | 'DESCARTADO'
export type TipoIncidencia = 'URGENTE' | 'NORMAL'

export interface EventoHistorial {
  estado: EstadoIncidencia
  cuando: string // fecha ISO
  nota: string
}

export interface Incidencia {
  id: number
  titulo: string
  categoriaId: string
  estado: EstadoIncidencia
  creada: string // fecha ISO
  ubicacion: string
  lat: number
  lng: number
  descripcion: string
  vecinos: number // "vecinos que lo vieron"
  distancia: number // en metros
  esMia: boolean
  historial: EventoHistorial[]
  // Campos de las reglas de negocio nuevas: opcionales hasta conectar la API
  tipo?: TipoIncidencia
  grupoId?: number
  autorId?: number
  fechaExpiracion?: string
  vecinosYaResuelto?: number // "ya lo vi resuelto"
}

export type NivelAlerta = 'EMERGENCIA' | 'ALERTA'
export type EstadoAlerta = 'ACTIVA' | 'CERRADA'

export interface Alerta {
  id: number
  nivel: NivelAlerta
  estado: EstadoAlerta
  tipo: string
  ubicacion: string
  descripcion: string
  creada: string
  confirmaciones: number
  cierre?: string // "Resuelta" | "Falsa alarma"
  grupoId?: number
}

export type PrioridadAviso = 'NORMAL' | 'IMPORTANTE'

export interface Aviso {
  id: number
  prioridad: PrioridadAviso
  titulo: string
  cuerpo: string
  fecha: string
  vence: string | null
  grupoId?: number
}

/** Valores que puede mostrar el componente Badge. */
export type TipoBadge = EstadoIncidencia | EstadoAlerta | PrioridadAviso | EstadoInvitacion | RolGrupo | 'ACTIVO'

// Landing
export type TipoEvento = 'EMERGENCIA' | 'ALERTA' | 'INCIDENCIA' | 'AVISO' | 'RESUELTO'
export interface EventoDemo {
  tipo: TipoEvento
  titulo: string
  detalle: string
}
export interface MiembroEquipo {
  id: number
  nombre: string
  rol: string
}

// ---------- Grupos vecinales ----------
/** Grupo tal como lo ve el usuario actual: incluye su rol dentro del grupo. */
export interface GrupoVecinal extends Grupo {
  ownerNombre: string
  miRol: RolGrupo
}

export interface MiembroGrupo {
  usuarioId: number
  nombre: string
  apellido: string
  rol: RolGrupo
  desde: string // fecha ISO
}

export type EstadoInvitacion = 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA'

/** Solicitud que envía el owner a un vecino (por email) para que se sume al grupo. */
export interface InvitacionGrupo {
  id: number
  grupoId: number
  grupoNombre: string
  email: string
  estado: EstadoInvitacion
  creada: string // fecha ISO
  invitadoPor: string
}

/** Detalle de un grupo. Las invitaciones enviadas solo las recibe el owner. */
export interface GrupoDetalle extends GrupoVecinal {
  miembros: MiembroGrupo[]
  invitaciones: InvitacionGrupo[]
}
