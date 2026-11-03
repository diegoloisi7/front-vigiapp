import FilaIncidente from './vecino/FilaIncidente'
import type { Incidencia } from '../types'

interface Props {
  incidencia: Incidencia
  mostrarDistancia?: boolean
}

// Incidente en una lista: misma fila del tablero que el Inicio (toda la fila lleva al detalle).
export default function IncidentCard({ incidencia, mostrarDistancia = false }: Props) {
  return <FilaIncidente incidencia={incidencia} como="div" mostrarDistancia={mostrarDistancia} />
}
