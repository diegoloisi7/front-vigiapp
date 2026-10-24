import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useGrupos } from '../context/GruposContext'
import { useConsulta } from '../hooks/useConsulta'
import EmptyState from './EmptyState'
import EstadoConsulta from './EstadoConsulta'
import ListaIncidentesGestionables from './ListaIncidentesGestionables'
import SegmentedControl from './SegmentedControl'

type Alcance = 'mios' | 'grupo'

// Pestaña "Mis incidentes": los que reporté yo y, si soy owner del grupo activo, también los del grupo.
// Desde acá se actualiza el estado o se cierra cada uno.
export default function MisIncidentes() {
  const { grupoActivo } = useGrupos()
  const esOwner = grupoActivo?.miRol === 'OWNER'
  const grupoId = grupoActivo?.id

  const [alcance, setAlcance] = useState<Alcance>('mios')
  const alcanceReal: Alcance = esOwner ? alcance : 'mios'
  const { datos, cargando, error, recargar } = useConsulta(
    () => (alcanceReal === 'mios' ? api.incidencias.listarMias() : api.incidencias.listar(grupoId)),
    [alcanceReal, grupoId],
  )

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
        <ListaIncidentesGestionables
          incidentes={datos ?? []}
          onCambio={recargar}
          vacio={
            <EmptyState icono="📝" titulo="No hay incidentes para gestionar"
              texto={alcanceReal === 'mios' ? 'Cuando reportes un incidente lo vas a ver acá para actualizarlo o cerrarlo.' : 'Tu grupo todavía no tiene incidentes.'}>
              <Link to="/app/reportar" className="btn btn-primary">Reportar incidente</Link>
            </EmptyState>
          }
        />
      </EstadoConsulta>
    </>
  )
}
