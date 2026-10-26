import { ApiError, pedir } from './cliente'
import type { Api } from './tipos'
import type { Aviso, Categoria, Contacto, EstadisticasAdmin, GrupoAdmin, GrupoDetalle, GrupoVecinal, Incidencia, InvitacionGrupo, UsuarioAdmin } from '../types'

const filtroGrupo = (grupoId?: number) => (grupoId === undefined ? '' : `?grupoId=${grupoId}`)

// Implementación real: habla con la API del backend (ver CONTRATO.md).
export const apiReal: Api = {
  categorias: {
    listar: () => pedir<Categoria[]>('/categorias'),
  },
  incidencias: {
    listar: (grupoId) => pedir<Incidencia[]>(`/incidencias${filtroGrupo(grupoId)}`),
    listarMias: () => pedir<Incidencia[]>('/incidencias/mias'),
    obtener: async (id) => {
      try {
        return await pedir<Incidencia>(`/incidencias/${id}`)
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null
        throw error
      }
    },
    confirmar: (id) => pedir<Incidencia>(`/incidencias/${id}/confirmaciones`, { metodo: 'POST' }),
    desconfirmar: (id) => pedir<Incidencia>(`/incidencias/${id}/confirmaciones`, { metodo: 'DELETE' }),
    // Sin foto se envía JSON como siempre; con foto, multipart/form-data (campo "foto"). Ver CONTRATO.md.
    crear: ({ foto, ...datos }) => {
      if (!foto) return pedir<Incidencia>('/incidencias', { metodo: 'POST', cuerpo: datos })
      const formulario = new FormData()
      for (const [clave, valor] of Object.entries(datos)) {
        if (valor !== undefined && valor !== null) formulario.append(clave, String(valor))
      }
      formulario.append('foto', foto)
      return pedir<Incidencia>('/incidencias', { metodo: 'POST', cuerpo: formulario })
    },
    crearUrgente: (datos) => pedir<Incidencia>('/incidencias/urgentes', { metodo: 'POST', cuerpo: datos }),
    actualizar: (id, cambios) => pedir<Incidencia>(`/incidencias/${id}`, { metodo: 'PATCH', cuerpo: cambios }),
    cambiarEstado: (id, estado, nota) => pedir<Incidencia>(`/incidencias/${id}/estado`, { metodo: 'PATCH', cuerpo: { estado, nota } }),
    confirmarResuelto: (id) => pedir<Incidencia>(`/incidencias/${id}/ya-resuelto`, { metodo: 'POST' }),
  },
  avisos: {
    listar: (grupoId) => pedir<Aviso[]>(`/avisos${filtroGrupo(grupoId)}`),
    listarMios: () => pedir<Aviso[]>('/avisos/mios'),
    crear: (datos) => pedir<Aviso>('/avisos', { metodo: 'POST', cuerpo: datos }),
    actualizar: (id, cambios) => pedir<Aviso>(`/avisos/${id}`, { metodo: 'PATCH', cuerpo: cambios }),
    cerrar: (id) => pedir<Aviso>(`/avisos/${id}/cierre`, { metodo: 'POST' }),
  },
  grupos: {
    listarMios: () => pedir<GrupoVecinal[]>('/grupos/mios'),
    obtener: async (id) => {
      try {
        return await pedir<GrupoDetalle>(`/grupos/${id}`)
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null
        throw error
      }
    },
    crear: (datos) => pedir<GrupoVecinal>('/grupos', { metodo: 'POST', cuerpo: {
      name: datos.nombre, description: datos.zona,
      centerLatitude: datos.centro?.lat, centerLongitude: datos.centro?.lng, radiusMeters: datos.radioMetros,
    } }),
    invitar: (grupoId, email) =>
      pedir<InvitacionGrupo>(`/grupos/${grupoId}/invitaciones`, { metodo: 'POST', cuerpo: { email } }),
    cancelarInvitacion: (grupoId, invitacionId) =>
      pedir<void>(`/grupos/${grupoId}/invitaciones/${invitacionId}`, { metodo: 'DELETE' }),
  },
  invitaciones: {
    listarMias: () => pedir<InvitacionGrupo[]>('/invitaciones/mias'),
    responder: async (invitacionId, aceptar) =>
      (await pedir<GrupoVecinal | undefined>(`/invitaciones/${invitacionId}/respuesta`, { metodo: 'POST', cuerpo: { aceptar } })) ?? null,
  },
  admin: {
    estadisticas: () => pedir<EstadisticasAdmin>('/admin/estadisticas'),
    grupos: {
      listar: () => pedir<GrupoAdmin[]>('/admin/grupos'),
      actualizar: (id, cambios) => pedir<GrupoAdmin>(`/admin/grupos/${id}`, { metodo: 'PATCH', cuerpo: cambios }),
      eliminar: (id) => pedir<void>(`/admin/grupos/${id}`, { metodo: 'DELETE' }),
    },
    usuarios: {
      listar: () => pedir<UsuarioAdmin[]>('/admin/usuarios'),
      actualizar: (id, cambios) => pedir<UsuarioAdmin>(`/admin/usuarios/${id}`, { metodo: 'PATCH', cuerpo: cambios }),
      eliminar: (id) => pedir<void>(`/admin/usuarios/${id}`, { metodo: 'DELETE' }),
      blanquearClave: (id) => pedir<void>(`/admin/usuarios/${id}/blanqueo-clave`, { metodo: 'POST' }),
    },
    incidentes: {
      eliminar: (id) => pedir<void>(`/admin/incidencias/${id}`, { metodo: 'DELETE' }),
    },
    avisos: {
      eliminar: (id) => pedir<void>(`/admin/avisos/${id}`, { metodo: 'DELETE' }),
    },
    categorias: {
      crear: (datos) => pedir<Categoria>('/admin/categorias', { metodo: 'POST', cuerpo: datos }),
      actualizar: (id, cambios) => pedir<Categoria>(`/admin/categorias/${id}`, { metodo: 'PATCH', cuerpo: cambios }),
    },
    contactos: {
      listar: () => pedir<Contacto[]>('/admin/contactos'),
      marcarLeido: (id) => pedir<Contacto>(`/admin/contactos/${id}/leido`, { metodo: 'POST' }),
    },
  },
}
