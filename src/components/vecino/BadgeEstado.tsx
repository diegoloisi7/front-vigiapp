import type { EstadoIncidencia } from '../../types'

const TEXTOS: Record<EstadoIncidencia, string> = {
  REPORTADO: 'Reportado',
  EN_SEGUIMIENTO: 'En seguimiento',
  RESUELTO: 'Resuelto',
  DESCARTADO: 'Descartado',
  EXPIRADO: 'Expirado',
}

// Estado de un incidente: badge neutro con un punto de color (el color fuerte queda para el tipo).
export default function BadgeEstado({ estado }: { estado: EstadoIncidencia }) {
  return (
    <span className={`vg-estado vg-estado--${estado.toLowerCase()}`}>
      <span className="vg-estado__punto" aria-hidden="true" />
      {TEXTOS[estado]}
    </span>
  )
}
