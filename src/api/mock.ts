import { ApiError } from './cliente'
import type { Api } from './tipos'
import { AVISOS_MOCK, CATEGORIAS_MOCK, CENTRO_MAPA, INCIDENCIAS_MOCK, USUARIOS_MOCK } from '../data/mock'
import { TRANSICIONES, esAbierto, esUrgenteActivo } from '../utils/permisos'
import type { Aviso, Contacto, EstadisticasAdmin, EstadoIncidencia, GrupoAdmin, GrupoVecinal, Incidencia, InvitacionGrupo, MiembroGrupo, RolGrupo, UsuarioAdmin } from '../types'

// Implementación de ejemplo: responde con los datos de data/mock.ts y una demora simulada.
// Guarda los cambios en memoria (se pierden al recargar la página).
const esperar = (ms = 300) => new Promise<void>((resolver) => setTimeout(resolver, ms))
const haceMin = (min: number) => new Date(Date.now() - min * 60000).toISOString()
const copia = <T extends object>(dato: T): T => ({ ...dato })
const deGrupo = <T extends { grupoId?: number }>(lista: T[], grupoId?: number) =>
  grupoId === undefined ? lista : lista.filter((x) => x.grupoId === grupoId)

// ---------- Incidencias ----------
const incidencias: Incidencia[] = INCIDENCIAS_MOCK.map(copia)
const vistos = new Set<number>() // incidentes que el usuario ya confirmó ("Yo también lo vi")
const resueltosPorMi = new Set<number>() // incidentes que marcó como "Ya lo vi resuelto"

// Lo que haría el backend: al vencer la fecha de expiración, el incidente abierto pasa a EXPIRADO
function expirarVencidos() {
  const ahora = Date.now()
  for (const i of incidencias) {
    if (esAbierto(i) && new Date(i.fechaExpiracion).getTime() < ahora) {
      i.estado = 'EXPIRADO'
      i.historial.push({ estado: 'EXPIRADO', cuando: i.fechaExpiracion, nota: 'Venció la fecha de expiración' })
    }
  }
}

// Copia del incidente con lo que el usuario actual ya hizo
const vista = (i: Incidencia): Incidencia => ({ ...i, yoConfirme: vistos.has(i.id), yoMarqueResuelto: resueltosPorMi.has(i.id) })

// ---------- Avisos ----------
const avisos: Aviso[] = AVISOS_MOCK.map(copia)

// Lo que haría el backend: un aviso vigente cuya fecha de vencimiento pasó queda EXPIRADO
function expirarAvisos() {
  const ahora = Date.now()
  for (const a of avisos) {
    if (a.estado === 'VIGENTE' && a.vence && new Date(a.vence).getTime() < ahora) a.estado = 'EXPIRADO'
  }
}

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

// Pueden gestionar un incidente su creador y el owner de su grupo
const puedeGestionarMock = (i: { autorId: number; grupoId?: number }) =>
  esAdminMock() || i.autorId === YO || grupos.some((g) => g.id === i.grupoId && miRol(g) === 'OWNER')

function incidenteGestionable(id: number): Incidencia {
  const i = incidencias.find((x) => x.id === id)
  if (!i) throw new ApiError('No encontramos ese incidente.', 404)
  if (!puedeGestionarMock(i)) throw new ApiError('Solo el creador o el owner del grupo puede modificarlo.', 403)
  if (!esAbierto(i)) throw new ApiError('El incidente ya está cerrado.', 409)
  return i
}

function avisoGestionable(id: number): Aviso {
  const a = avisos.find((x) => x.id === id)
  if (!a) throw new ApiError('No encontramos ese aviso.', 404)
  if (!puedeGestionarMock(a)) throw new ApiError('Solo el creador o el owner del grupo puede modificarlo.', 403)
  if (a.estado !== 'VIGENTE') throw new ApiError('El aviso ya está cerrado.', 409)
  return a
}

