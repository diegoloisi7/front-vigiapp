import { useState } from 'react'
import { api } from '../../api'
import { useAuth } from '../../context/AuthContext'
import { useGrupos } from '../../context/GruposContext'
import { useConsulta } from '../../hooks/useConsulta'
import AvisoCard from '../../components/AvisoCard'
import AvisoFormModal from '../../components/AvisoFormModal'
import CerrarAvisoModal from '../../components/CerrarAvisoModal'
import EmptyState from '../../components/EmptyState'
import EstadoConsulta from '../../components/EstadoConsulta'
import IncidentCard from '../../components/IncidentCard'
import ListaIncidentesGestionables from '../../components/ListaIncidentesGestionables'
import SegmentedControl from '../../components/SegmentedControl'
import Tabs from '../../components/Tabs'
import { esAbierto, puedeGestionar } from '../../utils/permisos'
import type { Aviso, Incidencia } from '../../types'

type Alcance = 'grupo' | 'mios'

const porFechaIncidente = (a: Incidencia, b: Incidencia) => new Date(b.creada).getTime() - new Date(a.creada).getTime()
const porFechaAviso = (a: Aviso, b: Aviso) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()

// Alertas y avisos, del grupo activo o propios.
// Una alerta es un reporte urgente; los avisos son las novedades de la comunidad.
export default function Alertas() {
  const { usuario } = useAuth()
  const { grupos, grupoActivo } = useGrupos()
  const grupoId = grupoActivo?.id

  const [pestana, setPestana] = useState('alertas')
  const [alcance, setAlcance] = useState<Alcance>('grupo')
  const [creando, setCreando] = useState(false)
  const [editando, setEditando] = useState<Aviso | null>(null)
  const [cerrando, setCerrando] = useState<Aviso | null>(null)

  const consultaIncidentes = useConsulta(
    () => (alcance === 'grupo' ? api.incidencias.listar(grupoId) : api.incidencias.listarMias()),
    [alcance, grupoId],
  )
  const consultaAvisos = useConsulta(
    () => (alcance === 'grupo' ? api.avisos.listar(grupoId) : api.avisos.listarMios()),
    [alcance, grupoId],
  )

  const alertas = (consultaIncidentes.datos ?? []).filter((i) => i.tipo === 'URGENTE')
  const alertasActivas = alertas.filter(esAbierto).sort(porFechaIncidente)
  const alertasCerradas = alertas.filter((i) => !esAbierto(i)).sort(porFechaIncidente)

  const avisos = consultaAvisos.datos ?? []
  const avisosVigentes = avisos
    .filter((a) => a.estado === 'VIGENTE')
    .sort((a, b) => Number(b.prioridad === 'IMPORTANTE') - Number(a.prioridad === 'IMPORTANTE') || porFechaAviso(a, b))
  const avisosCerrados = avisos.filter((a) => a.estado !== 'VIGENTE').sort(porFechaAviso)

  // Botones del aviso: solo para el creador y el owner del grupo, y solo si sigue vigente
  const renderAviso = (a: Aviso) => (
    <AvisoCard
      key={a.id}
      aviso={a}
      acciones={
        a.estado === 'VIGENTE' && puedeGestionar(a, usuario, grupos) ? (
          <>
            <button type="button" className="btn btn-outline" onClick={() => setEditando(a)}>Editar</button>
            <button type="button" className="btn btn-ghost" onClick={() => setCerrando(a)}>Cerrar aviso</button>
          </>
        ) : undefined
      }
    />
  )

  return (
    <>
      <Tabs
        etiqueta="Alertas y avisos"
        activa={pestana}
        onCambiar={setPestana}
        pestanas={[
          { id: 'alertas', texto: `Alertas (${alertasActivas.length})` },
          { id: 'avisos', texto: `Avisos (${avisosVigentes.length})` },
        ]}
      />

      <div role="tabpanel" id={`panel-${pestana}`} aria-labelledby={`tab-${pestana}`} tabIndex={0} className="panel">
        <SegmentedControl<Alcance>
          etiqueta="Qué mostrar"
          valor={alcance}
          onCambiar={setAlcance}
          opciones={[{ valor: 'grupo', texto: 'Del grupo' }, { valor: 'mios', texto: 'Mías' }]}
        />

        {pestana === 'alertas' ? (
          <EstadoConsulta cargando={consultaIncidentes.cargando} error={consultaIncidentes.error} onReintentar={consultaIncidentes.recargar}>
            {alcance === 'grupo' ? (
              <>
                {alertasActivas.length === 0 ? (
                  <EmptyState icono="🌤️" titulo="Todo tranquilo por ahora" texto="No hay alertas activas en tu grupo." />
                ) : (
                  <div className="stack-list">{alertasActivas.map((i) => <IncidentCard key={i.id} incidencia={i} mostrarDistancia />)}</div>
                )}
                {alertasCerradas.length > 0 && (
                  <>
                    <h2 className="subtitulo">Cerradas recientemente</h2>
                    <div className="stack-list">{alertasCerradas.map((i) => <IncidentCard key={i.id} incidencia={i} />)}</div>
                  </>
                )}
              </>
            ) : (
              <ListaIncidentesGestionables
                incidentes={alertas}
                onCambio={consultaIncidentes.recargar}
                vacio={<EmptyState icono="🆘" titulo="No tenés alertas" texto="Tus reportes urgentes aparecen acá para que los completes o los cierres." />}
              />
            )}
          </EstadoConsulta>
        ) : (
          <>
            {grupoActivo && (
              <div className="bloque__head">
                <h2 className="subtitulo-chico">{alcance === 'grupo' ? `Avisos de ${grupoActivo.nombre}` : 'Mis avisos'}</h2>
                <button type="button" className="btn btn-primary" onClick={() => setCreando(true)}>Crear aviso</button>
              </div>
            )}
            <EstadoConsulta cargando={consultaAvisos.cargando} error={consultaAvisos.error} onReintentar={consultaAvisos.recargar}>
              {avisosVigentes.length === 0 && avisosCerrados.length === 0 ? (
                <EmptyState icono="📢" titulo="No hay avisos" texto={alcance === 'grupo' ? 'Tu grupo todavía no publicó avisos.' : 'Todavía no publicaste ningún aviso.'} />
              ) : (
                <>
                  {avisosVigentes.length > 0 && <div className="stack-list">{avisosVigentes.map(renderAviso)}</div>}
                  {avisosCerrados.length > 0 && (
                    <>
                      <h2 className="subtitulo">Cerrados o vencidos</h2>
                      <div className="stack-list">{avisosCerrados.map(renderAviso)}</div>
                    </>
                  )}
                </>
              )}
            </EstadoConsulta>
          </>
        )}
      </div>

      <AvisoFormModal abierto={creando || editando !== null} aviso={editando}
        onCerrar={() => { setCreando(false); setEditando(null) }} onGuardado={consultaAvisos.recargar} />
      <CerrarAvisoModal aviso={cerrando} onCerrar={() => setCerrando(null)} onGuardado={consultaAvisos.recargar} />
    </>
  )
}
