import { useEffect, useRef, type CSSProperties, type PointerEvent } from 'react'
import { Link } from 'react-router-dom'
import Contador from '../../components/Contador'
import LiveAlertsDemo from '../../components/LiveAlertsDemo'
import { colorDeCategoria } from '../../data/incidentTypes'
import { CATEGORIAS_MOCK, EQUIPO_MOCK } from '../../data/mock'
import IconoCategoria from '../../components/IconoCategoria'

// Contenido de las secciones (datos estáticos de la página)
const PROBLEMAS = [
  { icono: '💬', titulo: 'Las alertas se pierden', texto: 'Un aviso importante queda enterrado entre cadenas, fotos y saludos.' },
  { icono: '🔀', titulo: 'Urgencias mezcladas con charla', texto: 'Un robo y una consulta por el reciclaje aparecen en el mismo lugar y con el mismo peso.' },
  { icono: '❓', titulo: 'Nadie sabe cómo terminó', texto: 'Se avisa del problema, pero no hay forma de seguirlo hasta que se resuelve.' },
  { icono: '📍', titulo: 'Sin ubicación ni registro', texto: 'Diez vecinos avisan lo mismo, nadie sabe dónde fue exactamente y no queda historial.' },
]

const PASOS = [
  { icono: '📸', titulo: 'Reportá', texto: 'Sacá una foto, elegí la categoría y marcá el lugar. Lleva menos de un minuto.' },
  { icono: '🗺️', titulo: 'Visualizalo en el mapa', texto: 'Tus vecinos lo ven en el mapa y lo confirman con "Yo también lo vi", sin repetir reportes.' },
  { icono: '✅', titulo: 'Seguilo hasta resolverlo', texto: 'Cada cambio de estado queda en el historial: reportado, en seguimiento, resuelto.' },
]

const FUNCIONALIDADES = [
  { icono: '🗺️', titulo: 'Mapa colaborativo', texto: 'Mirá los incidentes de tu zona en un mapa y filtralos por categoría y estado. También podés verlos como lista y buscar por texto.' },
  { icono: '🔔', titulo: 'Alertas de seguridad', texto: 'Las situaciones prioritarias aparecen arriba de todo, separadas de los avisos comunes, hasta que un administrador las cierra.' },
  { icono: '🆘', titulo: 'Botón de ayuda', texto: 'Pedí ayuda a tu comunidad eligiendo el tipo de emergencia y manteniendo presionado 3 segundos, para evitar activaciones accidentales. No reemplaza al 911.' },
  { icono: '📢', titulo: 'Avisos de la comunidad', texto: 'Cortes programados, reuniones y recomendaciones, con prioridad normal o importante.' },
  { icono: '👀', titulo: 'Confirmaciones de vecinos', texto: '"Yo también lo vi" suma una confirmación al reporte que ya existe, en lugar de crear uno repetido.' },
  { icono: '🧭', titulo: 'Seguimiento hasta la resolución', texto: 'Una línea de tiempo muestra cada cambio de estado, para saber en qué quedó cada problema.' },
  { icono: '🛡️', titulo: 'Moderación del administrador', texto: 'Un administrador revisa los reportes, gestiona categorías y avisos, y cierra las alertas indicando si fueron resueltas o falsas alarmas.' },
  { icono: '🌙', titulo: 'Modo noche y celular', texto: 'Cambiá entre modo día y noche con un toque, y agregá la app a la pantalla de inicio para usarla como cualquier otra.' },
]

// Variable CSS por elemento (retraso de entrada, intensidad del movimiento, etc.)
const v = (nombre: string, valor: string | number) => ({ [nombre]: valor }) as CSSProperties

// Celular de ejemplo, hecho solo con CSS (decorativo)
function HeroPhone() {
  return (
    <div className="phone" aria-hidden="true">
      <div className="phone__screen">
        <div className="phone__bar"><span>Mapa</span><span>🔎</span></div>
        <div className="phone__body">
          <div className="mini-map">
            <span className="pin-mini pin-alerta" style={{ left: '22%', top: '30%' }} />
            <span className="pin-mini pin-incidencia" style={{ left: '58%', top: '52%' }} />
            <span className="pin-mini pin-resuelto" style={{ left: '78%', top: '24%' }} />
            <span className="pin-mini pin-aviso" style={{ left: '34%', top: '68%' }} />
          </div>
          <div className="mini-card nivel-incidencia">
            <span className="nivel-tag">Reportado · Alumbrado</span>
            <strong>Luz quemada en la plaza</strong>
            <span>6 vecinos lo vieron</span>
          </div>
          <div className="mini-card nivel-resuelto">
            <span className="nivel-tag">Resuelto · Baches</span>
            <strong>Bache reparado en Av. Mitre</strong>
          </div>
        </div>
        <div className="phone__tabs">
          <span>🏠</span><span>🗺️</span><span className="phone__fab">🚨</span><span>🔔</span><span>👤</span>
        </div>
      </div>
    </div>
  )
}

