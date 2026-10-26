import { useState, type FormEvent } from 'react'
import { api } from '../../api'
import { mensajeDeError } from '../../api/cliente'
import { useCategorias } from '../../context/CategoriasContext'
import Badge from '../../components/Badge'
import Campo from '../../components/Campo'
import EmptyState from '../../components/EmptyState'
import IconoCategoria from '../../components/IconoCategoria'
import Modal from '../../components/Modal'
import TablaAdmin from '../../components/TablaAdmin'
import type { Categoria } from '../../types'

// Categorías de incidentes: alta, edición y activar o desactivar (no se borran, para no perder el historial).
export default function AdminCategorias() {
  const { categorias, recargar } = useCategorias()
  const [formulario, setFormulario] = useState<{ categoria: Categoria | null } | null>(null) // null = cerrado; categoria null = alta
  const [error, setError] = useState('')
  const [cambiando, setCambiando] = useState<string | null>(null)

  async function alternar(c: Categoria) {
    setCambiando(c.id)
    setError('')
    try {
      await api.admin.categorias.actualizar(c.id, { activa: !c.activa })
      await recargar()
    } catch (e) {
      setError(mensajeDeError(e))
    } finally {
      setCambiando(null)
    }
  }

  return (
    <>
      <div className="bloque__head">
        <p className="detalle__meta" role="status">{categorias.length} categorías · {categorias.filter((c) => c.activa).length} activas</p>
        <button type="button" className="btn btn-primary" onClick={() => setFormulario({ categoria: null })}>Nueva categoría</button>
      </div>
      {error && <p className="campo__error" role="alert">{error}</p>}

      <TablaAdmin<Categoria>
        etiqueta="Categorías de incidentes"
        filas={categorias}
        clave={(c) => c.id}
        vacio={<EmptyState icono="🏷️" titulo="No hay categorías" texto="Creá la primera con «Nueva categoría»." />}
        columnas={[
          { clave: 'icono', titulo: 'Ícono', render: (c) => <IconoCategoria className="tabla__icono" icono={c.icono} /> },
          { clave: 'nombre', titulo: 'Nombre', render: (c) => <strong>{c.nombre}</strong> },
          { clave: 'estado', titulo: 'Estado', render: (c) => <Badge tipo={c.activa ? 'ACTIVA' : 'INACTIVA'} /> },
        ]}
        acciones={(c) => (
          <>
            <button type="button" className="btn btn-outline" onClick={() => setFormulario({ categoria: c })}>Editar</button>
            <button type="button" className="btn btn-ghost" disabled={cambiando === c.id} onClick={() => alternar(c)}>
              {c.activa ? 'Desactivar' : 'Activar'}
            </button>
          </>
        )}
      />

      <Modal abierto={formulario !== null} onCerrar={() => setFormulario(null)} titulo={formulario?.categoria ? 'Editar categoría' : 'Nueva categoría'}>
        {formulario && <FormCategoria categoria={formulario.categoria} onCerrar={() => setFormulario(null)} onGuardado={recargar} />}
      </Modal>
    </>
  )
}

function FormCategoria({ categoria, onCerrar, onGuardado }: { categoria: Categoria | null; onCerrar: () => void; onGuardado: () => Promise<void> }) {
  const [nombre, setNombre] = useState(categoria?.nombre ?? '')
  const [icono, setIcono] = useState(categoria?.icono ?? '')
  const [errores, setErrores] = useState<{ nombre?: string; icono?: string }>({})
  const [enviando, setEnviando] = useState(false)
  const [errorEnvio, setErrorEnvio] = useState('')

  async function guardar(e: FormEvent) {
    e.preventDefault()
    const nuevos: { nombre?: string; icono?: string } = {}
    if (nombre.trim().length < 3) nuevos.nombre = 'Escribí un nombre de al menos 3 caracteres.'
    if (!icono.trim()) nuevos.icono = 'Elegí un emoji.'
    else if (/^[a-z][a-z0-9 -]*$/i.test(icono.trim())) nuevos.icono = 'Pegá un emoji, no el nombre de un ícono.'
    setErrores(nuevos)
    const primero = Object.keys(nuevos)[0]
    if (primero) return document.getElementById(`categoria-${primero}`)?.focus()
    setEnviando(true)
    setErrorEnvio('')
    try {
      if (categoria) await api.admin.categorias.actualizar(categoria.id, { nombre, icono })
      else await api.admin.categorias.crear({ nombre, icono })
      await onGuardado()
      onCerrar()
    } catch (err) {
      setErrorEnvio(mensajeDeError(err))
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={guardar} noValidate>
      <Campo id="categoria-nombre" etiqueta="Nombre" error={errores.nombre}>
        <input id="categoria-nombre" className="input" type="text" maxLength={40} value={nombre}
          aria-invalid={!!errores.nombre} aria-describedby={errores.nombre ? 'categoria-nombre-error' : undefined}
          placeholder="Ej.: Ruidos molestos" onChange={(e) => setNombre(e.target.value)} />
      </Campo>
      <Campo id="categoria-icono" etiqueta="Ícono" error={errores.icono} ayuda="Pegá un emoji, por ejemplo 🚧.">
        <input id="categoria-icono" className="input" type="text" maxLength={16} value={icono}
          aria-invalid={!!errores.icono} aria-describedby={`categoria-icono-ayuda${errores.icono ? ' categoria-icono-error' : ''}`}
          onChange={(e) => setIcono(e.target.value)} />
        <IconoCategoria icono={icono} />
      </Campo>
      {errorEnvio && <p className="campo__error" role="alert">{errorEnvio}</p>}
      <button type="submit" className="btn btn-primary btn-ancho" disabled={enviando}>{enviando ? 'Guardando…' : 'Guardar'}</button>
    </form>
  )
}
