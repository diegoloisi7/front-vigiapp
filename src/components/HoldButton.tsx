import { useEffect, useRef, useState } from 'react'

const RADIO = 84
const CIRCUNFERENCIA = 2 * Math.PI * RADIO

// Botón de "mantener presionado" con anillo de progreso. Si se suelta antes de tiempo, se cancela.
// Funciona con mouse, dedo y teclado (Espacio o Enter).
interface Props {
  duracion?: number // en milisegundos
  deshabilitado?: boolean
  onCompletado?: () => void
}

export default function HoldButton({ duracion = 3000, deshabilitado = false, onCompletado }: Props) {
  const [progreso, setProgreso] = useState(0) // de 0 a 1
  const inicio = useRef<number | null>(null)
  const cuadro = useRef(0)

  function cancelar() {
    cancelAnimationFrame(cuadro.current)
    inicio.current = null
    setProgreso(0)
  }

  function empezar() {
    if (deshabilitado || inicio.current !== null) return
    inicio.current = performance.now()
    const paso = (ahora: number) => {
      if (inicio.current === null) return
      const p = Math.min(Math.max((ahora - inicio.current) / duracion, 0), 1)
      setProgreso(p)
      if (p >= 1) {
        inicio.current = null
        navigator.vibrate?.(200) // vibración corta en celulares que la soportan
        onCompletado?.()
        return
      }
      cuadro.current = requestAnimationFrame(paso)
    }
    cuadro.current = requestAnimationFrame(paso)
  }

  // Si se deshabilita mientras se mantiene, se cancela
  useEffect(() => { if (deshabilitado) cancelar() }, [deshabilitado])
  // Al desmontar, frena la animación
  useEffect(() => () => cancelAnimationFrame(cuadro.current), [])

  const segundos = Math.ceil((1 - progreso) * (duracion / 1000))

  return (
    <div className="hold">
      <svg className="hold__ring" viewBox="0 0 176 176" aria-hidden="true">
        <circle className="hold__track" cx="88" cy="88" r={RADIO} />
        <circle
          className="hold__progress" cx="88" cy="88" r={RADIO}
          strokeDasharray={CIRCUNFERENCIA} strokeDashoffset={CIRCUNFERENCIA * (1 - progreso)}
        />
      </svg>
      <button
        type="button"
        className="hold__btn"
        disabled={deshabilitado}
        aria-label={`Mantener presionado ${duracion / 1000} segundos para enviar la alerta`}
        onPointerDown={empezar}
        onPointerUp={cancelar}
        onPointerLeave={cancelar}
        onPointerCancel={cancelar}
        onContextMenu={(e) => e.preventDefault()}
        onKeyDown={(e) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); empezar() } }}
        onKeyUp={(e) => { if (e.key === ' ' || e.key === 'Enter') cancelar() }}
      >
        {progreso > 0 ? `Seguí presionando… ${segundos} s` : `Mantener presionado ${duracion / 1000} s`}
      </button>
    </div>
  )
}
