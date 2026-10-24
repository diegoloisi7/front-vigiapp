import { useMemo, useState, type ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'
import { useGrupos } from '../context/GruposContext'
import { esAbierto, esUrgenteActivo, estaIncompleto, puedeGestionar } from '../utils/permisos'
import type { Incidencia } from '../types'
import EditarIncidenteModal from './EditarIncidenteModal'
import EstadoIncidenteModal from './EstadoIncidenteModal'
import IncidentCard from './IncidentCard'

interface Props {
  incidentes: Incidencia[]
  onCambio: () => void // para recargar la lista después de actualizar o cerrar
  vacio: ReactNode // lo que se muestra si no hay nada para gestionar
}

// Lista de incidentes que el usuario puede gestionar (creador u owner del grupo):
// activos arriba (urgentes primero) con sus botones, y cerrados abajo.
export default function ListaIncidentesGestionables({ incidentes, onCambio, vacio }: Props) {
  const { usuario } = useAuth()
  const { grupos } = useGrupos()
  const [editando, setEditando] = useState<Incidencia | null>(null)
  const [actualizando, setActualizando] = useState<Incidencia | null>(null)

  const { abiertos, cerrados } = useMemo(() => {
    const lista = incidentes.filter((i) => puedeGestionar(i, usuario, grupos))
    const porFecha = (a: Incidencia, b: Incidencia) => new Date(b.creada).getTime() - new Date(a.creada).getTime()
    return {
      abiertos: lista.filter(esAbierto).sort((a, b) => Number(esUrgenteActivo(b)) - Number(esUrgenteActivo(a)) || porFecha(a, b)),
      cerrados: lista.filter((i) => !esAbierto(i)).sort(porFecha),
    }
  }, [incidentes, usuario, grupos])

  if (abiertos.length === 0 && cerrados.length === 0) return <>{vacio}</>

  return (
    <>
      <section className="bloque" aria-labelledby="t-activos">
        <div className="bloque__head"><h2 id="t-activos">Activos ({abiertos.length})</h2></div>
        {abiertos.length === 0 ? (
          <p className="detalle__meta">No tenés incidentes activos.</p>
        ) : (
          <div className="stack-list">
            {abiertos.map((i) => (
              <div key={i.id} className="incidente-item">
                <IncidentCard incidencia={i} />
                {estaIncompleto(i) && <p className="incidente-item__aviso">Falta completar los datos de este reporte urgente.</p>}
                <div className="incidente-item__acciones">
                  <button type="button" className="btn btn-primary" onClick={() => setActualizando(i)}>Actualizar estado</button>
                  <button type="button" className="btn btn-outline" onClick={() => setEditando(i)}>
                    {estaIncompleto(i) ? 'Completar datos' : 'Editar datos'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {cerrados.length > 0 && (
        <section className="bloque" aria-labelledby="t-cerrados">
          <div className="bloque__head"><h2 id="t-cerrados">Cerrados ({cerrados.length})</h2></div>
          <div className="stack-list">{cerrados.map((i) => <IncidentCard key={i.id} incidencia={i} />)}</div>
        </section>
      )}

      <EstadoIncidenteModal incidencia={actualizando} onCerrar={() => setActualizando(null)} onGuardado={onCambio} />
      <EditarIncidenteModal incidencia={editando} onCerrar={() => setEditando(null)} onGuardado={onCambio} />
    </>
  )
}
