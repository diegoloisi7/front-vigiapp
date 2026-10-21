import { ApiError } from './cliente'
import type { Api } from './tipos'
import { ALERTAS_MOCK, AVISOS_MOCK, CATEGORIAS_MOCK, CENTRO_MAPA, INCIDENCIAS_MOCK, USUARIOS_MOCK } from '../data/mock'
import type { GrupoVecinal, Incidencia, InvitacionGrupo, MiembroGrupo, RolGrupo } from '../types'

// Implementación de ejemplo: responde con los datos de data/mock.ts y una demora simulada.
// Guarda los cambios en memoria (se pierden al recargar la página).
const esperar = (ms = 300) => new Promise<void>((resolver) => setTimeout(resolver, ms))
const haceMin = (min: number) => new Date(Date.now() - min * 60000).toISOString()
const copia = <T extends object>(dato: T): T => ({ ...dato })
const deGrupo = <T extends { grupoId?: number }>(lista: T[], grupoId?: number) =>
  grupoId === undefined ? lista : lista.filter((x) => x.grupoId === grupoId)

// ---------- Incidencias ----------
const incidencias: Incidencia[] = INCIDENCIAS_MOCK.map(copia)

// ---------- Grupos ----------
interface GrupoInterno {
  id: number
  nombre: string
  zona: string
  miembros: MiembroGrupo[]
  invitaciones: InvitacionGrupo[]
}

const YO = 1 // id del usuario de prueba
const MIS_DATOS = USUARIOS_MOCK.VECINO
const CLAVE_NUEVO = 'vecinal_vecino_nuevo'

export function leerVecinoNuevo(): boolean {
  try { return localStorage.getItem(CLAVE_NUEVO) === '1' } catch { return false }
}

const miembro = (usuarioId: number, nombre: string, apellido: string, rol: RolGrupo, diasAtras: number): MiembroGrupo =>
  ({ usuarioId, nombre, apellido, rol, desde: haceMin(diasAtras * 1440) })
const yoComo = (rol: RolGrupo, diasAtras: number) => miembro(YO, MIS_DATOS.nombre, MIS_DATOS.apellido, rol, diasAtras)

// Datos iniciales: soy miembro del grupo 1, owner del 2 y tengo una invitación pendiente al 3.
// Con "vecino nuevo" no pertenezco a ningún grupo (solo tengo la invitación).
function construirGrupos(vecinoNuevo: boolean): GrupoInterno[] {
  const alamos: GrupoInterno = {
    id: 1, nombre: 'Barrio Los Álamos', zona: 'Manzanas 1 a 12', invitaciones: [],
    miembros: [
      miembro(10, 'Carlos', 'Ruiz', 'OWNER', 200),
      ...(vecinoNuevo ? [] : [yoComo('MIEMBRO', 90)]),
      miembro(11, 'Ana', 'Pérez', 'MIEMBRO', 80),
      miembro(12, 'Pedro', 'Gómez', 'MIEMBRO', 60),
      miembro(13, 'Marta', 'Silva', 'MIEMBRO', 30),
      miembro(14, 'Julián', 'Torres', 'MIEMBRO', 10),
    ],
  }
  const palmas: GrupoInterno = {
    id: 2, nombre: 'Complejo Las Palmas', zona: 'Torres A y B',
    miembros: [yoComo('OWNER', 20), miembro(15, 'Marcos', 'Díaz', 'MIEMBRO', 12), miembro(16, 'Sofía', 'Rojas', 'MIEMBRO', 5)],
    invitaciones: [
      { id: 1, grupoId: 2, grupoNombre: 'Complejo Las Palmas', email: 'marcos@ejemplo.com', estado: 'ACEPTADA', creada: haceMin(12 * 1440), invitadoPor: `${MIS_DATOS.nombre} ${MIS_DATOS.apellido}` },
      { id: 2, grupoId: 2, grupoNombre: 'Complejo Las Palmas', email: 'vecina.nueva@ejemplo.com', estado: 'PENDIENTE', creada: haceMin(2 * 1440), invitadoPor: `${MIS_DATOS.nombre} ${MIS_DATOS.apellido}` },
    ],
  }
  const pinos: GrupoInterno = {
    id: 3, nombre: 'Manzana 7 Seguridad', zona: 'Calle Los Pinos',
    miembros: [miembro(17, 'Elena', 'Vega', 'OWNER', 150), miembro(18, 'Raúl', 'Mora', 'MIEMBRO', 100)],
    invitaciones: [
      { id: 3, grupoId: 3, grupoNombre: 'Manzana 7 Seguridad', email: MIS_DATOS.email, estado: 'PENDIENTE', creada: haceMin(300), invitadoPor: 'Elena Vega' },
    ],
  }
  return vecinoNuevo ? [alamos, pinos] : [alamos, palmas, pinos]
}

