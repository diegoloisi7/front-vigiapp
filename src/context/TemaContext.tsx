import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

// Modo noche: se elige con un botón, se recuerda en el navegador y, la primera vez, sigue la preferencia del sistema.
export type Tema = 'claro' | 'oscuro'

const CLAVE = 'vigiapp_tema'
const COLOR_BARRA: Record<Tema, string> = { claro: '#1F4E79', oscuro: '#0F1B28' } // barra del navegador en celular

interface TemaValor {
  tema: Tema
  esOscuro: boolean
  alternar: () => void
}

const TemaContext = createContext<TemaValor | null>(null)

function leerTema(): Tema {
  try {
    const guardado = localStorage.getItem(CLAVE)
    if (guardado === 'claro' || guardado === 'oscuro') return guardado
  } catch { /* sin acceso al almacenamiento: se usa la preferencia del sistema */ }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro'
}

export function TemaProvider({ children }: { children: ReactNode }) {
  const [tema, setTema] = useState<Tema>(leerTema)

  // Aplica el tema a toda la página (los colores salen de variables.css)
  useEffect(() => {
    document.documentElement.dataset.tema = tema
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', COLOR_BARRA[tema])
  }, [tema])

  const alternar = useCallback(() => {
    const raiz = document.documentElement
    raiz.classList.add('cambiando-tema') // transición suave solo durante el cambio
    window.setTimeout(() => raiz.classList.remove('cambiando-tema'), 450)
    setTema((actual) => {
      const nuevo: Tema = actual === 'oscuro' ? 'claro' : 'oscuro'
      try { localStorage.setItem(CLAVE, nuevo) } catch { /* no se pudo recordar la elección */ }
      return nuevo
    })
  }, [])

  const valor = useMemo(() => ({ tema, esOscuro: tema === 'oscuro', alternar }), [tema, alternar])
  return <TemaContext.Provider value={valor}>{children}</TemaContext.Provider>
}

export function useTema(): TemaValor {
  const contexto = useContext(TemaContext)
  if (!contexto) throw new Error('useTema debe usarse dentro de <TemaProvider>')
  return contexto
}
