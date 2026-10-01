import { IncidentList } from '../../features/incidents/components/IncidentList'
import { IncidentMap } from '../../features/incidents/components/IncidentMap'
import { sampleIncidents } from '../../features/incidents/data/sampleIncidents'

export function IncidentsPage() {
  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="VigiAPP inicio">
          <span className="brand__mark" aria-hidden="true">V</span>
          <span>Vigi<span className="brand__accent">APP</span></span>
        </a>
        <nav className="topbar__nav" aria-label="Navegación principal">
          <a className="topbar__link topbar__link--active" href="#incidentes">Incidentes</a>
          <a className="topbar__link" href="#como-funciona">Cómo funciona</a>
        </nav>
        <button className="profile-button" type="button" aria-label="Perfil de usuario">JD</button>
      </header>

      <section className="welcome" id="incidentes">
        <div>
          <p className="eyebrow">Tu comunidad, más conectada</p>
          <h1>Seguridad que se construye entre todos.</h1>
          <p className="welcome__copy">Mantenete al tanto de lo que pasa cerca tuyo y ayudá a cuidar el barrio.</p>
        </div>
        <button className="report-button" type="button">
          <span aria-hidden="true">＋</span> Reportar incidente
        </button>
      </section>

      <section className="content-grid" aria-label="Incidentes de la zona">
        <div className="map-panel">
          <div className="panel-heading map-panel__heading">
            <div>
              <h2>Mapa de incidentes</h2>
              <p>Villa Crespo · Buenos Aires</p>
            </div>
            <span className="live-status"><span /> Zona activa</span>
          </div>
          <IncidentMap incidents={sampleIncidents} />
          <div className="map-legend" aria-label="Categorías">
            <span><i className="legend-dot legend-dot--robo" /> Robo</span>
            <span><i className="legend-dot legend-dot--sospechosa" /> Actividad sospechosa</span>
            <span><i className="legend-dot legend-dot--emergencia" /> Emergencia</span>
          </div>
        </div>

        <aside className="activity-panel">
          <div className="panel-heading activity-panel__heading">
            <div>
              <h2>Actividad reciente</h2>
              <p>Reportes de tu zona</p>
            </div>
            <span className="incident-count">{sampleIncidents.length}</span>
          </div>
          <IncidentList incidents={sampleIncidents} />
          <button className="all-incidents" type="button">Ver todos los reportes <span aria-hidden="true">→</span></button>
        </aside>
      </section>

      <footer className="page-footer" id="como-funciona">
        <span><span className="footer-dot" /> Información compartida por vecinos</span>
        <span>Ante una emergencia, llamá al 911</span>
      </footer>
    </main>
  )
}
