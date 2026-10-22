import { useState, type FormEvent } from 'react'
import { api } from '../api'
import { mensajeDeError } from '../api/cliente'
import { ESTADOS } from '../data/mock'
import { TRANSICIONES } from '../utils/permisos'
import type { EstadoIncidencia, Incidencia } from '../types'
import Modal from './Modal'

const AYUDA: Partial<Record<EstadoIncidencia, string>> = {
  EN_SEGUIMIENTO: 'Ya se está atendiendo o gestionando.',
  RESUELTO: 'El problema se solucionó.',
  DESCARTADO: 'Es un duplicado, una falsa alarma o no corresponde.',
}

interface Props {
  incidencia: Incidencia | null // null = modal cerrado
  estadoInicial?: EstadoIncidencia
  onCerrar: () => void
  onGuardado: () => void
}

// Modal para actualizar o cerrar un incidente (lo usan el creador y el owner del grupo).
export default function EstadoIncidenteModal({ incidencia, estadoInicial, onCerrar, onGuardado }: Props) {
  return (
    <Modal abierto={incidencia !== null} onCerrar={onCerrar} titulo="Actualizar estado">
      {incidencia && <FormEstado incidencia={incidencia} estadoInicial={estadoInicial} onCerrar={onCerrar} onGuardado={onGuardado} />}
    </Modal>
  )
}

function FormEstado({ incidencia, estadoInicial, onCerrar, onGuardado }: {
  incidencia: Incidencia
  estadoInicial?: EstadoIncidencia
  onCerrar: () => void
  onGuardado: () => void
}) {
  const permitidos = TRANSICIONES[incidencia.estado]
  const [estado, setEstado] = useState<EstadoIncidencia>(
    estadoInicial && permitidos.includes(estadoInicial) ? estadoInicial : permitidos[0],
  )
  const [nota, setNota] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  async function guardar(e: FormEvent) {
    e.preventDefault()
    setEnviando(true)
    setError('')
    try {
      await api.incidencias.cambiarEstado(incidencia.id, estado, nota)
      onGuardado()
      onCerrar()
    } catch (err) {
      setError(mensajeDeError(err))
      setEnviando(false)
    }
  }

  if (permitidos.length === 0) return <p>Este incidente ya está cerrado y no admite cambios.</p>

  const cierra = estado === 'RESUELTO' || estado === 'DESCARTADO'

  return (
    <form onSubmit={guardar}>
      <p className="campo__ayuda"><strong>{incidencia.titulo}</strong> · hoy está «{ESTADOS[incidencia.estado]}»</p>

      <fieldset className="ayuda-tipos">
        <legend>Pasar a…</legend>
        {permitidos.map((e) => (
          <label key={e} className="opcion-radio opcion-radio--detalle">
            <input type="radio" name="nuevo-estado" value={e} checked={estado === e} onChange={() => setEstado(e)} />
            <span>
              <strong>{ESTADOS[e]}</strong>
              <span className="opcion-radio__ayuda">{AYUDA[e]}</span>
            </span>
          </label>
        ))}
      </fieldset>

      <div className="campo">
        <label htmlFor="nota-estado">Nota (opcional)</label>
        <textarea id="nota-estado" className="input textarea" rows={3} maxLength={200} value={nota}
          placeholder="Ej.: Lo arregló la cuadrilla municipal" onChange={(e) => setNota(e.target.value)} />
      </div>

      {cierra && <p className="campo__ayuda">Al cerrarlo, el incidente ya no admite más cambios.</p>}
      {error && <p className="campo__error" role="alert">{error}</p>}
      <button type="submit" className="btn btn-primary btn-ancho" disabled={enviando}>
        {enviando ? 'Guardando…' : cierra ? 'Cerrar incidente' : 'Guardar'}
      </button>
    </form>
  )
}
