import { useState, type FormEvent } from 'react'
import { api } from '../api'
import { mensajeDeError } from '../api/cliente'
import { useCategorias } from '../context/CategoriasContext'
import type { Incidencia } from '../types'
import Campo from './Campo'
import IconoCategoria, { iconoDeCategoria } from './IconoCategoria'
import Modal from './Modal'

type Campos = 'titulo' | 'categoriaId' | 'descripcion' | 'ubicacion'
type Errores = Partial<Record<Campos, string>>

interface Props {
  incidencia: Incidencia | null // null = modal cerrado
  onCerrar: () => void
  onGuardado: () => void
}

// Modal para completar o corregir los datos de un incidente (creador u owner del grupo).
export default function EditarIncidenteModal({ incidencia, onCerrar, onGuardado }: Props) {
  return (
    <Modal abierto={incidencia !== null} onCerrar={onCerrar} titulo="Editar datos">
      {incidencia && <FormEditar incidencia={incidencia} onCerrar={onCerrar} onGuardado={onGuardado} />}
    </Modal>
  )
}

function FormEditar({ incidencia, onCerrar, onGuardado }: { incidencia: Incidencia; onCerrar: () => void; onGuardado: () => void }) {
  const { categorias } = useCategorias()
  const [valores, setValores] = useState<Record<Campos, string>>({
    titulo: incidencia.titulo,
    categoriaId: incidencia.categoriaId,
    descripcion: incidencia.descripcion,
    ubicacion: incidencia.ubicacion,
  })
  const [errores, setErrores] = useState<Errores>({})
  const [enviando, setEnviando] = useState(false)
  const [errorEnvio, setErrorEnvio] = useState('')
  const urgente = incidencia.tipo === 'URGENTE'

  function cambiar(campo: Campos, valor: string) {
    setValores((v) => ({ ...v, [campo]: valor }))
    if (errores[campo]) setErrores((e) => ({ ...e, [campo]: undefined }))
  }

  // En un reporte urgente casi nada es obligatorio; en uno normal sí
  function validar(): Errores {
    const e: Errores = {}
    if (valores.titulo.trim().length < 3) e.titulo = 'Escribí un título de al menos 3 caracteres.'
    if (!urgente) {
      if (!valores.categoriaId) e.categoriaId = 'Elegí una categoría.'
      if (valores.descripcion.trim().length < 10) e.descripcion = 'Contá qué pasa con al menos 10 caracteres.'
      if (!valores.ubicacion.trim()) e.ubicacion = 'Indicá dónde está el problema.'
    }
    return e
  }

  async function guardar(e: FormEvent) {
    e.preventDefault()
    const nuevos = validar()
    setErrores(nuevos)
    const primero = Object.keys(nuevos)[0]
    if (primero) return document.getElementById(`editar-${primero}`)?.focus()

    setEnviando(true)
    setErrorEnvio('')
    try {
      await api.incidencias.actualizar(incidencia.id, valores)
      onGuardado()
      onCerrar()
    } catch (err) {
      setErrorEnvio(mensajeDeError(err))
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={guardar} noValidate>
      {urgente && <p className="campo__ayuda">Completá lo que sepas: podés guardarlo con los datos que tengas.</p>}

      <Campo id="editar-titulo" etiqueta="Título" error={errores.titulo}>
        <input id="editar-titulo" className="input" type="text" maxLength={80} value={valores.titulo}
          aria-invalid={!!errores.titulo} aria-describedby={errores.titulo ? 'editar-titulo-error' : undefined}
          onChange={(e) => cambiar('titulo', e.target.value)} />
      </Campo>

      <Campo id="editar-categoriaId" etiqueta="Categoría" error={errores.categoriaId}>
        <div className="categoria-seleccion">
          <select id="editar-categoriaId" className="input" value={valores.categoriaId}
            aria-invalid={!!errores.categoriaId} aria-describedby={errores.categoriaId ? 'editar-categoriaId-error' : undefined}
            onChange={(e) => cambiar('categoriaId', e.target.value)}>
            <option value="">Sin categoría</option>
            {categorias.filter((c) => c.activa).map((c) => <option key={c.id} value={c.id}>{iconoDeCategoria(c.icono)} {c.nombre}</option>)}
          </select>
          {valores.categoriaId && <IconoCategoria icono={categorias.find((c) => c.id === valores.categoriaId)?.icono} />}
        </div>
      </Campo>

      <Campo id="editar-descripcion" etiqueta="Descripción" error={errores.descripcion}>
        <textarea id="editar-descripcion" className="input textarea" rows={4} maxLength={500} value={valores.descripcion}
          aria-invalid={!!errores.descripcion} aria-describedby={errores.descripcion ? 'editar-descripcion-error' : undefined}
          onChange={(e) => cambiar('descripcion', e.target.value)} />
      </Campo>

      <Campo id="editar-ubicacion" etiqueta="Ubicación" error={errores.ubicacion}>
        <input id="editar-ubicacion" className="input" type="text" value={valores.ubicacion}
          aria-invalid={!!errores.ubicacion} aria-describedby={errores.ubicacion ? 'editar-ubicacion-error' : undefined}
          onChange={(e) => cambiar('ubicacion', e.target.value)} />
      </Campo>

      {errorEnvio && <p className="campo__error" role="alert">{errorEnvio}</p>}
      <button type="submit" className="btn btn-primary btn-ancho" disabled={enviando}>
        {enviando ? 'Guardando…' : 'Guardar cambios'}
      </button>
    </form>
  )
}
