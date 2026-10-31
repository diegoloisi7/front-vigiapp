import { ApiError, pedir } from './cliente'
import { API_URL } from './config'
import type { Api } from './tipos'
import type { Aviso, Categoria, Contacto, EstadisticasAdmin, GrupoAdmin, GrupoDetalle, GrupoVecinal, Incidencia, InvitacionGrupo, UsuarioAdmin } from '../types'

const filtroGrupo = (grupoId?: number) => (grupoId === undefined ? '' : `?grupoId=${grupoId}`)

// El DTO y las columnas DECIMAL del grupo admiten hasta siete decimales.
const coordenadaGrupo = (valor: number) => Number(valor.toFixed(7))

// La foto es un recurso protegido por la cookie de sesión del mismo backend configurado.
const incidenciaConFotoLocal = (incidencia: Incidencia): Incidencia => ({
  ...incidencia,
  fotoUrl: incidencia.fotoUrl ? `${API_URL}/incidencias/${incidencia.id}/foto` : null,
})
const pedirIncidencia = async (ruta: string, opciones?: Parameters<typeof pedir>[1]) =>
  incidenciaConFotoLocal(await pedir<Incidencia>(ruta, opciones))
const pedirIncidencias = async (ruta: string) =>
  (await pedir<Incidencia[]>(ruta)).map(incidenciaConFotoLocal)

// Implementación real: habla con la API del backend (ver CONTRATO.md).
export const apiReal: Api = {
  categorias: {
    listar: () => pedir<Categoria[]>('/categorias'),
  },
  incidencias: {
    listar: (grupoId) => pedirIncidencias(`/incidencias${filtroGrupo(grupoId)}`),
    listarMias: () => pedirIncidencias('/incidencias/mias'),
    obtener: async (id) => {
      try {
        return await pedirIncidencia(`/incidencias/${id}`)
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null
        throw error
      }
    },
    confirmar: (id) => pedirIncidencia(`/incidencias/${id}/confirmaciones`, { metodo: 'POST' }),
    desconfirmar: (id) => pedirIncidencia(`/incidencias/${id}/confirmaciones`, { metodo: 'DELETE' }),
    // Sin foto se envía JSON como siempre; con foto, multipart/form-data (campo "foto"). Ver CONTRATO.md.
    crear: ({ foto, ...datos }) => {
      if (!foto) return pedirIncidencia('/incidencias', { metodo: 'POST', cuerpo: datos })
      const formulario = new FormData()
      for (const [clave, valor] of Object.entries(datos)) {
        if (valor !== undefined && valor !== null) formulario.append(clave, String(valor))
      }
      formulario.append('foto', foto)
      return pedirIncidencia('/incidencias', { metodo: 'POST', cuerpo: formulario })
    },
    crearUrgente: (datos) => pedirIncidencia('/incidencias/urgentes', { metodo: 'POST', cuerpo: datos }),
    actualizar: (id, cambios) => pedirIncidencia(`/incidencias/${id}`, { metodo: 'PATCH', cuerpo: cambios }),
    cambiarEstado: (id, estado, nota) => pedirIncidencia(`/incidencias/${id}/estado`, { metodo: 'PATCH', cuerpo: { estado, nota } }),
    confirmarResuelto: (id) => pedirIncidencia(`/incidencias/${id}/ya-resuelto`, { metodo: 'POST' }),
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
      centerLatitude: datos.centro && coordenadaGrupo(datos.centro.lat),
      centerLongitude: datos.centro && coordenadaGrupo(datos.centro.lng),
      radiusMeters: datos.radioMetros,
    } }),
    // Solo se envían los campos que cambiaron (los undefined no viajan en el JSON)
    actualizar: async (id, cambios) => {
      await pedir(`/grupos/${id}`, { metodo: 'PATCH', cuerpo: {
        name: cambios.nombre, description: cambios.zona,
        centerLatitude: cambios.centro && coordenadaGrupo(cambios.centro.lat),
        centerLongitude: cambios.centro && coordenadaGrupo(cambios.centro.lng),
        radiusMeters: cambios.radioMetros,
      } })
    },
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