// Flecha dibujada a mano que se "traza" cuando aparece
function Flecha({ abajoIzquierda = false }: { abajoIzquierda?: boolean }) {
  return (
    <svg className={`flecha ${abajoIzquierda ? 'flecha--izq' : ''}`} viewBox="0 0 90 70" fill="none" aria-hidden="true">
      <path d="M6 8c30-4 62 8 70 46" pathLength="1" />
      <path d="M62 44l14 12 8-17" pathLength="1" />
    </svg>
  )
}

export default function Landing() {
  const raiz = useRef<HTMLDivElement>(null)
  const hero = useRef<HTMLElement>(null)

  // Las secciones aparecen suavemente al llegar a la pantalla
  useEffect(() => {
    const elementos = raiz.current?.querySelectorAll<HTMLElement>('.reveal') ?? []
    const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (sinMovimiento || !('IntersectionObserver' in window)) {
      elementos.forEach((e) => e.classList.add('is-visible'))
      return
    }
    const observador = new IntersectionObserver((entradas) => {
      for (const entrada of entradas) {
        if (!entrada.isIntersecting) continue
        entrada.target.classList.add('is-visible')
        observador.unobserve(entrada.target)
      }
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' })
    elementos.forEach((e) => observador.observe(e))
    return () => observador.disconnect()
  }, [])

  // Los elementos flotantes del hero siguen apenas al puntero (solo con mouse y sin "reducir movimiento")
  function moverHero(e: PointerEvent<HTMLElement>) {
    if (e.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const caja = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', String(((e.clientX - caja.left) / caja.width - 0.5).toFixed(3)))
    e.currentTarget.style.setProperty('--my', String(((e.clientY - caja.top) / caja.height - 0.5).toFixed(3)))
  }

  const categorias = CATEGORIAS_MOCK.filter((c) => c.activa)

  return (
    <div ref={raiz} className="landing">
      {/* 1. Hero */}
      <section ref={hero} className="hero" onPointerMove={moverHero}>
        <div className="hero__fondo" aria-hidden="true"><span /><span /><span /></div>
        <div className="container hero__inner">
          <p className="hero__kicker"><span className="hero__punto" aria-hidden="true" /> Seguridad vecinal en tiempo real</p>
          <h1 className="hero__titulo">
            Tu barrio, <span className="resaltado">organizado</span> y <span className="resaltado resaltado--2">más seguro</span>
          </h1>
          <p className="hero__lead">
            Reportá incidentes, mirá qué pasa cerca tuyo en el mapa y seguí cada problema
            hasta que se resuelve. Todo en un solo lugar, sin perderte entre mensajes.
          </p>
          <div className="hero__actions">
            <Link to="/registro" className="btn btn-primary btn-grande">Registrarse</Link>
            <Link to="/login" className="btn btn-outline btn-grande">Ingresar</Link>
          </div>
          <p className="hero__hint">Pensada para vecinos de todas las edades, desde el celular.</p>

          {/* Escena decorativa: el celular con elementos que flotan a su alrededor */}
          <div className="escena" aria-hidden="true">
            <span className="sticker sticker--escudo" style={v('--k', 22)}><span className="sticker__in" style={v('--dur', '6s')}>🛡️</span></span>
            <span className="sticker sticker--pin" style={v('--k', -26)}><span className="sticker__in" style={v('--dur', '5s')}>📍</span></span>
            <span className="sticker sticker--campana" style={v('--k', 30)}><span className="sticker__in sticker__in--timbre">🔔</span></span>
            <span className="sticker sticker--luz" style={v('--k', -18)}><span className="sticker__in sticker__in--luz">💡</span></span>

            <span className="toast-flot toast-flot--alerta nivel-alerta" style={v('--k', 34)}>
              <span className="toast-flot__in" style={v('--dur', '7s')}>
                <span className="toast-flot__icono">🚨</span>
                <span><strong>Alerta</strong><small>Actividad sospechosa · hace 1 min</small></span>
              </span>
            </span>
            <span className="toast-flot toast-flot--ok nivel-resuelto" style={v('--k', -30)}>
              <span className="toast-flot__in" style={v('--dur', '8s')}>
                <span className="toast-flot__icono">✅</span>
                <span><strong>Resuelto</strong><small>Bache reparado en Av. Mitre</small></span>
              </span>
            </span>
            <span className="toast-flot toast-flot--vistos nivel-aviso" style={v('--k', 26)}>
              <span className="toast-flot__in" style={v('--dur', '6.5s')}>
                <span className="toast-flot__icono">👀</span>
                <span><strong>6 vecinos lo vieron</strong></span>
              </span>
            </span>

            <HeroPhone />
          </div>
        </div>
      </section>

      {/* Banda con las categorías que se pueden reportar (se desliza sola) */}
      <section className="marquee" aria-label="Categorías de incidentes que podés reportar">
        <div className="marquee__pista">
          {[0, 1].map((copia) => (
            <ul key={copia} className="marquee__lista" aria-hidden={copia === 1}>
              {categorias.map((c) => (
                <li key={c.id} className="marquee__item" style={v('--pin', colorDeCategoria(c.id))}>
                  <IconoCategoria icono={c.icono} />{c.nombre}
                </li>
              ))}
            </ul>
          ))}
        </div>
      </section>

      {/* 2. Todo al instante */}
      <section className="section instant">
        <div className="container">
          <div className="section__head section__head--centro reveal">
            <h2>Todo al instante</h2>
            <p className="section-lead">Pensamos cada paso para que avisar sea más rápido que mandar un mensaje.</p>
          </div>
          <div className="instant__grid">
            <article className="instant__stat reveal" style={v('--i', 0)}>
              <p className="instant__num"><Contador hasta={60} /><small>segundos</small></p>
              <p>o menos para reportar un incidente: foto, categoría y lugar en el mapa.</p>
            </article>
            <Flecha />
            <article className="instant__stat instant__stat--alta reveal" style={v('--i', 1)}>
              <p className="instant__num"><Contador hasta={3} /><small>segundos</small></p>
              <p>manteniendo presionado el botón de ayuda para avisar a tu comunidad, sin activaciones accidentales.</p>
            </article>
            <Flecha abajoIzquierda />
            <article className="instant__stat reveal" style={v('--i', 2)}>
              <p className="instant__num"><Contador hasta={5} /><small>niveles</small></p>
              <p>de urgencia, cada uno con su color, para que lo importante no quede enterrado.</p>
            </article>
          </div>
        </div>
      </section>

      {/* 3. El problema */}
      <section className="section section--soft">
        <div className="container">
          <div className="section__head reveal">
            <h2>Los grupos de mensajería no fueron hechos para esto</h2>
            <p className="section-lead">Funcionan para conversar, pero fallan cuando hay que avisar, ubicar y dar seguimiento.</p>
          </div>
          <div className="problems">
            {PROBLEMAS.map((p, i) => (
              <article key={p.titulo} className="card reveal" style={v('--i', i)}>
                <span className="problem__icon" aria-hidden="true">{p.icono}</span>
                <h3>{p.titulo}</h3>
                <p>{p.texto}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Cómo funciona */}
      <section className="section" id="como-funciona">
        <div className="container">
          <div className="section__head section__head--centro reveal">
            <h2>Cómo funciona</h2>
            <p className="section-lead">De un reporte a un problema resuelto, en tres pasos.</p>
          </div>
          <ol className="steps reveal">
            {PASOS.map((paso, i) => (
              <li key={paso.titulo} className="step" style={v('--i', i)}>
                <span className="step__num" aria-hidden="true">{paso.icono}</span>
                <div>
                  <h3><span className="step__n">{i + 1}.</span> {paso.titulo}</h3>
                  <p>{paso.texto}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 5. Alertas en vivo con notificaciones */}
      <section className="section section--soft" id="alertas-en-vivo">
        <div className="container reveal">
          <LiveAlertsDemo />
        </div>
      </section>

      {/* 6. Funcionalidades */}
      <section className="section" id="funcionalidades">
        <div className="container">
          <div className="section__head reveal">
            <h2>Todo lo que podés hacer</h2>
            <p className="section-lead">Cada función resuelve un problema concreto de la convivencia en el barrio.</p>
          </div>
          <ul className="features">
            {FUNCIONALIDADES.map((f, i) => (
              <li key={f.titulo} className="feature reveal" style={v('--i', i % 2)}>
                <span className="feature__icon" aria-hidden="true">{f.icono}</span>
                <div>
                  <h3>{f.titulo}</h3>
                  <p>{f.texto}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 7. Nosotros */}
      <section className="section section--soft" id="nosotros">
        <div className="container">
          <div className="section__head reveal">
            <h2>Nosotros</h2>
            <p className="section-lead">
              VigiApp es un proyecto de la materia Programación 4. Parte de algo que pasa en
              cualquier barrio: los avisos importantes se pierden en los grupos de mensajería.
              Lo resolvemos con una aplicación pensada para que reportar, confirmar y seguir una
              incidente sea simple para cualquier vecino.
            </p>
          </div>
          <h3 className="reveal">El equipo</h3>
          <div className="team">
            {EQUIPO_MOCK.map((m, i) => (
              <article key={m.id} className="card team__member reveal" style={v('--i', i)}>
                <span className="team__avatar" aria-hidden="true">👤</span>
                <strong>{m.nombre}</strong>
                <span>{m.rol}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Llamado a la acción final */}
      <section className="cta">
        <span className="cta__flota cta__flota--1" aria-hidden="true">🛡️</span>
        <span className="cta__flota cta__flota--2" aria-hidden="true">📍</span>
        <span className="cta__flota cta__flota--3" aria-hidden="true">🔔</span>
        <div className="container reveal">
          <h2>Sumate a tu comunidad</h2>
          <p>Creá tu cuenta, elegí tu comunidad y empezá a reportar, confirmar y seguir lo que pasa a tu alrededor.</p>
          <div className="cta__actions">
            <Link to="/registro" className="btn btn-light btn-grande">Registrarse</Link>
            <Link to="/login" className="btn btn-outline-light btn-grande">Ingresar</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
