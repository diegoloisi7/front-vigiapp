import { createContext, useContext } from 'react'

// Indica que el componente se dibuja con la identidad nueva (vista del vecino y panel de administración).
// Lo usan las piezas compartidas (EmptyState, ToggleTema) para mostrar íconos SVG en lugar de emojis
// sin cambiar cómo se ven en las páginas públicas.
export const ModoVecinoContext = createContext(false)
export const useModoVecino = () => useContext(ModoVecinoContext)
