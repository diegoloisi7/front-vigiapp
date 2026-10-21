import { ApiError, pedir } from './cliente'
import type { Api } from './tipos'
import type { Alerta, Aviso, Categoria, GrupoDetalle, GrupoVecinal, Incidencia, InvitacionGrupo } from '../types'

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
    // TODO: la foto todavía no se envía; falta definir con el back cómo se sube (multipart o URL).
    crear: (datos) => pedir<Incidencia>('/incidencias', { metodo: 'POST', cuerpo: datos }),
  },
  alertas: {
    listar: (grupoId) => pedir<Alerta[]>(`/alertas${filtroGrupo(grupoId)}`),
  },
  avisos: {
    listar: (grupoId) => pedir<Aviso[]>(`/avisos${filtroGrupo(grupoId)}`),
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
    crear: (datos) => pedir<GrupoVecinal>('/grupos', { metodo: 'POST', cuerpo: datos }),
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
}
