import { useState, type FormEvent } from 'react'
import { pedir, mensajeDeError } from '../../api/cliente'
import { USAR_MOCK } from '../../api/config'

export default function Contacto() {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [asunto, setAsunto] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [estado, setEstado] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function enviar(event: FormEvent) {
    event.preventDefault()
    setEnviando(true)
    setEstado('')
    try {
      if (!USAR_MOCK) await pedir('/contactos', { metodo: 'POST', cuerpo: { nombre, email, asunto, mensaje } })
      setEstado('Mensaje enviado. Gracias por contactarnos.')
      setMensaje('')
    } catch (cause) { setEstado(mensajeDeError(cause)) }
    finally { setEnviando(false) }
  }

  return <section className="container bloque">
    <h1>Contacto</h1>
    <form className="formulario" onSubmit={enviar}>
      <label htmlFor="contacto-nombre">Nombre</label>
      <input id="contacto-nombre" className="input" required value={nombre} onChange={(event) => setNombre(event.target.value)} />
      <label htmlFor="contacto-email">Email</label>
      <input id="contacto-email" className="input" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
      <label htmlFor="contacto-asunto">Asunto</label>
      <input id="contacto-asunto" className="input" value={asunto} onChange={(event) => setAsunto(event.target.value)} />
      <label htmlFor="contacto-mensaje">Mensaje</label>
      <textarea id="contacto-mensaje" className="input textarea" required rows={5} value={mensaje} onChange={(event) => setMensaje(event.target.value)} />
      {estado && <p role="status">{estado}</p>}
      <button className="btn btn-primary" type="submit" disabled={enviando}>{enviando ? 'Enviando…' : 'Enviar'}</button>
    </form>
  </section>
}
