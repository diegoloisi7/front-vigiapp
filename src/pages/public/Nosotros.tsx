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

// Posiciones de los integrantes sobre el mapa ilustrado del encabezado (en %)
const PINES = [{ x: 34, y: 38 }, { x: 64, y: 30 }, { x: 42, y: 68 }, { x: 70, y: 62 }]

const iniciales = (nombre: string) => nombre.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase()

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
              Somos un equipo de cuatro estudiantes de la Tecnicatura Universitaria en Programación de la UTN.
              Creamos VigiApp para que los vecinos dejen de perder alertas importantes entre cientos de mensajes
              y puedan cuidarse entre todos, con información ordenada y en tiempo real.
            </p>
            <div className="nosotros-hero__acciones">
              <a href="#equipo" className="btn btn-primary">Conocé al equipo</a>
              <a href="#historia" className="btn btn-outline">Nuestra historia</a>
            </div>
          </div>
          <div className="equipo-mapa reveal" style={demora(1)} aria-hidden="true">
            {EQUIPO.map((m, i) => (
              <span key={m.id} className="equipo-mapa__pin" style={{ left: `${PINES[i % PINES.length].x}%`, top: `${PINES[i % PINES.length].y}%` }}>
                <Foto miembro={m} indice={i} clase="equipo-mapa__foto" />
              </span>
            ))}
            <span className="equipo-mapa__leyenda">🏘️ 4 integrantes, un mismo barrio</span>
          </div>
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
              Todo empezó en la materia Programación 4 con una pregunta simple: ¿por qué una alerta importante
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
