import { useState, type ReactNode } from 'react'
import { mensajeDeError } from '../api/cliente'
import Modal from './Modal'

interface Props {
  abierto: boolean
  titulo: string
  children: ReactNode // el texto que explica qué va a pasar
  textoBoton: string
  onConfirmar: () => Promise<void>
  onCerrar: () => void
}

// Confirmación para acciones que no se pueden deshacer (eliminar, blanquear contraseña...).
export default function ConfirmarModal({ abierto, titulo, children, textoBoton, onConfirmar, onCerrar }: Props) {
  return (
    <Modal abierto={abierto} onCerrar={onCerrar} titulo={titulo}>
      {abierto && <Cuerpo textoBoton={textoBoton} onConfirmar={onConfirmar} onCerrar={onCerrar}>{children}</Cuerpo>}
    </Modal>
  )
}

function Cuerpo({ children, textoBoton, onConfirmar, onCerrar }: Omit<Props, 'abierto' | 'titulo'>) {
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  async function confirmar() {
    setEnviando(true)
    setError('')
    try {
      await onConfirmar()
      onCerrar()
    } catch (e) {
      setError(mensajeDeError(e))
      setEnviando(false)
    }
  }

  return (
    <>
      <div className="confirmar-texto">{children}</div>
      {error && <p className="campo__error" role="alert">{error}</p>}
      <div className="stack">
        <button type="button" className="btn btn-peligro" disabled={enviando} onClick={confirmar}>{enviando ? 'Procesando…' : textoBoton}</button>
        <button type="button" className="btn btn-outline" disabled={enviando} onClick={onCerrar}>Cancelar</button>
      </div>
    </>
  )
}
