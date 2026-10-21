// Selector segmentado (ej. Mapa | Lista).
interface Opcion<T extends string> {
  valor: T
  texto: string
  icono?: string
}

interface Props<T extends string> {
  etiqueta: string
  opciones: Opcion<T>[]
  valor: T
  onCambiar: (valor: T) => void
}

export default function SegmentedControl<T extends string>({ etiqueta, opciones, valor, onCambiar }: Props<T>) {
  return (
    <div className="segmented" role="group" aria-label={etiqueta}>
      {opciones.map((o) => (
        <button
          key={o.valor}
          type="button"
          className={`segmented__btn ${o.valor === valor ? 'is-active' : ''}`}
          aria-pressed={o.valor === valor}
          onClick={() => onCambiar(o.valor)}
        >
          {o.icono && <span aria-hidden="true">{o.icono}</span>}
          {o.texto}
        </button>
      ))}
    </div>
  )
}
