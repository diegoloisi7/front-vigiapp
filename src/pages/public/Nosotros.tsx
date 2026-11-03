import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { EQUIPO, type MiembroEquipo } from '../../data/equipo'
import { useAparicion } from '../../hooks/useAparicion'

const demora = (i: number) => ({ '--i': i }) as CSSProperties

const VALORES = [
  { emoji: '🆘', titulo: 'La seguridad primero', texto: 'En una emergencia nada debería estorbar. Cada decisión de diseño piensa primero en el vecino que necesita ayuda.',
    practicas: ['El pedido de ayuda se envía manteniendo presionado 3 segundos, para evitar toques accidentales.', 'El aviso de SOS es rojo, ocupa todo el ancho y no se cierra solo.', 'El rojo se usa solamente para pedidos de ayuda, así nunca pierde su significado.', 'El botón para llamar al 911 está siempre a mano.'] },
  { emoji: '🧭', titulo: 'Claridad ante todo', texto: 'La información ordenada salva tiempo. Que cualquier vecino entienda de un vistazo qué pasa y qué tan urgente es.',
    practicas: ['Colores con significado: rojo emergencia, amarillo atención, verde resuelto.', 'Cada incidente tiene estado, ubicación e historial.', 'Lo urgente aparece arriba de todo.'] },
  { emoji: '🤝', titulo: 'Comunidad', texto: 'La app no reemplaza a los vecinos: los conecta. Funciona mejor cuando todos participan.',
    practicas: ['"Yo también lo vi" suma vecinos a un reporte en lugar de duplicarlo.', 'Cada grupo tiene un owner que invita y organiza.', 'Los avisos mantienen a todos al tanto de lo que pasa en el barrio.'] },
  { emoji: '🔒', titulo: 'Privacidad y respeto', texto: 'Pedimos solo los datos necesarios y cuidamos los que nos confían.',
    practicas: ['Las contraseñas se guardan cifradas con Argon2.', 'Ni siquiera el administrador puede ver una contraseña.', 'Cada grupo ve únicamente su propia información.'] },
  { emoji: '♿', titulo: 'Para todas las edades', texto: 'Del vecino más joven al más grande: la app tiene que ser fácil para todos.',
    practicas: ['Botones grandes, de al menos 44 píxeles, pensados para el celular.', 'Alto contraste y modo oscuro.', 'Se puede usar con teclado y con lector de pantalla.'] },
  { emoji: '⬆️', titulo: 'Mejorar de a poco', texto: 'Preferimos avanzar paso a paso y bien, antes que todo junto y a medias.',
    practicas: ['Trabajamos por etapas, con objetivos chicos y claros.', 'Probamos cada cambio de punta a punta contra el servidor real.', 'Las reuniones de equipo definen las próximas mejoras.'] },
]

const HITOS = [
  { titulo: 'La idea', texto: 'El problema de las alertas que se pierden en los grupos de mensajería vecinales.' },
  { titulo: 'El diseño', texto: 'Pantallas pensadas primero para el celular, con colores que comunican y accesibilidad.' },
  { titulo: 'La API y la base de datos', texto: 'NestJS y MariaDB, con las reglas de negocio validadas en el servidor.' },
  { titulo: 'Tiempo real', texto: 'Pedidos de ayuda que llegan al instante a todo el grupo, con WebSockets.' },
]

const NUMEROS = [
  { valor: '4', texto: 'integrantes en el equipo' },
  { valor: '60', texto: 'endpoints en la API' },
  { valor: '15', texto: 'tablas en la base de datos' },
  { valor: '3 s', texto: 'para pedir ayuda' },
]


const iniciales = (nombre: string) => nombre.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase()

