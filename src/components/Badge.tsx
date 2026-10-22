import type { TipoBadge } from '../types'

// Etiqueta de estado. El color sigue el sistema visual (ver variables.css).
const BADGES: Record<TipoBadge, [string, string]> = {
  REPORTADO: ['Reportado', 'badge--incidencia'],
  EN_SEGUIMIENTO: ['En seguimiento', 'badge--seguimiento'],
  RESUELTO: ['Resuelto', 'badge--resuelto'],
  DESCARTADO: ['Descartado', 'badge--muted'],
  ACTIVA: ['Activa', 'badge--alerta'],
  CERRADA: ['Cerrada', 'badge--resuelto'],
  IMPORTANTE: ['Importante', 'badge--aviso'],
  NORMAL: ['Normal', 'badge--muted'],
  PENDIENTE: ['Pendiente', 'badge--incidencia'],
  ACEPTADA: ['Aceptada', 'badge--resuelto'],
  RECHAZADA: ['Rechazada', 'badge--muted'],
  OWNER: ['Owner', 'badge--seguimiento'],
  MIEMBRO: ['Miembro', 'badge--muted'],
  ACTIVO: ['Grupo activo', 'badge--activo'],
  EXPIRADO: ['Expirado', 'badge--muted'],
  URGENTE: ['Urgente', 'badge--urgente'],
}

export default function Badge({ tipo }: { tipo: TipoBadge }) {
  const [texto, clase] = BADGES[tipo] ?? [tipo, 'badge--muted']
  return <span className={`badge ${clase}`}>{texto}</span>
}
