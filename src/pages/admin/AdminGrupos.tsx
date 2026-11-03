import { useMemo, useState, type FormEvent } from 'react'
import { api } from '../../api'
import { mensajeDeError } from '../../api/cliente'
import { useConsulta } from '../../hooks/useConsulta'
import Campo from '../../components/Campo'
import ConfirmarModal from '../../components/ConfirmarModal'
import EmptyState from '../../components/EmptyState'
import EstadoConsulta from '../../components/EstadoConsulta'
import Modal from '../../components/Modal'
import TablaAdmin from '../../components/TablaAdmin'
import { normalizar, tiempoRelativo } from '../../utils/formato'
import type { GrupoAdmin } from '../../types'

// Todos los grupos vecinales de la plataforma: el admin puede editarlos y eliminarlos.
export default function AdminGrupos() {
  const { datos, cargando, error, recargar } = useConsulta(() => api.admin.grupos.listar(), [])
  const [buscar, setBuscar] = useState('')
  const [editando, setEditando] = useState<GrupoAdmin | null>(null)
  const [eliminando, setEliminando] = useState<GrupoAdmin | null>(null)

  const filas = useMemo(() => {
    const q = normalizar(buscar.trim())
    return (datos ?? []).filter((g) => normalizar(`${g.nombre} ${g.zona} ${g.ownerNombre}`).includes(q))
  }, [datos, buscar])

  return (
    <>
      <div className="campo admin-buscador">
        <label htmlFor="buscar-grupos">Buscar grupo</label>
        <input id="buscar-grupos" className="input" type="search" placeholder="Nombre, zona u owner" value={buscar} onChange={(e) => setBuscar(e.target.value)} />
      </div>

      <EstadoConsulta cargando={cargando} error={error} onReintentar={recargar}>
        <p className="detalle__meta" role="status">{filas.length} {filas.length === 1 ? 'grupo' : 'grupos'}</p>
        <TablaAdmin<GrupoAdmin>
          etiqueta="Grupos vecinales"
          filas={filas}
          clave={(g) => g.id}
          vacio={<EmptyState icono="🏘️" titulo="No hay grupos" texto="Probá con otra búsqueda." />}
          columnas={[
            { clave: 'grupo', titulo: 'Grupo', render: (g) => <><strong>{g.nombre}</strong><small>{g.zona}</small></> },
            { clave: 'owner', titulo: 'Owner', render: (g) => g.ownerNombre },
            { clave: 'vecinos', titulo: 'Vecinos', render: (g) => g.cantidadVecinos },
            { clave: 'incidentes', titulo: 'Incidentes', render: (g) => g.cantidadIncidentes },
            { clave: 'avisos', titulo: 'Avisos', render: (g) => g.cantidadAvisos },
            { clave: 'creado', titulo: 'Creado', render: (g) => tiempoRelativo(g.creado) },
          ]}
          acciones={(g) => (
            <>
              <button type="button" className="btn btn-outline" onClick={() => setEditando(g)}>Editar</button>
              <button type="button" className="btn btn-ghost" onClick={() => setEliminando(g)}>Eliminar</button>
            </>
          )}
        />
      </EstadoConsulta>

      <Modal abierto={editando !== null} onCerrar={() => setEditando(null)} titulo="Editar grupo">
        {editando && <FormGrupo grupo={editando} onCerrar={() => setEditando(null)} onGuardado={recargar} />}
      </Modal>

      <ConfirmarModal abierto={eliminando !== null} titulo="Eliminar grupo" textoBoton="Eliminar grupo"
        onCerrar={() => setEliminando(null)}
        onConfirmar={async () => { await api.admin.grupos.eliminar(eliminando!.id); recargar() }}>
        {eliminando && (
          <p>
            Vas a eliminar «<strong>{eliminando.nombre}</strong>». También se borran sus {eliminando.cantidadIncidentes} incidentes y
            {' '}{eliminando.cantidadAvisos} avisos, y sus {eliminando.cantidadVecinos} vecinos se quedan sin este grupo. No se puede deshacer.
          </p>
        )}
      </ConfirmarModal>
    </>
  )
}

function FormGrupo({ grupo, onCerrar, onGuardado }: { grupo: GrupoAdmin; onCerrar: () => void; onGuardado: () => void }) {
  const [nombre, setNombre] = useState(grupo.nombre)
  const [zona, setZona] = useState(grupo.zona)
  const [errores, setErrores] = useState<{ nombre?: string; zona?: string }>({})
  const [enviando, setEnviando] = useState(false)
  const [errorEnvio, setErrorEnvio] = useState('')

  async function guardar(e: FormEvent) {
    e.preventDefault()
    const nuevos: { nombre?: string; zona?: string } = {}
    if (nombre.trim().length < 3) nuevos.nombre = 'Escribí un nombre de al menos 3 caracteres.'
    if (!zona.trim()) nuevos.zona = 'Indicá el barrio o la zona.'
    setErrores(nuevos)
    const primero = Object.keys(nuevos)[0]
    if (primero) return document.getElementById(`admin-grupo-${primero}`)?.focus()
    setEnviando(true)
    setErrorEnvio('')
    try {
      await api.admin.grupos.actualizar(grupo.id, { nombre, zona })
      onGuardado()
      onCerrar()
    } catch (err) {
      setErrorEnvio(mensajeDeError(err))
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={guardar} noValidate>
      <Campo id="admin-grupo-nombre" etiqueta="Nombre del grupo" error={errores.nombre}>
        <input id="admin-grupo-nombre" className="input" type="text" maxLength={60} value={nombre}
          aria-invalid={!!errores.nombre} aria-describedby={errores.nombre ? 'admin-grupo-nombre-error' : undefined}
          onChange={(e) => setNombre(e.target.value)} />
      </Campo>
      <Campo id="admin-grupo-zona" etiqueta="Barrio o zona" error={errores.zona}>
        <input id="admin-grupo-zona" className="input" type="text" maxLength={80} value={zona}
          aria-invalid={!!errores.zona} aria-describedby={errores.zona ? 'admin-grupo-zona-error' : undefined}
          onChange={(e) => setZona(e.target.value)} />
      </Campo>
      {errorEnvio && <p className="campo__error" role="alert">{errorEnvio}</p>}
      <button type="submit" className="btn btn-primary btn-ancho" disabled={enviando}>{enviando ? 'Guardando…' : 'Guardar cambios'}</button>
    </form>
  )
}