// Plano real alrededor de la UTN Facultad Regional Haedo, redibujado solo con líneas (sin fondo ni puntos
// de interés): calles con su nombre, la plaza, la manzana de la facultad al centro y un círculo alrededor.
// Cada integrante es un pin dentro del círculo, con sus iniciales y su nombre.
// Las calles casi horizontales bajan 0,19 px por cada px hacia la derecha; las verticales se corren 0,11–0,19 por px hacia abajo.
const horizontal = (base: number) => ({ x1: -40, y1: base + 0.19 * 40, x2: 1520, y2: base - 0.19 * 1520 })
const vertical = (arriba: number, inclinacion: number) => ({ x1: arriba - inclinacion * 40, y1: -40, x2: arriba + inclinacion * 1100, y2: 1100 })
const CALLES = [
  { nombre: 'Vuelta de Obligado', ...horizontal(283), etiqueta: { x: 900, giro: -10.8 } },
  { nombre: 'Los Andes', ...horizontal(517), etiqueta: { x: 1185, giro: -10.8 } },
  { nombre: 'Directorio', ...horizontal(705), etiqueta: { x: 290, giro: -10.8 } },
  { nombre: 'Defensa', x1: 400, y1: 930, x2: 1520, y2: 1005 - 0.19 * 1520, etiqueta: { x: 980, giro: -10.8 } },
  { nombre: '', x1: 240, y1: 790, x2: 1520, y2: 548, etiqueta: null },
  { nombre: 'París', ...vertical(745, 0.109), etiqueta: { y: 250, giro: 83.8 } },
  { nombre: 'Roberto Ruiz', x1: 531, y1: -40, x2: 655, y2: 595, etiqueta: { y: 230, giro: 79 } },
  { nombre: 'Conesa', x1: 293, y1: -40, x2: 410, y2: 640, etiqueta: { y: 250, giro: 80.2 } },
  { nombre: 'Las Flores', ...vertical(1050, 0.156), etiqueta: { y: 700, giro: 81.1 } },
  { nombre: 'Primera Junta', x1: 1150, y1: 0, x2: 1500, y2: 458, etiqueta: null },
  { nombre: 'Int. Cayo Eliseo Goria', x1: -40, y1: 757, x2: 640, y2: 1057, etiqueta: null },
]
// Punto de una calle a cierta x (horizontales) o a cierta y (verticales)
const enX = (c: (typeof CALLES)[number], x: number) => c.y1 + ((x - c.x1) * (c.y2 - c.y1)) / (c.x2 - c.x1)
const enY = (c: (typeof CALLES)[number], y: number) => c.x1 + ((y - c.y1) * (c.x2 - c.x1)) / (c.y2 - c.y1)
// Manzanas a partir de los cruces reales de sus cuatro calles, achicadas para que queden dentro de la cuadra
type Calle = (typeof CALLES)[number]
const calle = (nombre: string) => CALLES.find((c) => c.nombre === nombre) as Calle
const cruce = (a: Calle, b: Calle) => {
  const d = (a.x1 - a.x2) * (b.y1 - b.y2) - (a.y1 - a.y2) * (b.x1 - b.x2)
  const t = ((a.x1 - b.x1) * (b.y1 - b.y2) - (a.y1 - b.y1) * (b.x1 - b.x2)) / d
  return { x: a.x1 + t * (a.x2 - a.x1), y: a.y1 + t * (a.y2 - a.y1) }
}
function manzana(arriba: string, abajo: string, izquierda: string, derecha: string, margen = 22) {
  const [ar, ab, iz, de] = [arriba, abajo, izquierda, derecha].map(calle)
  const esquinas = [cruce(ar, iz), cruce(ar, de), cruce(ab, de), cruce(ab, iz)]
  const cx = esquinas.reduce((s, p) => s + p.x, 0) / 4, cy = esquinas.reduce((s, p) => s + p.y, 0) / 4
  const puntos = esquinas.map(({ x, y }) => { const dx = cx - x, dy = cy - y, l = Math.hypot(dx, dy); return `${x + (dx / l) * margen},${y + (dy / l) * margen}` })
  return { puntos: puntos.join(' '), centro: { x: cx, y: cy } }
}
const MANZANA_UTN = manzana('Los Andes', 'Directorio', 'Roberto Ruiz', 'París')
const PLAZA = manzana('Los Andes', 'Directorio', 'Conesa', 'Roberto Ruiz')
const UTN = { x: MANZANA_UTN.centro.x, y: MANZANA_UTN.centro.y - 20 }
const POSICIONES = [{ x: 500, y: 330 }, { x: 990, y: 300 }, { x: 545, y: 735 }, { x: 1000, y: 650 }]
const TONOS = ['#1F4E79', '#2F7DC1', '#163A5A', '#3D5A80']

