import type { ReactNode } from 'react'

// Estado vacío: un ícono grande, qué pasó y qué hacer (children = botones de acción).
interface Props {
  icono?: string
  titulo: string
  texto?: string
  children?: ReactNode
}

export default function EmptyState({ icono = '🔍', titulo, texto, children }: Props) {
  return (
    <div className="empty">
      <span className="empty__icon" aria-hidden="true">{icono}</span>
      <h3>{titulo}</h3>
      {texto && <p>{texto}</p>}
      {children && <div className="empty__actions">{children}</div>}
    </div>
  )
}
