// Tipos del dominio compartidos por el cliente y el contrato NestJS.

/** Rol global en el sistema. */
export type Rol = 'VISITANTE' | 'VECINO' | 'ADMINISTRADOR'

/** Rol dentro de un grupo vecinal: se define por membresía, no es global. */
export type RolGrupo = 'OWNER' | 'MIEMBRO'

export interface Usuario {
  id: number
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
  centro?: { lat: number; lng: number }
  radioMetros?: number
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

export type EstadoIncidencia = 'REPORTADO' | 'EN_SEGUIMIENTO' | 'RESUELTO' | 'DESCARTADO' | 'EXPIRADO'
export type TipoIncidencia = 'URGENTE' | 'NORMAL'

export interface EventoHistorial {
  estado: EstadoIncidencia
  cuando: string // fecha ISO
  nota: string
}

export interface Incidencia {
  id: number
  titulo: string
  categoriaId: string // '' = sin categoría (reporte urgente todavía sin completar)
  estado: EstadoIncidencia
  creada: string // fecha ISO
  ubicacion: string
  lat: number | null // null si no se pudo obtener la ubicación
  lng: number | null
  descripcion: string
  fotoUrl?: string | null // foto opcional que subió el autor; null/ausente = sin foto
  vecinos: number // "vecinos que lo vieron"
  distancia: number // en metros
  historial: EventoHistorial[]
  tipo: TipoIncidencia // URGENTE (sin campos obligatorios) o NORMAL
  autorId: number // creador: junto con el owner del grupo, puede cerrarlo o actualizarlo
  grupoId?: number
  fechaExpiracion: string // al vencer, si sigue abierto pasa a EXPIRADO
  vecinosYaResuelto: number // "ya lo vi resuelto"
  // Lo que el usuario actual ya hizo (lo informa la API)
  yoConfirme?: boolean
  yoMarqueResuelto?: boolean
}

export type PrioridadAviso = 'NORMAL' | 'IMPORTANTE'

export type EstadoAviso = 'VIGENTE' | 'CERRADO' | 'EXPIRADO'

export interface Aviso {
  id: number
  grupoId?: number
  prioridad: PrioridadAviso
  titulo: string
  cuerpo: string
  fecha: string // creación
  vence: string | null // al vencer pasa a EXPIRADO
  estado: EstadoAviso
  autorId: number // creador: junto con el owner del grupo, puede editarlo o cerrarlo
  autorNombre: string
}

/** Valores que puede mostrar el componente Badge. */
export type TipoBadge = EstadoIncidencia | EstadoAviso | PrioridadAviso | EstadoInvitacion | RolGrupo | 'ACTIVO' | 'URGENTE' | 'VECINO' | 'ADMINISTRADOR' | 'NUEVO' | 'LEIDO' | 'ACTIVA' | 'INACTIVA'

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

/** Invitación interna que el owner crea para un vecino identificado por email. */
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

// ---------- Administración (admin global) ----------
export interface UsuarioAdmin {
  id: number
  nombre: string
  apellido: string
  email: string
  rol: 'VECINO' | 'ADMINISTRADOR'
  creado: string // fecha ISO
  cantidadGrupos: number
}

export interface GrupoAdmin {
  id: number
  nombre: string
  zona: string
  ownerId: number
  ownerNombre: string
  cantidadVecinos: number
  cantidadIncidentes: number
  cantidadAvisos: number
  creado: string // fecha ISO
}

export interface Contacto {
  id: number
  nombre: string
  email: string
  asunto: string
  mensaje: string
  fecha: string // fecha ISO
  leido: boolean
}

export interface EstadisticasAdmin {
  totalGrupos: number
  totalUsuarios: number
  totalVecinos: number
  usuariosNuevos30d: number
  urgentesActivos: number
  avisosVigentes: number
  contactosSinLeer: number
  incidentesPorEstado: Record<EstadoIncidencia, number>
  ultimos7dias: { etiqueta: string; cantidad: number }[]
  porCategoria: { categoriaId: string; nombre: string; icono: string; cantidad: number }[]
  topGrupos: { grupoId: number; nombre: string; vecinos: number; incidentes: number }[]
}