function BarrioEquipo() {
  return (
    <figure className="barrio-equipo reveal" style={demora(1)} aria-hidden="true">
      <svg viewBox="180 120 1100 780" className="barrio-equipo__plano">
        {/* Calles: borde gris y centro blanco (se ven como corredores, sin fondo) */}
        {CALLES.map((c, i) => <path key={`b${i}`} className="barrio-equipo__calle-borde" d={`M ${c.x1} ${c.y1} L ${c.x2} ${c.y2}`} />)}
        {CALLES.map((c, i) => <path key={`c${i}`} className="barrio-equipo__calle" d={`M ${c.x1} ${c.y1} L ${c.x2} ${c.y2}`} />)}
        <polygon className="barrio-equipo__plaza" points={PLAZA.puntos} />
        {[[-50, -25], [15, -45], [-25, 30], [45, 15]].map(([dx, dy]) => (
          <circle key={`${dx}`} className="barrio-equipo__arbol" cx={PLAZA.centro.x + dx} cy={PLAZA.centro.y + dy} r={14} />
        ))}
        <polygon className="barrio-equipo__manzana-utn" points={MANZANA_UTN.puntos} />
        {CALLES.filter((c) => c.etiqueta).map((c) => {
          const e = c.etiqueta as { x?: number; y?: number; giro: number }
          const x = e.x ?? enY(c, e.y as number)
          const y = e.y ?? enX(c, e.x as number)
          return <text key={c.nombre} className="barrio-equipo__nombre-calle" transform={`translate(${x} ${y}) rotate(${e.giro})`} y={-18}>{c.nombre}</text>
        })}
        {/* Zona del grupo alrededor de la facultad */}
        <circle className="barrio-equipo__zona" cx={UTN.x} cy={UTN.y} r={330} />
        {/* La facultad */}
        <g transform={`translate(${UTN.x} ${UTN.y})`} className="barrio-equipo__utn">
          <rect x={-46} y={-46} width={92} height={70} rx={14} />
          <text className="barrio-equipo__utn-sigla" x={0} y={-8}>UTN</text>
          <rect className="barrio-equipo__etiqueta" x={-190} y={36} width={380} height={52} rx={26} />
          <text className="barrio-equipo__nombre barrio-equipo__nombre--utn" x={0} y={70}>UTN Facultad Regional Haedo</text>
        </g>
        {EQUIPO.map((m, i) => {
          const { x, y } = POSICIONES[i % POSICIONES.length]
          const nombre = m.nombre.split(/\s+/)[0]
          const ancho = 22 + nombre.length * 8.4
          return (
            <g key={m.id} transform={`translate(${x} ${y}) scale(1.9)`}>
              <g className="barrio-equipo__pin" style={{ '--i': i } as CSSProperties}>
                <ellipse className="barrio-equipo__sombra" cx={0} cy={4} rx={12} ry={4} />
                <path d="M0 0 C -6 -14 -26 -26 -26 -48 A 26 26 0 1 1 26 -48 C 26 -26 6 -14 0 0 Z" fill={TONOS[i % TONOS.length]} />
                {m.foto ? (
                  <>
                    <clipPath id={`pin-foto-${m.id}`}><circle cx={0} cy={-48} r={21} /></clipPath>
                    <image href={m.foto} x={-21} y={-69} width={42} height={42} preserveAspectRatio="xMidYMid slice" clipPath={`url(#pin-foto-${m.id})`} />
                  </>
                ) : (
                  <text className="barrio-equipo__iniciales" x={0} y={-42}>{iniciales(m.nombre)}</text>
                )}
                <rect className="barrio-equipo__etiqueta" x={-ancho / 2} y={12} width={ancho} height={26} rx={13} />
                <text className="barrio-equipo__nombre" x={0} y={30}>{nombre}</text>
              </g>
            </g>
          )
        })}
      </svg>
      <figcaption className="barrio-equipo__leyenda">{EQUIPO.length} integrantes alrededor de la UTN Haedo</figcaption>
    </figure>
  )
}

function Foto({ miembro, indice, clase }: { miembro: MiembroEquipo; indice: number; clase: string }) {
  // La foto es decorativa: el nombre ya está escrito al lado
  return miembro.foto
    ? <img className={clase} src={miembro.foto} alt="" loading="lazy" />
    : <span className={`${clase} avatar-tono--${indice % 4}`} aria-hidden="true">{iniciales(miembro.nombre)}</span>
}

const IconoGithub = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20" fill="currentColor"><path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" /></svg>
)
const IconoLinkedin = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20" fill="currentColor"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" /></svg>
)

