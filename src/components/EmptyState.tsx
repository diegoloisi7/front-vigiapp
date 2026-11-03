import type { ReactNode } from 'react'
import Icono, { type NombreIcono } from './vecino/Icono'
import { useModoVecino } from './vecino/modoVecino'

// En la vista del vecino los emojis se cambian por íconos SVG (el admin sigue viendo el emoji)
const ICONO_VECINO: Record<string, NombreIcono> = {
  '📡': 'senal', '🔍': 'lupa', '⚠️': 'alertas', '📢': 'comunidad', '🏷️': 'etiqueta',
  '✉️': 'sobre', '🏘️': 'grupos', '📋': 'incidentes', '👥': 'grupos',
}

// Estado vacío: un ícono grande, qué pasó y qué hacer (children = botones de acción).
interface Props {
  icono?: ReactNode // un emoji o un ícono SVG
  titulo: string
  texto?: string
  children?: ReactNode
}

export default function EmptyState({ icono = '🔍', titulo, texto, children }: Props) {
  const vecino = useModoVecino()
  const simbolo = vecino && typeof icono === 'string' ? <Icono nombre={ICONO_VECINO[icono] ?? 'alertas'} tamano={36} /> : icono
  return (
    <div className="empty">
      <span className="empty__icon" aria-hidden="true">{simbolo}</span>
      <h3>{titulo}</h3>
      {texto && <p>{texto}</p>}
      {children && <div className="empty__actions">{children}</div>}
    </div>
  )
}
