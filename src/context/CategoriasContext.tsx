import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api } from '../api'
import type { Categoria } from '../types'

interface CategoriasValor {
  categorias: Categoria[]
  categoriaPorId: (id: string) => Categoria | undefined
}

const CategoriasContext = createContext<CategoriasValor | null>(null)

// Carga las categorías una sola vez y las comparte con toda la app.
export function CategoriasProvider({ children }: { children: ReactNode }) {
  const [categorias, setCategorias] = useState<Categoria[]>([])

  useEffect(() => {
    let vigente = true
    api.categorias.listar()
      .then((lista) => { if (vigente) setCategorias(lista) })
      .catch(() => { /* sin categorías la app sigue funcionando, solo sin íconos */ })
    return () => { vigente = false }
  }, [])

  const valor = useMemo<CategoriasValor>(
    () => ({ categorias, categoriaPorId: (id) => categorias.find((c) => c.id === id) }),
    [categorias],
  )

  return <CategoriasContext.Provider value={valor}>{children}</CategoriasContext.Provider>
}

export function useCategorias(): CategoriasValor {
  const contexto = useContext(CategoriasContext)
  if (!contexto) throw new Error('useCategorias debe usarse dentro de <CategoriasProvider>')
  return contexto
}
