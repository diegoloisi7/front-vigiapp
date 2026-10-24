import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api } from '../api'
import type { Categoria } from '../types'

interface CategoriasValor {
  categorias: Categoria[]
  categoriaPorId: (id: string) => Categoria | undefined
  recargar: () => Promise<void> // el panel de admin lo usa después de crear o editar categorías
}

const CategoriasContext = createContext<CategoriasValor | null>(null)

// Carga las categorías y las comparte con toda la app.
export function CategoriasProvider({ children }: { children: ReactNode }) {
  const [categorias, setCategorias] = useState<Categoria[]>([])

  const recargar = useCallback(async () => {
    try {
      setCategorias(await api.categorias.listar())
    } catch {
      /* sin categorías la app sigue funcionando, solo sin íconos */
    }
  }, [])

  useEffect(() => { void recargar() }, [recargar])

  const valor = useMemo<CategoriasValor>(
    () => ({ categorias, categoriaPorId: (id) => categorias.find((c) => c.id === id), recargar }),
    [categorias, recargar],
  )

  return <CategoriasContext.Provider value={valor}>{children}</CategoriasContext.Provider>
}

export function useCategorias(): CategoriasValor {
  const contexto = useContext(CategoriasContext)
  if (!contexto) throw new Error('useCategorias debe usarse dentro de <CategoriasProvider>')
  return contexto
}
