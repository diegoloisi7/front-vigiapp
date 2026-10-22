import type { Alerta, Aviso, Categoria, EstadoIncidencia, GrupoDetalle, GrupoVecinal, Incidencia, InvitacionGrupo } from '../types'

// Datos para crear una incidencia normal
export interface NuevaIncidencia {
  titulo: string
  categoriaId: string
  descripcion: string
  ubicacion: string
  grupoId?: number // grupo activo del vecino
  vigenciaDias: number // cuánto tiempo sigue vigente antes de expirar
}

// Reporte urgente: sin campos obligatorios. Toma la ubicación en vivo (null si no se pudo obtener).
export interface NuevaIncidenciaUrgente {
  lat: number | null
  lng: number | null
  grupoId?: number
}

// Lo que puede modificar el creador del incidente o el owner del grupo
export interface CambiosIncidencia {
  titulo?: string
  categoriaId?: string
  descripcion?: string
  ubicacion?: string
}

// Datos para crear un grupo vecinal (el creador queda como owner)
export interface NuevoGrupo {
  nombre: string
  zona: string
}

// Contrato de la API. Lo cumplen tanto la implementación real (fetch) como la de ejemplo (mock).
// Los listados reciben el grupo activo; sin grupoId (administrador) devuelven todo.
export interface Api {
  categorias: {
    listar(): Promise<Categoria[]>
  }
  incidencias: {
    listar(grupoId?: number): Promise<Incidencia[]>
    listarMias(): Promise<Incidencia[]>
    obtener(id: number): Promise<Incidencia | null> // null si no existe
    confirmar(id: number): Promise<Incidencia> // "Yo también lo vi"
    crear(datos: NuevaIncidencia): Promise<Incidencia> // incidente normal
    crearUrgente(datos: NuevaIncidenciaUrgente): Promise<Incidencia>
    actualizar(id: number, cambios: CambiosIncidencia): Promise<Incidencia> // creador u owner del grupo
    cambiarEstado(id: number, estado: EstadoIncidencia, nota?: string): Promise<Incidencia> // creador u owner del grupo
    confirmarResuelto(id: number): Promise<Incidencia> // "Ya lo vi resuelto"
  }
  alertas: {
    listar(grupoId?: number): Promise<Alerta[]>
  }
  avisos: {
    listar(grupoId?: number): Promise<Aviso[]>
  }
  grupos: {
    listarMios(): Promise<GrupoVecinal[]>
    obtener(id: number): Promise<GrupoDetalle | null> // null si no existe; 403 si no pertenece
    crear(datos: NuevoGrupo): Promise<GrupoVecinal>
    invitar(grupoId: number, email: string): Promise<InvitacionGrupo> // solo owner
    cancelarInvitacion(grupoId: number, invitacionId: number): Promise<void> // solo owner
  }
  invitaciones: {
    listarMias(): Promise<InvitacionGrupo[]> // pendientes recibidas por el usuario
    responder(invitacionId: number, aceptar: boolean): Promise<GrupoVecinal | null> // devuelve el grupo si aceptó
  }
}
