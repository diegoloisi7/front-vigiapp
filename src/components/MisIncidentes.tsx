import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'
import { useGrupos } from '../context/GruposContext'
import { useConsulta } from '../hooks/useConsulta'
import { esAbierto, esUrgenteActivo, estaIncompleto, puedeGestionar } from '../utils/permisos'
import type { Incidencia } from '../types'
import EditarIncidenteModal from './EditarIncidenteModal'
import EmptyState from './EmptyState'
import EstadoConsulta from './EstadoConsulta'
import EstadoIncidenteModal from './EstadoIncidenteModal'
import IncidentCard from './IncidentCard'
import SegmentedControl from './SegmentedControl'

type Alcance = 'mios' | 'grupo'

// Pestaña "Mis incidentes": los que reporté yo y, si soy owner del grupo activo, también los del grupo.
// Desde acá se actualiza el estado o se cierra cada uno.
export default function MisIncidentes() {
  const { usuario } = useAuth()
  const { grupos, grupoActivo } = useGrupos()
  const esOwner = grupoActivo?.miRol === 'OWNER'
  const grupoId = grupoActivo?.id

  const [alcance, setAlcance] = useState<Alcance>('mios')
  const alcanceReal: Alcance = esOwner ? alcance : 'mios'
  const { datos, cargando, error, recargar } = useConsulta(
    () => (alcanceReal === 'mios' ? api.incidencias.listarMias() : api.incidencias.listar(grupoId)),
    [alcanceReal, grupoId],
  )
  const [editando, setEditando] = useState<Incidencia | null>(null)
  const [actualizando, setActualizando] = useState<Incidencia | null>(null)

  // Solo los que puedo gestionar; los abiertos primero (urgentes arriba) y los cerrados después
  const { abiertos, cerrados } = useMemo(() => {
    const lista = (datos ?? []).filter((i) => puedeGestionar(i, usuario, grupos))
    const porFecha = (a: Incidencia, b: Incidencia) => new Date(b.creada).getTime() - new Date(a.creada).getTime()
    return {
      abiertos: lista.filter(esAbierto).sort((a, b) => Number(esUrgenteActivo(b)) - Number(esUrgenteActivo(a)) || porFecha(a, b)),
      cerrados: lista.filter((i) => !esAbierto(i)).sort(porFecha),
    }
  }, [datos, usuario, grupos])

  return (
    <>
      {esOwner && (
        <SegmentedControl<Alcance>
          etiqueta="Qué incidentes ver"
          valor={alcanceReal}
          onCambiar={setAlcance}
          opciones={[{ valor: 'mios', texto: 'Reportados por mí' }, { valor: 'grupo', texto: 'De mi grupo' }]}
        />
      )}

      <EstadoConsulta cargando={cargando} error={error} onReintentar={recargar}>
        {abiertos.length === 0 && cerrados.length === 0 ? (
          <EmptyState icono="📝" titulo="No hay incidentes para gestionar"
            texto={alcanceReal === 'mios' ? 'Cuando reportes un incidente lo vas a ver acá para actualizarlo o cerrarlo.' : 'Tu grupo todavía no tiene incidentes.'}>
            <Link to="/app/reportar" className="btn btn-primary">Reportar incidente</Link>
          </EmptyState>
        ) : (
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
          </>
        )}
      </EstadoConsulta>

      <EstadoIncidenteModal incidencia={actualizando} onCerrar={() => setActualizando(null)} onGuardado={recargar} />
      <EditarIncidenteModal incidencia={editando} onCerrar={() => setEditando(null)} onGuardado={recargar} />
    </>
  )
}
