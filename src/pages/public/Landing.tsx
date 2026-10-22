import { Link } from 'react-router-dom'
import LiveAlertsDemo from '../../components/LiveAlertsDemo'
import { EQUIPO_MOCK } from '../../data/mock'

// Contenido de las secciones (datos estáticos de la página)
const PROBLEMAS = [
  { icono: '💬', titulo: 'Las alertas se pierden', texto: 'Un aviso importante queda enterrado entre cadenas, fotos y saludos.' },
  { icono: '🔀', titulo: 'Urgencias mezcladas con charla', texto: 'Un robo y una consulta por el reciclaje aparecen en el mismo lugar y con el mismo peso.' },
  { icono: '❓', titulo: 'Nadie sabe cómo terminó', texto: 'Se avisa del problema, pero no hay forma de seguirlo hasta que se resuelve.' },
  { icono: '📍', titulo: 'Sin ubicación ni registro', texto: 'Diez vecinos avisan lo mismo, nadie sabe dónde fue exactamente y no queda historial.' },
]

const PASOS = [
  { titulo: 'Reportá', texto: 'Sacá una foto, elegí la categoría y marcá el lugar. Lleva menos de un minuto.' },
  { titulo: 'Visualizalo en el mapa', texto: 'Tus vecinos lo ven en el mapa y lo confirman con "Yo también lo vi", sin repetir reportes.' },
  { titulo: 'Seguilo hasta resolverlo', texto: 'Cada cambio de estado queda en el historial: reportado, en seguimiento, resuelto.' },
]

const FUNCIONALIDADES = [
  { icono: '🗺️', titulo: 'Mapa colaborativo', texto: 'Mirá los incidentes de tu zona en un mapa y filtralas por categoría y estado. También podés verlas como lista y buscar por texto.' },
  { icono: '🔔', titulo: 'Alertas de seguridad', texto: 'Las situaciones prioritarias aparecen arriba de todo, separadas de los avisos comunes, hasta que un administrador las cierra.' },
  { icono: '🆘', titulo: 'Botón de ayuda', texto: 'Pedí ayuda a tu comunidad eligiendo el tipo de emergencia y manteniendo presionado 3 segundos, para evitar activaciones accidentales. No reemplaza al 911.' },
  { icono: '📢', titulo: 'Avisos de la comunidad', texto: 'Cortes programados, reuniones y recomendaciones, con prioridad normal o importante.' },
  { icono: '👀', titulo: 'Confirmaciones de vecinos', texto: '"Yo también lo vi" suma una confirmación al reporte que ya existe, en lugar de crear uno repetido.' },
  { icono: '🧭', titulo: 'Seguimiento hasta la resolución', texto: 'Una línea de tiempo muestra cada cambio de estado, para saber en qué quedó cada problema.' },
  { icono: '🛡️', titulo: 'Moderación del administrador', texto: 'Un administrador revisa los reportes, gestiona categorías y avisos, y cierra las alertas indicando si fueron resueltas o falsas alarmas.' },
  { icono: '📱', titulo: 'Instalable en el celular', texto: 'Se agrega a la pantalla de inicio y se usa como una app, sin pasar por una tienda.' },
]

// Celular de ejemplo para el hero, hecho solo con CSS (decorativo)
function HeroPhone() {
  return (
    <div className="phone" aria-hidden="true">
      <div className="phone__screen">
        <div className="phone__bar"><span>Mapa</span><span>🔎</span></div>
        <div className="phone__body">
          <div className="mini-map">
            <span className="pin pin-alerta" style={{ left: '22%', top: '30%' }} />
            <span className="pin pin-incidencia" style={{ left: '58%', top: '52%' }} />
            <span className="pin pin-resuelto" style={{ left: '78%', top: '24%' }} />
            <span className="pin pin-aviso" style={{ left: '34%', top: '68%' }} />
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

export default function Landing() {
  return (
    <>
      {/* 1. Hero */}
      <section className="hero">
        <div className="container hero__inner">
          <div>
            <h1>Tu barrio, organizado y más seguro</h1>
            <p className="hero__lead">
              Reportá incidentes, mirá qué pasa cerca tuyo en el mapa y seguí cada problema
              hasta que se resuelve. Todo en un solo lugar, sin perderte entre mensajes.
            </p>
            <div className="hero__actions">
              <Link to="/registro" className="btn btn-primary">Registrarse</Link>
              <Link to="/login" className="btn btn-outline">Ingresar</Link>
            </div>
            <p className="hero__hint">Pensada para vecinos de todas las edades, desde el celular.</p>
          </div>
          <HeroPhone />
        </div>
      </section>

      {/* 2. El problema */}
      <section className="section section--soft">
        <div className="container">
          <div className="section__head">
            <h2>Los grupos de mensajería no fueron hechos para esto</h2>
            <p className="section-lead">Funcionan para conversar, pero fallan cuando hay que avisar, ubicar y dar seguimiento.</p>
          </div>
          <div className="problems">
            {PROBLEMAS.map((p) => (
              <article key={p.titulo} className="card">
                <span className="problem__icon" aria-hidden="true">{p.icono}</span>
                <h3>{p.titulo}</h3>
                <p>{p.texto}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Cómo funciona */}
      <section className="section" id="como-funciona">
        <div className="container">
          <div className="section__head">
            <h2>Cómo funciona</h2>
            <p className="section-lead">De un reporte a un problema resuelto, en tres pasos.</p>
          </div>
          <ol className="steps">
            {PASOS.map((paso, i) => (
              <li key={paso.titulo} className="step">
                <span className="step__num" aria-hidden="true">{i + 1}</span>
                <div>
                  <h3>{paso.titulo}</h3>
                  <p>{paso.texto}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 4. Alertas en vivo con notificaciones */}
      <section className="section section--soft" id="alertas-en-vivo">
        <div className="container">
          <LiveAlertsDemo />
        </div>
      </section>

      {/* 5. Funcionalidades */}
      <section className="section" id="funcionalidades">
        <div className="container">
          <div className="section__head">
            <h2>Todo lo que podés hacer</h2>
            <p className="section-lead">Cada función resuelve un problema concreto de la convivencia en el barrio.</p>
          </div>
          <ul className="features">
            {FUNCIONALIDADES.map((f) => (
              <li key={f.titulo} className="feature">
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

      {/* 6. Nosotros */}
      <section className="section section--soft" id="nosotros">
        <div className="container">
          <div className="section__head">
            <h2>Nosotros</h2>
            <p className="section-lead">
              Vecinal es un proyecto de la materia Programación 4. Parte de algo que pasa en
              cualquier barrio: los avisos importantes se pierden en los grupos de mensajería.
              Lo resolvemos con una aplicación pensada para que reportar, confirmar y seguir una
              incidente sea simple para cualquier vecino.
            </p>
          </div>
          <h3>El equipo</h3>
          <div className="team">
            {EQUIPO_MOCK.map((m) => (
              <article key={m.id} className="card team__member">
                <span className="team__avatar" aria-hidden="true">👤</span>
                <strong>{m.nombre}</strong>
                <span>{m.rol}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Llamado a la acción final */}
      <section className="cta">
        <div className="container">
          <h2>Sumate a tu comunidad</h2>
          <p>Creá tu cuenta, elegí tu comunidad y empezá a reportar, confirmar y seguir lo que pasa a tu alrededor.</p>
          <div className="cta__actions">
            <Link to="/registro" className="btn btn-light">Registrarse</Link>
            <Link to="/login" className="btn btn-outline-light">Ingresar</Link>
          </div>
        </div>
      </section>
    </>
  )
}
