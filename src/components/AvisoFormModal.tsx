import { useState, type FormEvent } from 'react'
import { api } from '../api'
import { mensajeDeError } from '../api/cliente'
import { useGrupos } from '../context/GruposContext'
import type { Aviso, PrioridadAviso } from '../types'
import Campo from './Campo'
import Modal from './Modal'

type Campos = 'titulo' | 'cuerpo'
type Errores = Partial<Record<Campos, string>>

interface Props {
  abierto: boolean
  aviso: Aviso | null // null = crear un aviso nuevo; con aviso = editarlo
  onCerrar: () => void
  onGuardado: () => void
}

const VIGENCIAS = [
  { valor: '', texto: 'Sin vencimiento' },
  { valor: '1', texto: '24 horas' },
  { valor: '3', texto: '3 días' },
  { valor: '7', texto: '7 días' },
  { valor: '30', texto: '30 días' },
]

// Modal para crear o editar un aviso de la comunidad.
export default function AvisoFormModal({ abierto, aviso, onCerrar, onGuardado }: Props) {
  return (
    <Modal abierto={abierto} onCerrar={onCerrar} titulo={aviso ? 'Editar aviso' : 'Crear aviso'}>
      {abierto && <FormAviso aviso={aviso} onCerrar={onCerrar} onGuardado={onGuardado} />}
    </Modal>
  )
}

function FormAviso({ aviso, onCerrar, onGuardado }: { aviso: Aviso | null; onCerrar: () => void; onGuardado: () => void }) {
  const { grupoActivo } = useGrupos()
  const [titulo, setTitulo] = useState(aviso?.titulo ?? '')
  const [cuerpo, setCuerpo] = useState(aviso?.cuerpo ?? '')
  const [prioridad, setPrioridad] = useState<PrioridadAviso>(aviso?.prioridad ?? 'NORMAL')
  const [vigencia, setVigencia] = useState('7')
  const [errores, setErrores] = useState<Errores>({})
  const [enviando, setEnviando] = useState(false)
  const [errorEnvio, setErrorEnvio] = useState('')

  async function guardar(e: FormEvent) {
    e.preventDefault()
    const nuevos: Errores = {}
    if (titulo.trim().length < 3) nuevos.titulo = 'Escribí un título de al menos 3 caracteres.'
    if (cuerpo.trim().length < 10) nuevos.cuerpo = 'Contá el aviso con al menos 10 caracteres.'
    setErrores(nuevos)
    const primero = Object.keys(nuevos)[0]
    if (primero) return document.getElementById(`aviso-${primero}`)?.focus()

    setEnviando(true)
    setErrorEnvio('')
    try {
      if (aviso) await api.avisos.actualizar(aviso.id, { titulo, cuerpo, prioridad })
      else await api.avisos.crear({ titulo, cuerpo, prioridad, vigenciaDias: vigencia ? Number(vigencia) : null, grupoId: grupoActivo?.id })
      onGuardado()
      onCerrar()
    } catch (err) {
      setErrorEnvio(mensajeDeError(err))
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={guardar} noValidate>
      <Campo id="aviso-titulo" etiqueta="Título" error={errores.titulo}>
        <input id="aviso-titulo" className="input" type="text" maxLength={80} value={titulo}
          aria-invalid={!!errores.titulo} aria-describedby={errores.titulo ? 'aviso-titulo-error' : undefined}
          placeholder="Ej.: Reunión de vecinos" onChange={(e) => setTitulo(e.target.value)} />
      </Campo>

      <Campo id="aviso-cuerpo" etiqueta="Mensaje" error={errores.cuerpo}>
        <textarea id="aviso-cuerpo" className="input textarea" rows={4} maxLength={400} value={cuerpo}
          aria-invalid={!!errores.cuerpo} aria-describedby={errores.cuerpo ? 'aviso-cuerpo-error' : undefined}
          placeholder="¿Qué tienen que saber tus vecinos?" onChange={(e) => setCuerpo(e.target.value)} />
      </Campo>

      <Campo id="aviso-prioridad" etiqueta="Prioridad" ayuda="Los importantes se destacan en el inicio.">
        <select id="aviso-prioridad" className="input" value={prioridad} aria-describedby="aviso-prioridad-ayuda"
          onChange={(e) => setPrioridad(e.target.value as PrioridadAviso)}>
          <option value="NORMAL">Normal</option>
          <option value="IMPORTANTE">Importante</option>
        </select>
      </Campo>

      {!aviso && (
        <Campo id="aviso-vigencia" etiqueta="Vigencia" ayuda="Pasado ese tiempo el aviso deja de mostrarse como vigente.">
          <select id="aviso-vigencia" className="input" value={vigencia} aria-describedby="aviso-vigencia-ayuda"
            onChange={(e) => setVigencia(e.target.value)}>
            {VIGENCIAS.map((v) => <option key={v.valor || 'sin'} value={v.valor}>{v.texto}</option>)}
          </select>
        </Campo>
      )}

      {errorEnvio && <p className="campo__error" role="alert">{errorEnvio}</p>}
      <button type="submit" className="btn btn-primary btn-ancho" disabled={enviando}>
        {enviando ? 'Guardando…' : aviso ? 'Guardar cambios' : 'Publicar aviso'}
      </button>
    </form>
  )
}
