import { useState } from 'react'
import { api } from '../../api'
import { mensajeDeError } from '../../api/cliente'
import { useConsulta } from '../../hooks/useConsulta'
import Badge from '../../components/Badge'
import EmptyState from '../../components/EmptyState'
import EstadoConsulta from '../../components/EstadoConsulta'
import Modal from '../../components/Modal'
import TablaAdmin from '../../components/TablaAdmin'
import { fechaLarga, tiempoRelativo } from '../../utils/formato'
import type { Contacto } from '../../types'

// Mensajes que llegan desde el formulario de contacto de la página pública.
export default function AdminContactos() {
  const { datos, cargando, error, recargar } = useConsulta(() => api.admin.contactos.listar(), [])
  const [viendo, setViendo] = useState<Contacto | null>(null)
  const contactos = datos ?? []

  return (
    <>
      <p className="detalle__meta" role="status">{contactos.length} mensajes · {contactos.filter((c) => !c.leido).length} sin leer</p>

      <EstadoConsulta cargando={cargando} error={error} onReintentar={recargar}>
        <TablaAdmin<Contacto>
          etiqueta="Mensajes de contacto"
          filas={contactos}
          clave={(c) => c.id}
          vacio={<EmptyState icono="✉️" titulo="No hay mensajes" texto="Cuando alguien use el formulario de contacto, lo vas a ver acá." />}
          columnas={[
            { clave: 'de', titulo: 'De', render: (c) => <><strong>{c.nombre}</strong><small>{c.email}</small></> },
            { clave: 'asunto', titulo: 'Asunto', render: (c) => c.asunto },
            { clave: 'fecha', titulo: 'Recibido', render: (c) => tiempoRelativo(c.fecha) },
            { clave: 'estado', titulo: 'Estado', render: (c) => <Badge tipo={c.leido ? 'LEIDO' : 'NUEVO'} /> },
          ]}
          acciones={(c) => <button type="button" className="btn btn-outline" onClick={() => setViendo(c)}>Ver mensaje</button>}
        />
      </EstadoConsulta>

      <Modal abierto={viendo !== null} onCerrar={() => setViendo(null)} titulo="Mensaje de contacto">
        {viendo && <Detalle contacto={viendo} onCerrar={() => setViendo(null)} onLeido={recargar} />}
      </Modal>
    </>
  )
}

function Detalle({ contacto, onCerrar, onLeido }: { contacto: Contacto; onCerrar: () => void; onLeido: () => void }) {
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  async function marcarLeido() {
    setEnviando(true)
    setError('')
    try {
      await api.admin.contactos.marcarLeido(contacto.id)
      onLeido()
      onCerrar()
    } catch (e) {
      setError(mensajeDeError(e))
      setEnviando(false)
    }
  }

  return (
    <>
      <dl className="datos">
        <dt>De</dt><dd>{contacto.nombre}</dd>
        <dt>Email</dt><dd>{contacto.email}</dd>
        <dt>Asunto</dt><dd>{contacto.asunto}</dd>
        <dt>Recibido</dt><dd>{fechaLarga(contacto.fecha)}</dd>
      </dl>
      <p className="mensaje-contacto">{contacto.mensaje}</p>
      {error && <p className="campo__error" role="alert">{error}</p>}
      <div className="stack">
        <a className="btn btn-outline" href={`mailto:${contacto.email}?subject=${encodeURIComponent(`Re: ${contacto.asunto}`)}`}>Responder por email</a>
        {!contacto.leido && (
          <button type="button" className="btn btn-primary" disabled={enviando} onClick={marcarLeido}>{enviando ? 'Guardando…' : 'Marcar como leído'}</button>
        )}
      </div>
    </>
  )
}
