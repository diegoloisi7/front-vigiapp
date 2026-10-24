import type {
  Aviso, Categoria, EstadoIncidencia, EventoDemo, Incidencia, MiembroEquipo, Rol, Usuario,
} from '../types'

// Datos de prueba. Por ahora solo usuarios; en los bloques siguientes se suman
// categorías, incidentes, alertas, avisos y contactos.

export const USUARIOS_MOCK: Record<Exclude<Rol, 'VISITANTE'>, Usuario> = {
  VECINO: {
    id: 1,
    nombre: 'Lucía',
    apellido: 'Fernández',
    email: 'lucia@ejemplo.com',
    comunidad: 'Barrio Los Álamos',
  },
  ADMINISTRADOR: {
    id: 2,
    nombre: 'Martín',
    apellido: 'Gómez',
    email: 'admin@ejemplo.com',
    comunidad: 'Barrio Los Álamos',
  },
}

// Eventos de la demo "Alertas en vivo" de la landing (se muestran en ciclo).
// tipo: EMERGENCIA | ALERTA | INCIDENCIA | AVISO | RESUELTO
export const EVENTOS_DEMO: EventoDemo[] = [
  { tipo: 'AVISO', titulo: 'Corte de agua programado', detalle: 'Jueves de 9 a 12 · Manzana 4' },
  { tipo: 'INCIDENCIA', titulo: 'Luz quemada en la plaza', detalle: 'Reportado · 6 vecinos lo vieron' },
  { tipo: 'ALERTA', titulo: 'Actividad sospechosa', detalle: 'Calle Los Olmos al 200 · 3 vecinos lo confirmaron' },
  { tipo: 'EMERGENCIA', titulo: 'Pedido de ayuda: incendio', detalle: 'Calle Los Olmos 120 · si podés, llamá al 911' },
  { tipo: 'RESUELTO', titulo: 'Bache reparado', detalle: 'Av. Mitre y Sarmiento · Resuelto' },
  { tipo: 'INCIDENCIA', titulo: 'Árbol caído en la vereda', detalle: 'En seguimiento · 2 vecinos lo vieron' },
  { tipo: 'AVISO', titulo: 'Reunión de vecinos', detalle: 'Sábado 18:00 · Salón comunal' },
]

// Tarjetas del equipo (placeholders: completar con los datos reales)
export const EQUIPO_MOCK: MiembroEquipo[] = [
  { id: 1, nombre: 'Nombre y apellido', rol: 'Rol en el proyecto' },
  { id: 2, nombre: 'Nombre y apellido', rol: 'Rol en el proyecto' },
  { id: 3, nombre: 'Nombre y apellido', rol: 'Rol en el proyecto' },
  { id: 4, nombre: 'Nombre y apellido', rol: 'Rol en el proyecto' },
]

// ===================== Datos del vecino =====================
// Devuelve una fecha ISO "hace N minutos" (N negativo = en el futuro), así los tiempos relativos siempre se ven bien
const hace = (min: number): string => new Date(Date.now() - min * 60000).toISOString()


// Centro del mapa de ejemplo (Google Maps embed)
export const CENTRO_MAPA: { lat: number; lng: number } = { lat: -34.6037, lng: -58.3816 }

export const ESTADOS: Record<EstadoIncidencia, string> = {
  REPORTADO: 'Reportado',
  EN_SEGUIMIENTO: 'En seguimiento',
  RESUELTO: 'Resuelto',
  DESCARTADO: 'Descartado',
  EXPIRADO: 'Expirado',
}


export const CATEGORIAS_MOCK: Categoria[] = [
  { id: 'seguridad', nombre: 'Seguridad', icono: '🛡️', activa: true },
  { id: 'alumbrado', nombre: 'Alumbrado', icono: '💡', activa: true },
  { id: 'baches', nombre: 'Baches', icono: '🕳️', activa: true },
  { id: 'arboles', nombre: 'Árboles', icono: '🌳', activa: true },
  { id: 'transito', nombre: 'Tránsito', icono: '🚦', activa: true },
  { id: 'agua', nombre: 'Pérdidas de agua', icono: '💧', activa: true },
  { id: 'basura', nombre: 'Basura', icono: '🗑️', activa: true },
  { id: 'incendios', nombre: 'Incendios', icono: '🔥', activa: true },
  { id: 'otros', nombre: 'Otros', icono: '📌', activa: true },
]
export const categoriaPorId = (id: string): Categoria | undefined => CATEGORIAS_MOCK.find((c) => c.id === id)