// ---------- Administración (admin global) ----------
// El backend real autoriza por la sesión; acá se lee el rol de prueba guardado por el selector de rol.
const esAdminMock = () => {
  try { return localStorage.getItem('vecinal_rol_mock') === 'ADMINISTRADOR' } catch { return false }
}
function exigirAdmin() {
  if (!esAdminMock()) throw new ApiError('Solo el administrador puede hacer esto.', 403)
}
const ID_ADMIN = 2
const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const categoriasMock = CATEGORIAS_MOCK.map(copia)

type UsuarioInterno = Omit<UsuarioAdmin, 'cantidadGrupos'>
const usuario = (id: number, nombre: string, apellido: string, email: string, diasAtras: number, rol: UsuarioInterno['rol'] = 'VECINO'): UsuarioInterno =>
  ({ id, nombre, apellido, email, rol, creado: haceMin(diasAtras * 1440) })
const usuarios: UsuarioInterno[] = [
  usuario(1, 'Lucía', 'Fernández', MIS_DATOS.email, 120),
  usuario(2, 'Martín', 'Gómez', 'admin@ejemplo.com', 300, 'ADMINISTRADOR'),
  usuario(10, 'Carlos', 'Ruiz', 'carlos@ejemplo.com', 200),
  usuario(11, 'Ana', 'Pérez', 'ana@ejemplo.com', 80),
  usuario(12, 'Pedro', 'Gómez', 'pedro@ejemplo.com', 60),
  usuario(13, 'Marta', 'Silva', 'marta@ejemplo.com', 40),
  usuario(14, 'Julián', 'Torres', 'julian@ejemplo.com', 10),
  usuario(15, 'Marcos', 'Díaz', 'marcos@ejemplo.com', 12),
  usuario(16, 'Sofía', 'Rojas', 'sofia@ejemplo.com', 5),
  usuario(17, 'Elena', 'Vega', 'elena@ejemplo.com', 150),
  usuario(18, 'Raúl', 'Mora', 'raul@ejemplo.com', 100),
  usuario(21, 'Diego', 'Castro', 'diego@ejemplo.com', 2),
  usuario(22, 'Valeria', 'Ponce', 'valeria@ejemplo.com', 1),
]
const contacto = (id: number, nombre: string, email: string, asunto: string, mensaje: string, minAtras: number, leido: boolean): Contacto =>
  ({ id, nombre, email, asunto, mensaje, fecha: haceMin(minAtras), leido })
const contactos: Contacto[] = [
  contacto(1, 'Patricia Luna', 'patricia@correo.com', 'Quiero sumar mi barrio', 'Hola, vivo en un barrio privado y me gustaría usar la app con mis vecinos. ¿Cómo hacemos para crear el grupo?', 90, false),
  contacto(2, 'Gustavo Ibarra', 'gustavo@correo.com', 'No me llega la invitación', 'Mi vecina me invitó a su grupo pero no veo la invitación en la app. Mi email es el que les dejo.', 400, false),
  contacto(3, 'Romina Acosta', 'romina@correo.com', 'Sugerencia', 'Estaría bueno poder adjuntar más de una foto en los incidentes. ¡Gracias por la app!', 2000, false),
  contacto(4, 'Nicolás Paz', 'nicolas@correo.com', 'Consulta sobre el 911', 'Una duda: ¿la app avisa a la policía cuando hago un reporte urgente?', 5000, true),
  contacto(5, 'Laura Méndez', 'laura@correo.com', 'Felicitaciones', 'Probamos la app en la cuadra y los vecinos están encantados.', 9000, true),
]

