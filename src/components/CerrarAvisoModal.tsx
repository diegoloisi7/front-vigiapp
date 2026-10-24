import { useState } from 'react'
import { api } from '../api'
import { mensajeDeError } from '../api/cliente'
import type { Aviso } from '../types'
import Modal from './Modal'

interface Props {
  aviso: Aviso | null // null = modal cerrado
  onCerrar: () => void
  onGuardado: () => void
}

// Confirmación para cerrar un aviso (lo puede hacer su creador o el owner del grupo).
export default function CerrarAvisoModal({ aviso, onCerrar, onGuardado }: Props) {
  return (
    <Modal abierto={aviso !== null} onCerrar={onCerrar} titulo="Cerrar aviso">
      {aviso && <Confirmacion aviso={aviso} onCerrar={onCerrar} onGuardado={onGuardado} />}
    </Modal>
  )
}

function Confirmacion({ aviso, onCerrar, onGuardado }: { aviso: Aviso; onCerrar: () => void; onGuardado: () => void }) {
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  async function cerrar() {
    setEnviando(true)
    setError('')
    try {
      await api.avisos.cerrar(aviso.id)
      onGuardado()
      onCerrar()
    } catch (e) {
      setError(mensajeDeError(e))
      setEnviando(false)
    }
  }

  return (
    <>
      <p>Vas a cerrar «<strong>{aviso.titulo}</strong>». Deja de mostrarse como vigente y ya no se puede editar.</p>
      {error && <p className="campo__error" role="alert">{error}</p>}
      <div className="stack">
        <button type="button" className="btn btn-primary" disabled={enviando} onClick={cerrar}>{enviando ? 'Cerrando…' : 'Cerrar aviso'}</button>
        <button type="button" className="btn btn-outline" disabled={enviando} onClick={onCerrar}>Cancelar</button>
      </div>
    </>
  )
}
