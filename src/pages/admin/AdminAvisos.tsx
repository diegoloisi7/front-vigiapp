import { useMemo, useState } from 'react'
import { api } from '../../api'
import { useConsulta } from '../../hooks/useConsulta'
import AvisoFormModal from '../../components/AvisoFormModal'
import Badge from '../../components/Badge'
import CerrarAvisoModal from '../../components/CerrarAvisoModal'
import ConfirmarModal from '../../components/ConfirmarModal'
import EmptyState from '../../components/EmptyState'
import EstadoConsulta from '../../components/EstadoConsulta'
import TablaAdmin from '../../components/TablaAdmin'
import { fechaLarga, normalizar, tiempoRelativo } from '../../utils/formato'
import type { Aviso } from '../../types'

// Moderación: todos los avisos de todos los grupos. El admin puede editar, cerrar y eliminar.
export default function AdminAvisos() {
  const { datos, cargando, error, recargar } = useConsulta(
    () => Promise.all([api.avisos.listar(), api.admin.grupos.listar()]),
    [],
  )
  const [buscar, setBuscar] = useState('')
  const [estado, setEstado] = useState('')
  const [editando, setEditando] = useState<Aviso | null>(null)
  const [cerrando, setCerrando] = useState<Aviso | null>(null)
  const [eliminando, setEliminando] = useState<Aviso | null>(null)

  const avisos = useMemo(() => datos?.[0] ?? [], [datos])
  const nombreGrupo = useMemo(() => new Map((datos?.[1] ?? []).map((g) => [g.id, g.nombre])), [datos])

  const filas = useMemo(() => {
    const q = normalizar(buscar.trim())
    return avisos
      .filter((a) => !estado || a.estado === estado)
      .filter((a) => normalizar(`${a.titulo} ${a.autorNombre} ${nombreGrupo.get(a.grupoId ?? -1) ?? ''}`).includes(q))
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
  }, [avisos, buscar, estado, nombreGrupo])

  return (
    <>
      <div className="admin-filtros">
        <div className="campo">
          <label htmlFor="buscar-avisos">Buscar</label>
          <input id="buscar-avisos" className="input" type="search" placeholder="Título, autor o grupo" value={buscar} onChange={(e) => setBuscar(e.target.value)} />
        </div>
        <div className="campo">
          <label htmlFor="filtro-estado-aviso">Estado</label>
          <select id="filtro-estado-aviso" className="input" value={estado} onChange={(e) => setEstado(e.target.value)}>
            <option value="">Todos</option>
            <option value="VIGENTE">Vigentes</option>
            <option value="CERRADO">Cerrados</option>
            <option value="EXPIRADO">Expirados</option>
          </select>
        </div>
      </div>

      <EstadoConsulta cargando={cargando} error={error} onReintentar={recargar}>
        <p className="detalle__meta" role="status">{filas.length} {filas.length === 1 ? 'aviso' : 'avisos'}</p>
        <TablaAdmin<Aviso>
          etiqueta="Avisos de todos los grupos"
          filas={filas}
          clave={(a) => a.id}
          vacio={<EmptyState icono="📢" titulo="No hay avisos" texto="Probá con otra búsqueda o filtro." />}
          columnas={[
            { clave: 'aviso', titulo: 'Aviso', render: (a) => <><strong>{a.titulo}</strong><small>Por {a.autorNombre} · {tiempoRelativo(a.fecha)}</small></> },
            { clave: 'grupo', titulo: 'Grupo', render: (a) => nombreGrupo.get(a.grupoId ?? -1) ?? '—' },
            { clave: 'prioridad', titulo: 'Prioridad', render: (a) => <Badge tipo={a.prioridad} /> },
            { clave: 'estado', titulo: 'Estado', render: (a) => <Badge tipo={a.estado} /> },
            { clave: 'vence', titulo: 'Vence', render: (a) => (a.vence ? fechaLarga(a.vence) : 'Sin vencimiento') },
          ]}
          acciones={(a) => (
            <>
              {a.estado === 'VIGENTE' && <button type="button" className="btn btn-outline" onClick={() => setEditando(a)}>Editar</button>}
              {a.estado === 'VIGENTE' && <button type="button" className="btn btn-outline" onClick={() => setCerrando(a)}>Cerrar</button>}
              <button type="button" className="btn btn-ghost" onClick={() => setEliminando(a)}>Eliminar</button>
            </>
          )}
        />
      </EstadoConsulta>

      <AvisoFormModal abierto={editando !== null} aviso={editando} onCerrar={() => setEditando(null)} onGuardado={recargar} />
      <CerrarAvisoModal aviso={cerrando} onCerrar={() => setCerrando(null)} onGuardado={recargar} />
      <ConfirmarModal abierto={eliminando !== null} titulo="Eliminar aviso" textoBoton="Eliminar aviso"
        onCerrar={() => setEliminando(null)}
        onConfirmar={async () => { await api.admin.avisos.eliminar(eliminando!.id); recargar() }}>
        {eliminando && <p>Vas a eliminar el aviso «<strong>{eliminando.titulo}</strong>». Si solo querés que deje de mostrarse como vigente, usá «Cerrar». No se puede deshacer.</p>}
      </ConfirmarModal>
    </>
  )
}
