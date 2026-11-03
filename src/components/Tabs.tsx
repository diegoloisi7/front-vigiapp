import type { KeyboardEvent } from 'react'

// Pestañas accesibles (flechas izquierda/derecha para moverse). El panel lo dibuja la pantalla
// con role="tabpanel", id={`panel-${id}`} y aria-labelledby={`tab-${id}`}.
interface Pestana {
  id: string
  texto: string
}

interface Props {
  etiqueta: string
  pestanas: Pestana[]
  activa: string
  onCambiar: (id: string) => void
}

export default function Tabs({ etiqueta, pestanas, activa, onCambiar }: Props) {
  function alTeclear(e: KeyboardEvent<HTMLButtonElement>, indice: number) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    const siguiente = (indice + (e.key === 'ArrowRight' ? 1 : -1) + pestanas.length) % pestanas.length
    onCambiar(pestanas[siguiente].id)
    document.getElementById(`tab-${pestanas[siguiente].id}`)?.focus()
  }

  return (
    <div className="tabs" role="tablist" aria-label={etiqueta}>
      {pestanas.map((p, i) => (
        <button
          key={p.id}
          id={`tab-${p.id}`}
          type="button"
          role="tab"
          className={`tabs__tab ${p.id === activa ? 'is-active' : ''}`}
          aria-selected={p.id === activa}
          aria-controls={`panel-${p.id}`}
          tabIndex={p.id === activa ? 0 : -1}
          onClick={() => onCambiar(p.id)}
          onKeyDown={(e) => alTeclear(e, i)}
        >
          {p.texto}
        </button>
      ))}
    </div>
  )
}
