import type { ReactNode } from 'react'

export interface Columna<T> {
  clave: string
  titulo: string
  render: (fila: T) => ReactNode
}

interface Props<T> {
  etiqueta: string // descripción de la tabla para lectores de pantalla
  columnas: Columna<T>[]
  filas: T[]
  clave: (fila: T) => string | number
  acciones?: (fila: T) => ReactNode
  vacio?: ReactNode // se muestra si no hay filas
}

// Tabla en escritorio y tarjetas en celular (el CSS convierte cada fila usando data-label).
export default function TablaAdmin<T>({ etiqueta, columnas, filas, clave, acciones, vacio }: Props<T>) {
  if (filas.length === 0 && vacio) return <>{vacio}</>

  return (
    <div className="tabla-envoltorio">
      <table className="tabla">
        <caption className="sr-only">{etiqueta}</caption>
        <thead>
          <tr>
            {columnas.map((c) => <th key={c.clave} scope="col">{c.titulo}</th>)}
            {acciones && <th scope="col">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {filas.map((fila) => (
            <tr key={clave(fila)}>
              {columnas.map((c) => <td key={c.clave} data-label={c.titulo}>{c.render(fila)}</td>)}
              {acciones && <td className="tabla__acciones" data-label="Acciones">{acciones(fila)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
