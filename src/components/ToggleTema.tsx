import { useTema } from '../context/TemaContext'
import Icono from './vecino/Icono'
import { useModoVecino } from './vecino/modoVecino'

// Interruptor de modo noche: un toque oscurece la app y otro toque la vuelve a dejar como estaba.
export default function ToggleTema({ className = '' }: { className?: string }) {
  const { esOscuro, alternar } = useTema()
  const vecino = useModoVecino() // en la vista del vecino: íconos SVG en lugar de emojis
  const sol = vecino ? <Icono nombre="sol" tamano={14} /> : '☀️'
  const luna = vecino ? <Icono nombre="luna" tamano={14} /> : '🌙'
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
      <span className="tema-toggle__fondo" aria-hidden="true"><span>{sol}</span><span>{luna}</span></span>
      <span className="tema-toggle__perilla" aria-hidden="true">{esOscuro ? luna : sol}</span>
    </button>
  )
}
