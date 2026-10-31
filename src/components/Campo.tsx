import type { ReactNode } from 'react'

// Campo de formulario: label + control + ayuda + mensaje de error.
// El control (children) debe tener el mismo id y aria-describedby apuntando a `${id}-error` / `${id}-ayuda`.
interface Props {
  id: string
  etiqueta: string
  error?: string
  ayuda?: string
  children: ReactNode
}

export default function Campo({ id, etiqueta, error, ayuda, children }: Props) {
  return (
    <div className="campo">
      <label htmlFor={id}>{etiqueta}</label>
      {children}
      {ayuda && <p id={`${id}-ayuda`} className="campo__ayuda">{ayuda}</p>}
      {error && <p id={`${id}-error`} className="campo__error" role="alert">{error}</p>}
    </div>
  )
}