export const INCIDENCIAS_MOCK: Incidencia[] = [
  { id: 1, grupoId: 1, tipo: 'NORMAL', autorId: 1, fechaExpiracion: hace(-10080), vecinosYaResuelto: 0, titulo: 'Luz quemada en la plaza', categoriaId: 'alumbrado', estado: 'REPORTADO', creada: hace(35),
    ubicacion: 'Plaza Central, esquina Los Olmos', lat: -34.6029, lng: -58.3799, vecinos: 6, distancia: 120,
    descripcion: 'Los tres faroles del sector de juegos están apagados desde anoche. Por la noche la plaza queda completamente a oscuras.',
    historial: [{ estado: 'REPORTADO', cuando: hace(35), nota: 'Reportado por un vecino' }] },
  { id: 2, grupoId: 1, tipo: 'NORMAL', autorId: 22, fechaExpiracion: hace(-1500), vecinosYaResuelto: 3, titulo: 'Bache profundo en Av. Mitre', categoriaId: 'baches', estado: 'EN_SEGUIMIENTO', creada: hace(300),
    ubicacion: 'Av. Mitre y Sarmiento', lat: -34.6052, lng: -58.3832, vecinos: 14, distancia: 260,
    descripcion: 'Bache de unos 40 cm de ancho sobre el carril derecho. Ya hubo dos autos con las cubiertas dañadas.',
    historial: [
      { estado: 'REPORTADO', cuando: hace(300), nota: 'Reportado por un vecino' },
      { estado: 'EN_SEGUIMIENTO', cuando: hace(120), nota: 'Derivado al área de obras' },
    ] },
  { id: 3, grupoId: 1, tipo: 'NORMAL', autorId: 23, fechaExpiracion: hace(-10080), vecinosYaResuelto: 0, titulo: 'Pérdida de agua en la vereda', categoriaId: 'agua', estado: 'REPORTADO', creada: hace(130),
    ubicacion: 'Calle Los Pinos 340', lat: -34.6015, lng: -58.3841, vecinos: 4, distancia: 340,
    descripcion: 'Sale agua de una grieta de la vereda desde la mañana y ya formó un charco que llega a la calle.',
    historial: [{ estado: 'REPORTADO', cuando: hace(130), nota: 'Reportado por un vecino' }] },
  { id: 4, grupoId: 1, tipo: 'NORMAL', autorId: 1, fechaExpiracion: hace(-10080), vecinosYaResuelto: 0, titulo: 'Árbol caído bloquea la vereda', categoriaId: 'arboles', estado: 'EN_SEGUIMIENTO', creada: hace(1500),
    ubicacion: 'Calle Los Ceibos 85', lat: -34.6068, lng: -58.379, vecinos: 9, distancia: 480,
    descripcion: 'Tras la tormenta cayó una rama grande que ocupa toda la vereda. Hay que cruzar por la calle para pasar.',
    historial: [
      { estado: 'REPORTADO', cuando: hace(1500), nota: 'Reportado por un vecino' },
      { estado: 'EN_SEGUIMIENTO', cuando: hace(900), nota: 'Se avisó a la cuadrilla de espacios verdes' },
    ] },
  { id: 5, grupoId: 2, tipo: 'NORMAL', autorId: 25, fechaExpiracion: hace(60), vecinosYaResuelto: 0, titulo: 'Basura acumulada en la esquina', categoriaId: 'basura', estado: 'REPORTADO', creada: hace(4300),
    ubicacion: 'Calle Las Rosas y Belgrano', lat: -34.6044, lng: -58.3862, vecinos: 11, distancia: 520,
    descripcion: 'Hace tres días que no se retira la basura y los contenedores desbordan sobre la calle.',
    historial: [{ estado: 'REPORTADO', cuando: hace(4300), nota: 'Reportado por un vecino' }] },
  { id: 6, grupoId: 1, tipo: 'NORMAL', autorId: 1, fechaExpiracion: hace(-10080), vecinosYaResuelto: 0, titulo: 'Semáforo sin funcionar', categoriaId: 'transito', estado: 'RESUELTO', creada: hace(2900),
    ubicacion: 'Av. Mitre y Belgrano', lat: -34.6039, lng: -58.3815, vecinos: 21, distancia: 210,
    descripcion: 'El semáforo estaba apagado en hora pico y los autos cruzaban sin ver quién tenía paso.',
    historial: [
      { estado: 'REPORTADO', cuando: hace(2900), nota: 'Reportado por un vecino' },
      { estado: 'EN_SEGUIMIENTO', cuando: hace(2600), nota: 'Tránsito envió a un técnico' },
      { estado: 'RESUELTO', cuando: hace(1900), nota: 'Semáforo reparado' },
    ] },
  { id: 7, grupoId: 2, tipo: 'NORMAL', autorId: 27, fechaExpiracion: hace(-10080), vecinosYaResuelto: 0, titulo: 'Humo en terreno baldío', categoriaId: 'incendios', estado: 'EN_SEGUIMIENTO', creada: hace(360),
    ubicacion: 'Calle Los Olmos al 300', lat: -34.602, lng: -58.377, vecinos: 8, distancia: 380,
    descripcion: 'Salía humo de pasto quemado en el baldío. Los vecinos de al lado lo apagaron, pero conviene que alguien lo revise.',
    historial: [
      { estado: 'REPORTADO', cuando: hace(360), nota: 'Reportado por un vecino' },
      { estado: 'EN_SEGUIMIENTO', cuando: hace(300), nota: 'Se pidió una inspección' },
    ] },
  { id: 8, grupoId: 1, tipo: 'NORMAL', autorId: 28, fechaExpiracion: hace(-10080), vecinosYaResuelto: 0, titulo: 'Auto sospechoso estacionado de noche', categoriaId: 'seguridad', estado: 'REPORTADO', creada: hace(50),
    ubicacion: 'Calle Las Rosas 150', lat: -34.6071, lng: -58.3829, vecinos: 5, distancia: 300,
    descripcion: 'Un auto sin patente visible estuvo estacionado con gente adentro durante más de una hora.',
    historial: [{ estado: 'REPORTADO', cuando: hace(50), nota: 'Reportado por un vecino' }] },
  { id: 9, grupoId: 2, tipo: 'NORMAL', autorId: 29, fechaExpiracion: hace(-10080), vecinosYaResuelto: 0, titulo: 'Cartel de obra caído', categoriaId: 'otros', estado: 'DESCARTADO', creada: hace(5800),
    ubicacion: 'Av. Mitre 900', lat: -34.6058, lng: -58.3774, vecinos: 1, distancia: 600,
    descripcion: 'Un cartel de obra quedó apoyado sobre la vereda.',
    historial: [
      { estado: 'REPORTADO', cuando: hace(5800), nota: 'Reportado por un vecino' },
      { estado: 'DESCARTADO', cuando: hace(5600), nota: 'Duplicado de otro reporte' },
    ] },
  { id: 10, grupoId: 2, tipo: 'NORMAL', autorId: 30, fechaExpiracion: hace(-10080), vecinosYaResuelto: 0, titulo: 'Poste de luz inclinado', categoriaId: 'alumbrado', estado: 'RESUELTO', creada: hace(7200),
    ubicacion: 'Calle Los Pinos y Mitre', lat: -34.6046, lng: -58.385, vecinos: 17, distancia: 430,
    descripcion: 'El poste estaba inclinado luego de un choque y los cables quedaron bajos.',
    historial: [
      { estado: 'REPORTADO', cuando: hace(7200), nota: 'Reportado por un vecino' },
      { estado: 'EN_SEGUIMIENTO', cuando: hace(6800), nota: 'La empresa de energía fue notificada' },
      { estado: 'RESUELTO', cuando: hace(5000), nota: 'Poste enderezado y cables asegurados' },
    ] },
  { id: 11, grupoId: 1, tipo: 'URGENTE', autorId: 21, fechaExpiracion: hace(-1300), vecinosYaResuelto: 0,
    titulo: 'Reporte urgente', categoriaId: '', estado: 'REPORTADO', creada: hace(8),
    ubicacion: 'Ubicación compartida en vivo', lat: -34.6049, lng: -58.3821, vecinos: 3, distancia: 90, descripcion: '',
    historial: [{ estado: 'REPORTADO', cuando: hace(8), nota: 'Reporte urgente enviado por un vecino' }] },
  { id: 12, grupoId: 1, tipo: 'URGENTE', autorId: 1, fechaExpiracion: hace(-1350), vecinosYaResuelto: 0,
    titulo: 'Reporte urgente', categoriaId: '', estado: 'REPORTADO', creada: hace(90),
    ubicacion: 'Ubicación compartida en vivo', lat: -34.6035, lng: -58.3805, vecinos: 1, distancia: 0, descripcion: '',
    historial: [{ estado: 'REPORTADO', cuando: hace(90), nota: 'Reporte urgente enviado por vos' }] },
]

