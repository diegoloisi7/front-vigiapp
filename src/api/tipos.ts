import type { Alerta, Aviso, Categoria, GrupoDetalle, GrupoVecinal, Incidencia, InvitacionGrupo } from '../types'

// Datos para crear una incidencia normal
export interface NuevaIncidencia {
  titulo: string
  categoriaId: string
  descripcion: string
  ubicacion: string
  grupoId?: number // grupo activo del vecino
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
    crear(datos: NuevaIncidencia): Promise<Incidencia>
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