let grupos = construirGrupos(leerVecinoNuevo())
let siguienteGrupo = 4
let siguienteInvitacion = 4

// Herramienta de prueba: reinicia los grupos como "vecino nuevo" (sin grupo) o como vecino con grupos
export function simularVecinoNuevo(valor: boolean) {
  grupos = construirGrupos(valor)
  try { localStorage.setItem(CLAVE_NUEVO, valor ? '1' : '0') } catch { /* sin almacenamiento: se ignora */ }
}

const miRol = (g: GrupoInterno) => g.miembros.find((m) => m.usuarioId === YO)?.rol

function aVista(g: GrupoInterno): GrupoVecinal {
  const owner = g.miembros.find((m) => m.rol === 'OWNER')!
  return {
    id: g.id, nombre: g.nombre, zona: g.zona,
    ownerId: owner.usuarioId, ownerNombre: `${owner.nombre} ${owner.apellido}`,
    cantidadVecinos: g.miembros.length, miRol: miRol(g) ?? 'MIEMBRO',
  }
}

// Devuelve el grupo si existe y soy owner; si no, lanza el error que daría la API
function grupoComoOwner(id: number): GrupoInterno {
  const g = grupos.find((x) => x.id === id)
  if (!g) throw new ApiError('No encontramos ese grupo.', 404)
  if (miRol(g) !== 'OWNER') throw new ApiError('Solo el owner del grupo puede hacer esto.', 403)
  return g
}

