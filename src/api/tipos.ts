import type {
  Aviso, Categoria, Contacto, EstadisticasAdmin, EstadoIncidencia, GrupoAdmin, GrupoDetalle, GrupoVecinal, Incidencia, InvitacionGrupo, PrioridadAviso, UsuarioAdmin,
} from '../types'

// Datos para crear una incidencia normal
export interface NuevaIncidencia {
  titulo: string
  categoriaId: string
  descripcion: string
  ubicacion: string // texto que se muestra (dirección o nombre del lugar)
  lat?: number | null // coordenadas elegidas en el mapa o con "usar mi ubicación"
  lng?: number | null
  foto?: File | null // imagen opcional
  grupoId?: number // grupo activo del vecino
  vigenciaDias: number // cuánto tiempo sigue vigente antes de expirar
}

// Reporte urgente: requiere la ubicación actual y un grupo activo.
export interface NuevaIncidenciaUrgente {
  lat: number
  lng: number
  grupoId: number
}

// Lo que puede modificar el creador del incidente o el owner del grupo
export interface CambiosIncidencia {
  titulo?: string
  categoriaId?: string
  descripcion?: string
  ubicacion?: string
}

// Datos para crear un aviso
export interface NuevoAviso {
  titulo: string
  cuerpo: string
  prioridad: PrioridadAviso
  vigenciaDias: number | null // null = sin vencimiento
  grupoId?: number
}

// Lo que puede modificar el creador del aviso o el owner del grupo
export interface CambiosAviso {
  titulo?: string
  cuerpo?: string
  prioridad?: PrioridadAviso
}

// Datos para crear un grupo vecinal (el creador queda como owner)
export interface NuevoGrupo {
  nombre: string
  zona: string
  centro?: { lat: number; lng: number }
  radioMetros?: number
}

// Panel de administración (solo el administrador global)
export interface CambiosGrupo {
  nombre?: string
  zona?: string
}
export interface CambiosUsuario {
  nombre?: string
  apellido?: string
  email?: string
  rol?: 'VECINO' | 'ADMINISTRADOR'
}
export interface NuevaCategoria {
  nombre: string
  icono: string
}
export interface CambiosCategoria {
  nombre?: string
  icono?: string
  activa?: boolean
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
    desconfirmar(id: number): Promise<Incidencia>
    crear(datos: NuevaIncidencia): Promise<Incidencia> // incidente normal
    crearUrgente(datos: NuevaIncidenciaUrgente): Promise<Incidencia>
    actualizar(id: number, cambios: CambiosIncidencia): Promise<Incidencia> // creador u owner del grupo
    cambiarEstado(id: number, estado: EstadoIncidencia, nota?: string): Promise<Incidencia> // creador u owner del grupo
    confirmarResuelto(id: number): Promise<Incidencia> // "Ya lo vi resuelto"
  }
  // Las alertas son los reportes urgentes (tipo URGENTE): se obtienen con incidencias.listar / listarMias
  avisos: {
    listar(grupoId?: number): Promise<Aviso[]>
    listarMios(): Promise<Aviso[]>
    crear(datos: NuevoAviso): Promise<Aviso>
    actualizar(id: number, cambios: CambiosAviso): Promise<Aviso> // creador u owner del grupo
    cerrar(id: number): Promise<Aviso> // creador u owner del grupo
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
  // El administrador global no pertenece a grupos y ve todo. Nunca ve ni define contraseñas.
  admin: {
    estadisticas(): Promise<EstadisticasAdmin>
    grupos: {
      listar(): Promise<GrupoAdmin[]>
      actualizar(id: number, cambios: CambiosGrupo): Promise<GrupoAdmin>
      eliminar(id: number): Promise<void> // borra también sus incidentes y avisos
    }
    usuarios: {
      listar(): Promise<UsuarioAdmin[]>
      actualizar(id: number, cambios: CambiosUsuario): Promise<UsuarioAdmin>
      eliminar(id: number): Promise<void> // 409 si es owner de un grupo o es el propio admin
      blanquearClave(id: number): Promise<void> // el usuario recibe un enlace para crear una contraseña nueva
    }
    incidentes: {
      eliminar(id: number): Promise<void>
    }
    avisos: {
      eliminar(id: number): Promise<void>
    }
    categorias: {
      crear(datos: NuevaCategoria): Promise<Categoria>
      actualizar(id: string, cambios: CambiosCategoria): Promise<Categoria>
    }
    contactos: {
      listar(): Promise<Contacto[]>
      marcarLeido(id: number): Promise<Contacto>
    }
  }
}
