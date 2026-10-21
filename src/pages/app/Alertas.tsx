import { useState } from 'react'
import { api } from '../../api'
import { useGrupos } from '../../context/GruposContext'
import { useConsulta } from '../../hooks/useConsulta'
import Tabs from '../../components/Tabs'
import AlertaCard from '../../components/AlertaCard'
import AvisoCard from '../../components/AvisoCard'
import EmptyState from '../../components/EmptyState'
import EstadoConsulta from '../../components/EstadoConsulta'
import type { Alerta, Aviso } from '../../types'

export default function Alertas() {
  const [pestana, setPestana] = useState('alertas')
  const { grupoActivo } = useGrupos()
  const grupoId = grupoActivo?.id
  const { datos, cargando, error, recargar } = useConsulta(
    () => Promise.all([api.alertas.listar(grupoId), api.avisos.listar(grupoId)]),
    [grupoId],
  )
  const [todasAlertas, todosAvisos] = datos ?? ([[], []] as [Alerta[], Aviso[]])

  // Activas primero (emergencias arriba); las cerradas quedan como historial reciente
  const activas = todasAlertas
    .filter((a) => a.estado === 'ACTIVA')
    .sort((a, b) => Number(b.nivel === 'EMERGENCIA') - Number(a.nivel === 'EMERGENCIA'))
  const cerradas = todasAlertas.filter((a) => a.estado === 'CERRADA')
  // Avisos importantes primero
  const avisos = [...todosAvisos].sort(
    (a, b) => Number(b.prioridad === 'IMPORTANTE') - Number(a.prioridad === 'IMPORTANTE'),
  )

  return (
    <>
      <Tabs
        etiqueta="Alertas y avisos"
        activa={pestana}
        onCambiar={setPestana}
        pestanas={[
          { id: 'alertas', texto: `Alertas (${activas.length})` },
          { id: 'avisos', texto: `Avisos (${avisos.length})` },
        ]}
      />

      <div role="tabpanel" id={`panel-${pestana}`} aria-labelledby={`tab-${pestana}`} tabIndex={0} className="panel">
        <EstadoConsulta cargando={cargando} error={error} onReintentar={recargar}>
          {pestana === 'alertas' ? (
            <>
              {activas.length === 0 ? (
                <EmptyState icono="🌤️" titulo="Todo tranquilo por ahora" texto="No hay alertas activas en tu comunidad." />
              ) : (
                <div className="stack-list">{activas.map((a) => <AlertaCard key={a.id} alerta={a} />)}</div>
              )}
              {cerradas.length > 0 && (
                <>
                  <h2 className="subtitulo">Cerradas recientemente</h2>
                  <div className="stack-list">{cerradas.map((a) => <AlertaCard key={a.id} alerta={a} />)}</div>
                </>
              )}
            </>
          ) : (
            <div className="stack-list">{avisos.map((a) => <AvisoCard key={a.id} aviso={a} />)}</div>
          )}
        </EstadoConsulta>
      </div>
    </>
  )
}
