import type { ElementType, HTMLAttributes } from 'react'

// Tarjeta con borde suave y sombra sutil. "as" permite cambiar la etiqueta (article, section...).
interface Props extends HTMLAttributes<HTMLElement> {
  as?: ElementType
}

export default function Card({ as: Etiqueta = 'div', className = '', children, ...resto }: Props) {
  return <Etiqueta className={`card ${className}`} {...resto}>{children}</Etiqueta>
}
