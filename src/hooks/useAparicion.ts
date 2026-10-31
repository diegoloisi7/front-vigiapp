import { useEffect, useRef } from 'react'

// Agrega "is-visible" a los elementos .reveal cuando entran en pantalla (animación de aparición).
// Si el navegador no tiene IntersectionObserver, los muestra directamente.
export function useAparicion<T extends HTMLElement>() {
  const raiz = useRef<T>(null)

  useEffect(() => {
    const elementos = raiz.current?.querySelectorAll<HTMLElement>('.reveal') ?? []
    if (!('IntersectionObserver' in window)) {
      elementos.forEach((el) => el.classList.add('is-visible'))
      return
    }
    const observador = new IntersectionObserver((entradas) => {
      for (const entrada of entradas) {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('is-visible')
          observador.unobserve(entrada.target)
        }
      }
    }, { threshold: 0.12 })
    elementos.forEach((el) => observador.observe(el))
    return () => observador.disconnect()
  }, [])

  return raiz
}
