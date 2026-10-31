import { useMemo, useState } from 'react'
import { api } from '../../api'
import { useConsulta } from '../../hooks/useConsulta'
import Badge from '../../components/Badge'
import ConfirmarModal from '../../components/ConfirmarModal'
import EditarIncidenteModal from '../../components/EditarIncidenteModal'
import EmptyState from '../../components/EmptyState'
import EstadoConsulta from '../../components/EstadoConsulta'
import EstadoIncidenteModal from '../../components/EstadoIncidenteModal'
import TablaAdmin from '../../components/TablaAdmin'
import { ESTADOS } from '../../data/mock'
import { normalizar, tiempoRelativo } from '../../utils/formato'
import { esAbierto, esUrgenteActivo } from '../../utils/permisos'
import type { Incidencia } from '../../types'

// Moderación: todos los incidentes de todos los grupos. El admin puede cambiar el estado, editar y eliminar.
export default function AdminIncidencias() {
  const { datos, cargando, error, recargar } = useConsulta(
    () => Promise.all([api.incidencias.listar(), api.admin.grupos.listar()]),
    [],
  )
  const [buscar, setBuscar] = useState('')
  const [estado, setEstado] = useState('')
  const [tipo, setTipo] = useState('')
  const [cambiando, setCambiando] = useState<Incidencia | null>(null)
  const [editando, setEditando] = useState<Incidencia | null>(null)
  const [eliminando, setEliminando] = useState<Incidencia | null>(null)

  const incidencias = useMemo(() => datos?.[0] ?? [], [datos])
  const nombreGrupo = useMemo(() => new Map((datos?.[1] ?? []).map((g) => [g.id, g.nombre])), [datos])

  const filas = useMemo(() => {
    const q = normalizar(buscar.trim())
    return incidencias
      .filter((i) => (estado === 'ACTIVOS' ? esAbierto(i) : !estado || i.estado === estado))
      .filter((i) => !tipo || i.tipo === tipo)
      .filter((i) => normalizar(`${i.titulo} ${i.ubicacion} ${nombreGrupo.get(i.grupoId ?? -1) ?? ''}`).includes(q))
      .sort((a, b) => new Date(b.creada).getTime() - new Date(a.creada).getTime())
  }, [incidencias, buscar, estado, tipo, nombreGrupo])

  return (
    <>
      <div className="admin-filtros">
        <div className="campo">
          <label htmlFor="buscar-incidentes">Buscar</label>
          <input id="buscar-incidentes" className="input" type="search" placeholder="Título, lugar o grupo" value={buscar} onChange={(e) => setBuscar(e.target.value)} />
        </div>
        <div className="campo">
          <label htmlFor="filtro-estado">Estado</label>
          <select id="filtro-estado" className="input" value={estado} onChange={(e) => setEstado(e.target.value)}>
            <option value="">Todos</option>
            <option value="ACTIVOS">Activos</option>
            {Object.entries(ESTADOS).map(([v, t]) => <option key={v} value={v}>{t}</option>)}
          </select>
        </div>
        <div className="campo">
          <label htmlFor="filtro-tipo">Tipo</label>
          <select id="filtro-tipo" className="input" value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="">Todos</option>
            <option value="URGENTE">Urgentes</option>
            <option value="NORMAL">Normales</option>
          </select>
        </div>
      </div>

      <EstadoConsulta cargando={cargando} error={error} onReintentar={recargar}>
        <p className="detalle__meta" role="status">{filas.length} {filas.length === 1 ? 'incidente' : 'incidentes'}</p>
        <TablaAdmin<Incidencia>
          etiqueta="Incidentes de todos los grupos"
          filas={filas}
          clave={(i) => i.id}
          vacio={<EmptyState icono="📋" titulo="No hay incidentes" texto="Probá con otra búsqueda o filtro." />}
          columnas={[
            { clave: 'incidente', titulo: 'Incidente', render: (i) => <><strong>{i.titulo}</strong><small>{i.ubicacion}</small></> },
            { clave: 'grupo', titulo: 'Grupo', render: (i) => nombreGrupo.get(i.grupoId ?? -1) ?? '—' },
            { clave: 'estado', titulo: 'Estado', render: (i) => <span className="tabla__badges">{esUrgenteActivo(i) && <Badge tipo="URGENTE" />}<Badge tipo={i.estado} /></span> },
            { clave: 'creado', titulo: 'Creado', render: (i) => tiempoRelativo(i.creada) },
            { clave: 'vecinos', titulo: 'Vieron', render: (i) => i.vecinos },
          ]}
          acciones={(i) => (
            <>
              {esAbierto(i) && <button type="button" className="btn btn-outline" onClick={() => setCambiando(i)}>Estado</button>}
              {esAbierto(i) && <button type="button" className="btn btn-outline" onClick={() => setEditando(i)}>Editar</button>}
              <button type="button" className="btn btn-ghost" onClick={() => setEliminando(i)}>Eliminar</button>
            </>
          )}
        />
      </EstadoConsulta>

      <EstadoIncidenteModal incidencia={cambiando} onCerrar={() => setCambiando(null)} onGuardado={recargar} />
      <EditarIncidenteModal incidencia={editando} onCerrar={() => setEditando(null)} onGuardado={recargar} />
      <ConfirmarModal abierto={eliminando !== null} titulo="Eliminar incidente" textoBoton="Eliminar incidente"
        onCerrar={() => setEliminando(null)}
        onConfirmar={async () => { await api.admin.incidentes.eliminar(eliminando!.id); recargar() }}>
        {eliminando && <p>Vas a eliminar «<strong>{eliminando.titulo}</strong>» y todo su historial. Si solo querés cerrarlo, usá «Estado». No se puede deshacer.</p>}
      </ConfirmarModal>
    </>
  )
}
