import { useEffect, useRef, useState } from 'react'

const reducirMovimiento = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Número que "cuenta" desde 0 hasta su valor la primera vez que aparece en pantalla.
export default function Contador({ hasta, duracion = 1300 }: { hasta: number; duracion?: number }) {
  const el = useRef<HTMLSpanElement>(null)
  const [valor, setValor] = useState(() => (reducirMovimiento() ? hasta : 0))

  useEffect(() => {
    const nodo = el.current
    if (!nodo || reducirMovimiento() || !('IntersectionObserver' in window)) {
      return
    }
    let cuadro = 0
    const observador = new IntersectionObserver(([entrada]) => {
      if (!entrada.isIntersecting) return
      observador.disconnect()
      const inicio = performance.now()
      const paso = (ahora: number) => {
        const t = Math.min(1, (ahora - inicio) / duracion)
        setValor(Math.round(hasta * (1 - Math.pow(1 - t, 3)))) // frena suave al final
        if (t < 1) cuadro = requestAnimationFrame(paso)
      }
      cuadro = requestAnimationFrame(paso)
    }, { threshold: 0.6 })
    observador.observe(nodo)
    return () => { observador.disconnect(); cancelAnimationFrame(cuadro) }
  }, [hasta, duracion])

  // Si no hay animación posible, se muestra el valor final
  const sinAnimacion = typeof window !== 'undefined' && !('IntersectionObserver' in window)
  // Los lectores de pantalla leen solo el valor final, no los números intermedios
  return (
    <>
      <span ref={el} aria-hidden="true">{sinAnimacion ? hasta : valor}</span>
      <span className="sr-only">{hasta}</span>
    </>
  )
}
