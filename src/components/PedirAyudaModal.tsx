import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { mensajeDeError } from '../api/cliente'
import { useGrupos } from '../context/GruposContext'
import { obtenerUbicacion } from '../utils/ubicacion'
import type { Incidencia } from '../types'
import HoldButton from './HoldButton'
import Modal from './Modal'

interface Props {
  abierto: boolean
  onCerrar: () => void
  onEnviado?: () => void // para que la pantalla se actualice
}

// Reporte urgente (SOS): solo se mantiene presionado 3 s. No pide ningún dato:
// toma la ubicación en vivo y el vecino completa el resto después.
export default function PedirAyudaModal({ abierto, onCerrar, onEnviado }: Props) {
  const { grupoActivo } = useGrupos()
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState<Incidencia | null>(null)
  const [error, setError] = useState('')

  function cerrar() {
    setEnviando(false)
    setEnviado(null)
    setError('')
    onCerrar()
  }

  async function enviar() {
    setEnviando(true)
    setError('')
    const ubicacion = await obtenerUbicacion() // si no se puede, igual se envía el aviso
    try {
      const creado = await api.incidencias.crearUrgente({ lat: ubicacion?.lat ?? null, lng: ubicacion?.lng ?? null, grupoId: grupoActivo?.id })
      setEnviado(creado)
      onEnviado?.()
    } catch (e) {
      setError(mensajeDeError(e))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Modal abierto={abierto} onCerrar={cerrar} titulo="Pedir ayuda">
      {enviado ? (
        <div className="ayuda-ok" role="status">
          <span aria-hidden="true" className="ayuda-ok__icon">✅</span>
          <h3>Alerta enviada a tu grupo</h3>
          <p>
            {enviado.lat === null
              ? 'No pudimos obtener tu ubicación, así que el aviso salió sin ella. Podés completarla ahora.'
              : 'Tu grupo recibió el aviso con tu ubicación en vivo. Podés completar los datos cuando puedas.'}
            {' '}Si estás en peligro, llamá al 911.
          </p>
          <div className="stack">
            <Link to={`/app/incidencias/${enviado.id}`} className="btn btn-primary" onClick={cerrar}>Completar datos</Link>
            <button type="button" className="btn btn-outline" onClick={cerrar}>Cerrar</button>
          </div>
        </div>
      ) : (
        <>
          <p className="ayuda-paso">Mantené presionado para avisar a tu grupo.</p>
          <p className="campo__ayuda">Se envía tu ubicación en vivo. No hace falta completar nada ahora.</p>
          {enviando ? (
            <p className="ayuda-enviando" role="status">Enviando tu ubicación y el aviso…</p>
          ) : (
            <HoldButton onCompletado={enviar} />
          )}
          {error && <p className="campo__error" role="alert">{error}</p>}
        </>
      )}

      {/* Aviso permanente: visible en todos los pasos */}
      <div className="aviso-911">
        <p>Esta app no reemplaza al 911, bomberos ni servicios médicos.</p>
        <a className="btn btn-outline" href="tel:911">Llamar al 911</a>
      </div>
    </Modal>
  )
}
