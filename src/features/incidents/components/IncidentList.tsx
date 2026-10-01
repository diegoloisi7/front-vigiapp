import type { Incident, IncidentCategory } from '../types'

const categoryLabels: Record<IncidentCategory, string> = {
  robo: 'Robo',
  'actividad-sospechosa': 'Actividad sospechosa',
  emergencia: 'Emergencia',
}

export function IncidentList({ incidents }: { incidents: Incident[] }) {
  return (
    <div className="incident-list">
      {incidents.map((incident) => (
        <article className="incident-card" key={incident.id}>
          <div className={`incident-symbol incident-symbol--${incident.category}`} aria-hidden="true">
            {incident.category === 'robo' ? '!' : incident.category === 'emergencia' ? '+' : '?'}
          </div>
          <div className="incident-card__body">
            <div className="incident-card__heading">
              <h3>{incident.title}</h3>
              <span className={`category-tag category-tag--${incident.category}`}>
                {categoryLabels[incident.category]}
              </span>
            </div>
            <p>{incident.description}</p>
            <div className="incident-card__meta">
              <span>{incident.address}</span>
              <time>{incident.reportedAt}</time>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