export const apiMock: Api = {
  categorias: {
    listar: async () => { await esperar(150); return CATEGORIAS_MOCK.map(copia) },
  },
  incidencias: {
    listar: async (grupoId) => { await esperar(); return deGrupo(incidencias, grupoId).map(copia) },
    listarMias: async () => { await esperar(); return incidencias.filter((i) => i.esMia).map(copia) },
    obtener: async (id) => {
      await esperar()
      const encontrada = incidencias.find((i) => i.id === id)
      return encontrada ? copia(encontrada) : null
    },
    confirmar: async (id) => {
      await esperar()
      const encontrada = incidencias.find((i) => i.id === id)
      if (!encontrada) throw new ApiError('No encontramos esa incidencia.', 404)
      if (encontrada.estado === 'RESUELTO' || encontrada.estado === 'DESCARTADO') {
        throw new ApiError('La incidencia ya está cerrada.', 409)
      }
      encontrada.vecinos += 1
      return copia(encontrada)
    },
    crear: async (datos) => {
      await esperar(500)
      const ahora = new Date().toISOString()
      const nueva: Incidencia = {
        id: Math.max(0, ...incidencias.map((i) => i.id)) + 1,
        grupoId: datos.grupoId,
        titulo: datos.titulo,
        categoriaId: datos.categoriaId,
        estado: 'REPORTADO',
        creada: ahora,
        ubicacion: datos.ubicacion,
        lat: CENTRO_MAPA.lat + (Math.random() - 0.5) * 0.004,
        lng: CENTRO_MAPA.lng + (Math.random() - 0.5) * 0.004,
        descripcion: datos.descripcion,
        vecinos: 1,
        distancia: 0,
        esMia: true,
        historial: [{ estado: 'REPORTADO', cuando: ahora, nota: 'Reportado por vos' }],
      }
      incidencias.unshift(nueva)
      return copia(nueva)
    },
  },
  alertas: {
    listar: async (grupoId) => { await esperar(); return deGrupo(ALERTAS_MOCK, grupoId).map(copia) },
  },
  avisos: {
    listar: async (grupoId) => { await esperar(); return deGrupo(AVISOS_MOCK, grupoId).map(copia) },
  },
  grupos: {
    listarMios: async () => {
      await esperar()
      return grupos.filter((g) => miRol(g)).map(aVista)
    },
    obtener: async (id) => {
      await esperar()
      const g = grupos.find((x) => x.id === id)
      if (!g) return null
      const rol = miRol(g)
      if (!rol) throw new ApiError('No pertenecés a este grupo.', 403)
      return {
        ...aVista(g),
        miembros: g.miembros.map(copia),
        // Las invitaciones enviadas las ve solo el owner
        invitaciones: rol === 'OWNER' ? g.invitaciones.map(copia).sort((a, b) => b.creada.localeCompare(a.creada)) : [],
      }
    },
    crear: async (datos) => {
      await esperar(500)
      if (datos.nombre.trim().length < 3) throw new ApiError('El nombre debe tener al menos 3 caracteres.', 400)
      const nuevo: GrupoInterno = {
        id: siguienteGrupo++, nombre: datos.nombre.trim(), zona: datos.zona.trim(),
        miembros: [yoComo('OWNER', 0)], invitaciones: [],
      }
      grupos.push(nuevo)
      return aVista(nuevo)
    },
    invitar: async (grupoId, email) => {
      await esperar()
      const g = grupoComoOwner(grupoId)
      const limpio = email.trim().toLowerCase()
      if (g.invitaciones.some((i) => i.email === limpio && i.estado === 'PENDIENTE')) {
        throw new ApiError('Ya hay una invitación pendiente para ese email.', 409)
      }
      const nueva: InvitacionGrupo = {
        id: siguienteInvitacion++, grupoId: g.id, grupoNombre: g.nombre, email: limpio,
        estado: 'PENDIENTE', creada: new Date().toISOString(), invitadoPor: `${MIS_DATOS.nombre} ${MIS_DATOS.apellido}`,
      }
      g.invitaciones.push(nueva)
      return copia(nueva)
    },
    cancelarInvitacion: async (grupoId, invitacionId) => {
      await esperar()
      const g = grupoComoOwner(grupoId)
      const inv = g.invitaciones.find((i) => i.id === invitacionId)
      if (!inv) throw new ApiError('No encontramos esa invitación.', 404)
      if (inv.estado !== 'PENDIENTE') throw new ApiError('Esa invitación ya fue respondida.', 409)
      g.invitaciones = g.invitaciones.filter((i) => i.id !== invitacionId)
    },
  },
  invitaciones: {
    listarMias: async () => {
      await esperar(200)
      return grupos
        .flatMap((g) => g.invitaciones)
        .filter((i) => i.email === MIS_DATOS.email.toLowerCase() && i.estado === 'PENDIENTE')
        .map(copia)
    },
    responder: async (invitacionId, aceptar) => {
      await esperar()
      const g = grupos.find((x) => x.invitaciones.some((i) => i.id === invitacionId))
      const inv = g?.invitaciones.find((i) => i.id === invitacionId)
      if (!g || !inv) throw new ApiError('No encontramos esa invitación.', 404)
      if (inv.estado !== 'PENDIENTE') throw new ApiError('Esa invitación ya fue respondida.', 409)
      inv.estado = aceptar ? 'ACEPTADA' : 'RECHAZADA'
      if (!aceptar) return null
      g.miembros.push(yoComo('MIEMBRO', 0))
      return aVista(g)
    },
  },
}
