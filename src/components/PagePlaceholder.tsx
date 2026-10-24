import { useLocation } from 'react-router-dom'

// Contenido temporal para las pantallas que todavía no se construyeron.
export default function PagePlaceholder({ titulo, bloque }: { titulo: string; bloque: number }) {
  const { pathname } = useLocation()
  return (
    <section className="placeholder">
      <h2>{titulo}</h2>
      <p>Esta pantalla se construye en el bloque {bloque}.</p>
      <code>{pathname}</code>
    </section>
  )
}
