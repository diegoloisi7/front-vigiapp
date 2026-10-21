import type { ReactNode } from 'react'
import EmptyState from './EmptyState'

interface Props {
  cargando: boolean
  error: string | null
  onReintentar: () => void
  children: ReactNode
}

// Muestra "cargando" o el error con botón de reintento; si todo está bien, muestra el contenido.
export default function EstadoConsulta({ cargando, error, onReintentar, children }: Props) {
  if (cargando) {
    return (
      <div className="cargando" role="status">
        <span className="sr-only">Cargando…</span>
        <div className="skeleton" />
        <div className="skeleton" />
        <div className="skeleton" />
      </div>
    )
  }
  if (error) {
    return (
      <EmptyState icono="📡" titulo="No pudimos cargar los datos" texto={error}>
        <button type="button" className="btn btn-primary" onClick={onReintentar}>Reintentar</button>
      </EmptyState>
    )
  }
  return <>{children}</>
}
