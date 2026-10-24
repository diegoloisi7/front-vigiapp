import { useTema } from '../context/TemaContext'

// Interruptor de modo noche: un toque oscurece la app y otro toque la vuelve a dejar como estaba.
export default function ToggleTema({ className = '' }: { className?: string }) {
  const { esOscuro, alternar } = useTema()
  return (
    <button
      type="button"
      role="switch"
      aria-checked={esOscuro}
      aria-label="Modo noche"
      title={esOscuro ? 'Volver al modo día' : 'Activar modo noche'}
      className={`tema-toggle ${className}`}
      onClick={alternar}
    >
      <span className="tema-toggle__fondo" aria-hidden="true"><span>☀️</span><span>🌙</span></span>
      <span className="tema-toggle__perilla" aria-hidden="true">{esOscuro ? '🌙' : '☀️'}</span>
    </button>
  )
}