// Página "Nosotros": quiénes somos, el equipo, valores, historia y números del proyecto.
export default function Nosotros() {
  const raiz = useAparicion<HTMLDivElement>()

  return (
    <div ref={raiz}>
      {/* 1. Presentación */}
      <section className="nosotros-hero" aria-labelledby="nosotros-titulo">
        <div className="container nosotros-hero__inner">
          <div className="reveal">
            <p className="etiqueta-seccion">Nosotros</p>
            <h1 id="nosotros-titulo">Somos VigiApp <span aria-hidden="true">👋</span></h1>
            <p className="section-lead">
              Somos un equipo de cuatro estudiantes de la Tecnicatura Universitaria en Programación de la UTN Facultad
              Regional Haedo, y VigiApp es nuestro proyecto final de la carrera.
              Creamos VigiApp para que los vecinos dejen de perder alertas importantes entre cientos de mensajes
              y puedan cuidarse entre todos, con información ordenada y en tiempo real.
            </p>
            <div className="nosotros-hero__acciones">
              <a href="#equipo" className="btn btn-primary">Conocé al equipo</a>
              <a href="#historia" className="btn btn-outline">Nuestra historia</a>
            </div>
          </div>
          <BarrioEquipo />
        </div>
      </section>

      {/* 2. Equipo */}
      <section className="section section--soft" id="equipo" aria-labelledby="equipo-titulo">
        <div className="container">
          <div className="section__head reveal">
            <h2 id="equipo-titulo">Un equipo de personas reales</h2>
            <p className="section-lead">Cuatro estudiantes, cuatro miradas y un mismo objetivo: que la tecnología acerque a los vecinos.</p>
          </div>
          <ul className="equipo-grid">
            {EQUIPO.map((m, i) => (
              <li key={m.id} className="card persona reveal" style={demora(i)}>
                <Foto miembro={m} indice={i} clase="persona__foto" />
                <h3>{m.nombre}</h3>
                <p className="persona__rol">{m.rol}</p>
                <p className="persona__lugar"><span aria-hidden="true">📍</span> {m.ubicacion}</p>
                <p className="persona__aporte">{m.aporte}</p>
                {(m.github || m.linkedin) && (
                  <div className="persona__links">
                    {m.github && <a href={m.github} target="_blank" rel="noreferrer" aria-label={`GitHub de ${m.nombre}`}><IconoGithub /></a>}
                    {m.linkedin && <a href={m.linkedin} target="_blank" rel="noreferrer" aria-label={`LinkedIn de ${m.nombre}`}><IconoLinkedin /></a>}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 3. Valores */}
      <section className="section" aria-labelledby="valores-titulo">
        <div className="container">
          <div className="section__head reveal">
            <h2 id="valores-titulo">Lo que nos guía</h2>
            <p className="section-lead">Seis principios que aparecen en cada pantalla de la aplicación.</p>
          </div>
          <ul className="valores">
            {VALORES.map((v, i) => (
              <li key={v.titulo} className="card valor reveal" style={demora(i % 3)}>
                <span className="valor__emoji" aria-hidden="true">{v.emoji}</span>
                <h3>{v.titulo}</h3>
                <p>{v.texto}</p>
                <details>
                  <summary>Cómo lo aplicamos</summary>
                  <ul>{v.practicas.map((p) => <li key={p}>{p}</li>)}</ul>
                </details>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 4. Historia */}
      <section className="section section--soft" id="historia" aria-labelledby="historia-titulo">
        <div className="container historia">
          <div className="historia__texto reveal">
            <h2 id="historia-titulo">Nuestra historia</h2>
            <p>
              Todo empezó como el proyecto final de nuestra carrera, con una pregunta simple: ¿por qué una alerta importante
              del barrio se pierde entre cientos de mensajes del grupo de WhatsApp?
            </p>
            <p>
              Diseñamos una aplicación donde cada incidente tiene ubicación, estado e historial, y donde un pedido
              de ayuda llega al instante y no se mezcla con la charla de todos los días.
            </p>
            <p>
              Nos repartimos el trabajo: la interfaz en React y TypeScript, la API en NestJS y la base de datos en
              MariaDB. En cada reunión de equipo sumamos reglas nuevas, como los grupos con dueño, los incidentes
              urgentes y normales o los avisos, y las fuimos incorporando de a una.
            </p>
          </div>
          <ol className="hitos reveal" style={demora(1)} aria-label="Etapas del proyecto">
            {HITOS.map((h) => (
              <li key={h.titulo}><strong>{h.titulo}</strong><span>{h.texto}</span></li>
            ))}
          </ol>
        </div>
      </section>

      {/* 5. Números */}
      <section className="numeros" aria-labelledby="numeros-titulo">
        <div className="container">
          <h2 id="numeros-titulo" className="reveal">VigiApp en números</h2>
          <ul className="numeros__grid">
            {NUMEROS.map((n, i) => (
              <li key={n.texto} className="reveal" style={demora(i)}>
                <span className="numero__valor">{n.valor}</span>
                <span className="numero__texto">{n.texto}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 6. Llamado a la acción */}
      <section className="cta">
        <div className="container">
          <h2>¿Querés que tu barrio use VigiApp?</h2>
          <p>Creá tu cuenta, armá el grupo de tu cuadra e invitá a tus vecinos. Si tenés dudas, escribinos.</p>
          <div className="cta__actions">
            <Link to="/registro" className="btn btn-light">Crear cuenta</Link>
            <Link to="/contacto" className="btn btn-outline-light">Escribinos</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
