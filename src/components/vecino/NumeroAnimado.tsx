import { useEffect, useRef, useState } from 'react'

const reducirMovimiento = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// Número que cuenta hasta su valor (600 ms, con frenado suave). Si el usuario pidió
// reducir movimiento, muestra el valor directo. Los lectores de pantalla leen solo el valor final.
export default function NumeroAnimado({ valor, duracion = 600 }: { valor: number; duracion?: number }) {
  const [reducir] = useState(reducirMovimiento)
  const [mostrado, setMostrado] = useState(0)
  const desde = useRef(0)

  useEffect(() => {
    if (reducir) return
    const inicio = performance.now()
    const origen = desde.current
    let id = 0
    const paso = (ahora: number) => {
      const t = Math.min(1, (ahora - inicio) / duracion)
      const suave = 1 - (1 - t) ** 3
      setMostrado(Math.round(origen + (valor - origen) * suave))
      if (t < 1) id = requestAnimationFrame(paso)
      else desde.current = valor
    }
    id = requestAnimationFrame(paso)
    return () => cancelAnimationFrame(id)
  }, [valor, duracion, reducir])

  if (reducir) return <>{valor}</>
  return (
    <>
      <span aria-hidden="true">{mostrado}</span>
      <span className="sr-only">{valor}</span>
    </>
  )
}