// prioridad: NORMAL | IMPORTANTE. estado: VIGENTE | CERRADO | EXPIRADO. vence: fecha opcional.
// autorId: creador del aviso; junto con el owner del grupo, puede editarlo o cerrarlo.
export const AVISOS_MOCK: Aviso[] = [
  { id: 1, grupoId: 1, prioridad: 'IMPORTANTE', titulo: 'Corte de agua programado', fecha: hace(180), vence: hace(-2880), estado: 'VIGENTE', autorId: 10, autorNombre: 'Carlos Ruiz',
    cuerpo: 'El jueves de 9 a 12 no habrá servicio en las manzanas 3 y 4. Guardá agua con anticipación.' },
  { id: 2, grupoId: 1, prioridad: 'IMPORTANTE', titulo: 'Reunión de seguridad vecinal', fecha: hace(1200), vence: hace(-4320), estado: 'VIGENTE', autorId: 10, autorNombre: 'Carlos Ruiz',
    cuerpo: 'El sábado a las 18:00 en el salón comunal. Vamos a acordar rondas y un protocolo de aviso.' },
  { id: 3, grupoId: 2, prioridad: 'NORMAL', titulo: 'Feria de la plaza', fecha: hace(2000), vence: null, estado: 'VIGENTE', autorId: 1, autorNombre: 'Lucía Fernández',
    cuerpo: 'Los domingos de 10 a 16 hay feria de productores en la plaza central.' },
  { id: 4, grupoId: 2, prioridad: 'NORMAL', titulo: 'Nuevo horario de recolección', fecha: hace(3000), vence: null, estado: 'VIGENTE', autorId: 15, autorNombre: 'Marcos Díaz',
    cuerpo: 'Desde la semana próxima, la recolección de residuos pasa martes y viernes por la noche.' },
  { id: 5, grupoId: 1, prioridad: 'NORMAL', titulo: 'Se busca perro perdido', fecha: hace(240), vence: hace(-2880), estado: 'VIGENTE', autorId: 1, autorNombre: 'Lucía Fernández',
    cuerpo: 'Se perdió un labrador color miel cerca de la plaza. Si lo ves, avisá por este grupo.' },
  { id: 6, grupoId: 1, prioridad: 'NORMAL', titulo: 'Corte de luz del martes', fecha: hace(4000), vence: null, estado: 'CERRADO', autorId: 12, autorNombre: 'Pedro Gómez',
    cuerpo: 'Se restableció el servicio en toda la zona. Gracias por avisar.' },
  { id: 7, grupoId: 1, prioridad: 'NORMAL', titulo: 'Jornada de limpieza', fecha: hace(2600), vence: hace(120), estado: 'VIGENTE', autorId: 13, autorNombre: 'Marta Silva',
    cuerpo: 'Nos juntamos a limpiar la plaza. Llevá guantes y bolsas.' },
]