const aUsuarioAdmin = (u: UsuarioInterno): UsuarioAdmin => ({
  ...u,
  cantidadGrupos: grupos.filter((g) => g.miembros.some((m) => m.usuarioId === u.id)).length,
})
function aGrupoAdmin(g: GrupoInterno): GrupoAdmin {
  const owner = g.miembros.find((m) => m.rol === 'OWNER')!
  return {
    id: g.id, nombre: g.nombre, zona: g.zona,
    ownerId: owner.usuarioId, ownerNombre: `${owner.nombre} ${owner.apellido}`,
    cantidadVecinos: g.miembros.length,
    cantidadIncidentes: incidencias.filter((i) => i.grupoId === g.id).length,
    cantidadAvisos: avisos.filter((a) => a.grupoId === g.id).length,
    creado: owner.desde,
  }
}
function quitar<T>(lista: T[], condicion: (x: T) => boolean) {
  for (let i = lista.length - 1; i >= 0; i--) if (condicion(lista[i])) lista.splice(i, 1)
}
const quitarTildes = (texto: string) => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

export const apiMock: Api = {
  categorias: {
    listar: async () => { await esperar(150); return categoriasMock.map(copia) },
  },
  incidencias: {
    listar: async (grupoId) => { await esperar(); expirarVencidos(); return deGrupo(incidencias, grupoId).map(vista) },
    listarMias: async () => { await esperar(); expirarVencidos(); return incidencias.filter((i) => i.autorId === YO).map(vista) },
    obtener: async (id) => {
      await esperar()
      expirarVencidos()
      const encontrada = incidencias.find((i) => i.id === id)
      return encontrada ? vista(encontrada) : null
    },
    confirmar: async (id) => {
      await esperar()
      expirarVencidos()
      const encontrada = incidencias.find((i) => i.id === id)
      if (!encontrada) throw new ApiError('No encontramos ese incidente.', 404)
      if (!esAbierto(encontrada)) throw new ApiError('El incidente ya está cerrado.', 409)
      if (vistos.has(id)) throw new ApiError('Ya confirmaste este incidente.', 409)
      vistos.add(id)
      encontrada.vecinos += 1
      return vista(encontrada)
    },
    confirmarResuelto: async (id) => {
      await esperar()
      expirarVencidos()
      const encontrada = incidencias.find((i) => i.id === id)
      if (!encontrada) throw new ApiError('No encontramos ese incidente.', 404)
      if (!esAbierto(encontrada)) throw new ApiError('El incidente ya está cerrado.', 409)
      if (resueltosPorMi.has(id)) throw new ApiError('Ya avisaste que está resuelto.', 409)
      resueltosPorMi.add(id)
      encontrada.vecinosYaResuelto += 1
      return vista(encontrada)
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
        tipo: 'NORMAL',
        autorId: YO,
        fechaExpiracion: new Date(Date.now() + datos.vigenciaDias * 86400000).toISOString(),
        vecinosYaResuelto: 0,
        historial: [{ estado: 'REPORTADO', cuando: ahora, nota: 'Reportado por vos' }],
      }
      incidencias.unshift(nueva)
      return vista(nueva)
    },
    crearUrgente: async (datos) => {
      await esperar(400)
      const ahora = new Date().toISOString()
      const nueva: Incidencia = {
        id: Math.max(0, ...incidencias.map((i) => i.id)) + 1,
        grupoId: datos.grupoId,
        tipo: 'URGENTE',
        autorId: YO,
        titulo: 'Reporte urgente',
        categoriaId: '',
        estado: 'REPORTADO',
        creada: ahora,
        ubicacion: datos.lat === null ? 'Ubicación no disponible' : 'Ubicación compartida en vivo',
        lat: datos.lat,
        lng: datos.lng,
        descripcion: '',
        vecinos: 1,
        distancia: 0,
        fechaExpiracion: new Date(Date.now() + 24 * 3600000).toISOString(), // los urgentes duran 24 h
        vecinosYaResuelto: 0,
        historial: [{ estado: 'REPORTADO', cuando: ahora, nota: 'Reporte urgente enviado por vos' }],
      }
      incidencias.unshift(nueva)
      return vista(nueva)
    },
    actualizar: async (id, cambios) => {
      await esperar()
      expirarVencidos()
      const i = incidenteGestionable(id)
      if (cambios.titulo !== undefined) i.titulo = cambios.titulo.trim()
      if (cambios.categoriaId !== undefined) i.categoriaId = cambios.categoriaId
      if (cambios.descripcion !== undefined) i.descripcion = cambios.descripcion.trim()
      if (cambios.ubicacion !== undefined) i.ubicacion = cambios.ubicacion.trim()
      return vista(i)
    },
    cambiarEstado: async (id, estado, nota) => {
      await esperar()
      expirarVencidos()
      const i = incidenteGestionable(id)
      if (!TRANSICIONES[i.estado].includes(estado as EstadoIncidencia)) {
        throw new ApiError('No se puede pasar el incidente a ese estado.', 409)
      }
      i.estado = estado
      i.historial.push({ estado, cuando: new Date().toISOString(), nota: nota?.trim() || 'Estado actualizado' })
      return vista(i)
    },
  },
  avisos: {
    listar: async (grupoId) => { await esperar(); expirarAvisos(); return deGrupo(avisos, grupoId).map(copia) },
    listarMios: async () => { await esperar(); expirarAvisos(); return avisos.filter((a) => a.autorId === YO).map(copia) },
    crear: async (datos) => {
      await esperar(400)
      if (datos.grupoId !== undefined && !grupos.some((g) => g.id === datos.grupoId && miRol(g))) {
        throw new ApiError('No pertenecés a ese grupo.', 403)
      }
      const nuevo: Aviso = {
        id: Math.max(0, ...avisos.map((a) => a.id)) + 1,
        grupoId: datos.grupoId,
        prioridad: datos.prioridad,
        titulo: datos.titulo.trim(),
        cuerpo: datos.cuerpo.trim(),
        fecha: new Date().toISOString(),
        vence: datos.vigenciaDias === null ? null : new Date(Date.now() + datos.vigenciaDias * 86400000).toISOString(),
        estado: 'VIGENTE',
        autorId: YO,
        autorNombre: `${MIS_DATOS.nombre} ${MIS_DATOS.apellido}`,
      }
      avisos.unshift(nuevo)
      return copia(nuevo)
    },
    actualizar: async (id, cambios) => {
      await esperar()
      expirarAvisos()
      const a = avisoGestionable(id)
      if (cambios.titulo !== undefined) a.titulo = cambios.titulo.trim()
      if (cambios.cuerpo !== undefined) a.cuerpo = cambios.cuerpo.trim()
      if (cambios.prioridad !== undefined) a.prioridad = cambios.prioridad
      return copia(a)
    },
    cerrar: async (id) => {
      await esperar()
      expirarAvisos()
      const a = avisoGestionable(id)
      a.estado = 'CERRADO'
      return copia(a)
    },
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
  admin: {
    estadisticas: async () => {
      await esperar()
      exigirAdmin()
      expirarVencidos()
      expirarAvisos()
      const incidentesPorEstado: EstadisticasAdmin['incidentesPorEstado'] = { REPORTADO: 0, EN_SEGUIMIENTO: 0, RESUELTO: 0, DESCARTADO: 0, EXPIRADO: 0 }
      for (const i of incidencias) incidentesPorEstado[i.estado]++

      const dia = 86400000
      const hoy = new Date(); hoy.setHours(0, 0, 0, 0)
      const ultimos7dias = [6, 5, 4, 3, 2, 1, 0].map((atras) => {
        const inicio = hoy.getTime() - atras * dia
        return {
          etiqueta: new Date(inicio).toLocaleDateString('es-AR', { weekday: 'short' }),
          cantidad: incidencias.filter((i) => { const t = new Date(i.creada).getTime(); return t >= inicio && t < inicio + dia }).length,
        }
      })

      const porCategoria = categoriasMock
        .map((c) => ({ categoriaId: c.id, nombre: c.nombre, icono: c.icono, cantidad: incidencias.filter((i) => i.categoriaId === c.id).length }))
      const sinCategoria = incidencias.filter((i) => !i.categoriaId).length
      if (sinCategoria > 0) porCategoria.push({ categoriaId: '', nombre: 'Sin categoría', icono: '📌', cantidad: sinCategoria })

      return {
        totalGrupos: grupos.length,
        totalUsuarios: usuarios.length,
        totalVecinos: usuarios.filter((u) => u.rol === 'VECINO').length,
        usuariosNuevos30d: usuarios.filter((u) => Date.now() - new Date(u.creado).getTime() < 30 * dia).length,
        urgentesActivos: incidencias.filter(esUrgenteActivo).length,
        avisosVigentes: avisos.filter((a) => a.estado === 'VIGENTE').length,
        contactosSinLeer: contactos.filter((c) => !c.leido).length,
        incidentesPorEstado,
        ultimos7dias,
        porCategoria: porCategoria.filter((c) => c.cantidad > 0).sort((a, b) => b.cantidad - a.cantidad),
        topGrupos: grupos
          .map((g) => ({ grupoId: g.id, nombre: g.nombre, vecinos: g.miembros.length, incidentes: incidencias.filter((i) => i.grupoId === g.id).length }))
          .sort((a, b) => b.incidentes - a.incidentes).slice(0, 5),
      }
    },
    grupos: {
      listar: async () => { await esperar(); exigirAdmin(); return grupos.map(aGrupoAdmin) },
      actualizar: async (id, cambios) => {
        await esperar(); exigirAdmin()
        const g = grupos.find((x) => x.id === id)
        if (!g) throw new ApiError('No encontramos ese grupo.', 404)
        if (cambios.nombre !== undefined) {
          if (cambios.nombre.trim().length < 3) throw new ApiError('El nombre debe tener al menos 3 caracteres.', 400)
          g.nombre = cambios.nombre.trim()
        }
        if (cambios.zona !== undefined) {
          if (!cambios.zona.trim()) throw new ApiError('Indicá el barrio o la zona.', 400)
          g.zona = cambios.zona.trim()
        }
        return aGrupoAdmin(g)
      },
      eliminar: async (id) => {
        await esperar(); exigirAdmin()
        if (!grupos.some((g) => g.id === id)) throw new ApiError('No encontramos ese grupo.', 404)
        grupos = grupos.filter((g) => g.id !== id)
        quitar(incidencias, (i) => i.grupoId === id)
        quitar(avisos, (a) => a.grupoId === id)
      },
    },
    usuarios: {
      listar: async () => { await esperar(); exigirAdmin(); return usuarios.map(aUsuarioAdmin) },
      actualizar: async (id, cambios) => {
        await esperar(); exigirAdmin()
        const u = usuarios.find((x) => x.id === id)
        if (!u) throw new ApiError('No encontramos ese usuario.', 404)
        if (cambios.nombre !== undefined && !cambios.nombre.trim()) throw new ApiError('El nombre no puede quedar vacío.', 400)
        if (cambios.apellido !== undefined && !cambios.apellido.trim()) throw new ApiError('El apellido no puede quedar vacío.', 400)
        if (cambios.email !== undefined) {
          const email = cambios.email.trim().toLowerCase()
          if (!EMAIL_VALIDO.test(email)) throw new ApiError('El email no es válido.', 400)
          if (usuarios.some((x) => x.id !== id && x.email.toLowerCase() === email)) throw new ApiError('Ya existe un usuario con ese email.', 409)
          u.email = email
        }
        if (cambios.rol !== undefined && cambios.rol !== u.rol) {
          if (id === ID_ADMIN) throw new ApiError('No podés cambiar tu propio rol.', 409)
          u.rol = cambios.rol
        }
        if (cambios.nombre !== undefined) u.nombre = cambios.nombre.trim()
        if (cambios.apellido !== undefined) u.apellido = cambios.apellido.trim()
        for (const g of grupos) for (const m of g.miembros) if (m.usuarioId === id) { m.nombre = u.nombre; m.apellido = u.apellido }
        return aUsuarioAdmin(u)
      },
      eliminar: async (id) => {
        await esperar(); exigirAdmin()
        const u = usuarios.find((x) => x.id === id)
        if (!u) throw new ApiError('No encontramos ese usuario.', 404)
        if (id === ID_ADMIN) throw new ApiError('No podés eliminarte a vos mismo.', 409)
        if (grupos.some((g) => g.miembros.some((m) => m.usuarioId === id && m.rol === 'OWNER'))) {
          throw new ApiError('Es owner de un grupo: eliminá el grupo o cambiá de owner antes de borrar al usuario.', 409)
        }
        usuarios.splice(usuarios.indexOf(u), 1)
        for (const g of grupos) g.miembros = g.miembros.filter((m) => m.usuarioId !== id)
      },
      // El admin no ve ni define la contraseña: el backend le envía al usuario un enlace para crear una nueva
      blanquearClave: async (id) => {
        await esperar(); exigirAdmin()
        if (!usuarios.some((u) => u.id === id)) throw new ApiError('No encontramos ese usuario.', 404)
      },
    },
    incidentes: {
      eliminar: async (id) => {
        await esperar(); exigirAdmin()
        const posicion = incidencias.findIndex((i) => i.id === id)
        if (posicion < 0) throw new ApiError('No encontramos ese incidente.', 404)
        incidencias.splice(posicion, 1)
      },
    },
    avisos: {
      eliminar: async (id) => {
        await esperar(); exigirAdmin()
        const posicion = avisos.findIndex((a) => a.id === id)
        if (posicion < 0) throw new ApiError('No encontramos ese aviso.', 404)
        avisos.splice(posicion, 1)
      },
    },
    categorias: {
      crear: async ({ nombre, icono }) => {
        await esperar(); exigirAdmin()
        if (nombre.trim().length < 3) throw new ApiError('El nombre debe tener al menos 3 caracteres.', 400)
        if (!icono.trim()) throw new ApiError('Elegí un ícono (un emoji).', 400)
        const id = quitarTildes(nombre).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        if (categoriasMock.some((c) => c.id === id || c.nombre.toLowerCase() === nombre.trim().toLowerCase())) {
          throw new ApiError('Ya existe una categoría con ese nombre.', 409)
        }
        const nueva = { id, nombre: nombre.trim(), icono: icono.trim(), activa: true }
        categoriasMock.push(nueva)
        return copia(nueva)
      },
      actualizar: async (id, cambios) => {
        await esperar(); exigirAdmin()
        const c = categoriasMock.find((x) => x.id === id)
        if (!c) throw new ApiError('No encontramos esa categoría.', 404)
        if (cambios.nombre !== undefined) {
          if (cambios.nombre.trim().length < 3) throw new ApiError('El nombre debe tener al menos 3 caracteres.', 400)
          c.nombre = cambios.nombre.trim()
        }
        if (cambios.icono !== undefined) {
          if (!cambios.icono.trim()) throw new ApiError('Elegí un ícono (un emoji).', 400)
          c.icono = cambios.icono.trim()
        }
        if (cambios.activa !== undefined) c.activa = cambios.activa
        return copia(c)
      },
    },
    contactos: {
      listar: async () => {
        await esperar(); exigirAdmin()
        return contactos.map(copia).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      },
      marcarLeido: async (id) => {
        await esperar(); exigirAdmin()
        const c = contactos.find((x) => x.id === id)
        if (!c) throw new ApiError('No encontramos ese mensaje.', 404)
        c.leido = true
        return copia(c)
      },
    },
  },
}
