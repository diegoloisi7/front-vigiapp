import { useState, type FormEvent } from 'react'
import { pedir, mensajeDeError } from '../../api/cliente'
import { USAR_MOCK } from '../../api/config'
import Campo from '../../components/Campo'

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_MENSAJE = 2000
type Clave = 'nombre' | 'email' | 'asunto' | 'mensaje'
type Errores = Partial<Record<Clave, string>>

export default function Contacto() {
  const [valores, setValores] = useState<Record<Clave, string>>({ nombre: '', email: '', asunto: '', mensaje: '' })
  const [trampa, setTrampa] = useState('') // honeypot: los humanos no lo ven; si viene completo, es un bot
  const [errores, setErrores] = useState<Errores>({})
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  function cambiar(clave: Clave, valor: string) {
    setValores((v) => ({ ...v, [clave]: valor }))
    if (errores[clave]) setErrores((e) => ({ ...e, [clave]: undefined }))
  }

  async function enviar(event: FormEvent) {
    event.preventDefault()
    const nuevos: Errores = {}
    if (!valores.nombre.trim()) nuevos.nombre = 'Escribí tu nombre.'
    if (!EMAIL_VALIDO.test(valores.email.trim())) nuevos.email = 'Escribí un email válido para poder responderte.'
    if (!valores.asunto.trim()) nuevos.asunto = 'Contanos el motivo en pocas palabras.'
    if (valores.mensaje.trim().length < 10) nuevos.mensaje = 'Escribí un mensaje de al menos 10 caracteres.'
    setErrores(nuevos)
    const primero = Object.keys(nuevos)[0]
    if (primero) { document.getElementById(`contacto-${primero}`)?.focus(); return }

    // Un bot completó el campo oculto: se simula el envío sin mandar nada
    if (trampa) { setEnviado(true); return }

    setEnviando(true)
    setError('')
    try {
      if (!USAR_MOCK) {
        await pedir('/contactos', { metodo: 'POST', cuerpo: {
          nombre: valores.nombre.trim(), email: valores.email.trim(), asunto: valores.asunto.trim(), mensaje: valores.mensaje.trim(),
        } })
      }
      setEnviado(true)
    } catch (causa) {
      setError(mensajeDeError(causa))
    } finally {
      setEnviando(false)
    }
  }

  function otroMensaje() {
    setValores((v) => ({ ...v, asunto: '', mensaje: '' }))
    setEnviado(false)
  }

  const campo = (clave: 'nombre' | 'email' | 'asunto', etiqueta: string, extra: { type?: string; autoComplete?: string; maxLength: number; inputMode?: 'email' }) => (
    <Campo id={`contacto-${clave}`} etiqueta={etiqueta} error={errores[clave]}>
      <input id={`contacto-${clave}`} className="input" type={extra.type ?? 'text'} autoComplete={extra.autoComplete} inputMode={extra.inputMode}
        maxLength={extra.maxLength} value={valores[clave]} aria-invalid={!!errores[clave]}
        aria-describedby={errores[clave] ? `contacto-${clave}-error` : undefined} onChange={(e) => cambiar(clave, e.target.value)} />
    </Campo>
  )

  return (
    <section className="contacto container" aria-labelledby="contacto-titulo">
      <div className="contacto__intro">
        <h1 id="contacto-titulo">Contacto</h1>
        <p className="section-lead">¿Tenés una duda, querés sumar a tu barrio o encontraste un problema? Escribinos.</p>
        <ul className="contacto__motivos">
          <li><span aria-hidden="true">🏘️</span> Sumar a tu barrio o crear un grupo vecinal</li>
          <li><span aria-hidden="true">🔑</span> Problemas para ingresar o con tu cuenta</li>
          <li><span aria-hidden="true">💡</span> Sugerencias para mejorar la app</li>
        </ul>
        <p className="contacto__aviso">🚨 Si es una emergencia, llamá al <a href="tel:911">911</a>. Este formulario no se lee en tiempo real.</p>
      </div>

      <div className="auth__tarjeta contacto__tarjeta">
        {enviado ? (
          <div className="auth-exito" role="status">
            <span className="auth-exito__icono" aria-hidden="true">✅</span>
            <h2>¡Mensaje enviado!</h2>
            <p>Gracias{valores.nombre.trim() ? `, ${valores.nombre.trim()}` : ''}. Lo vamos a leer y te respondemos a <strong>{valores.email.trim()}</strong>.</p>
            <button type="button" className="btn btn-outline btn-ancho" onClick={otroMensaje}>Enviar otro mensaje</button>
          </div>
        ) : (
          <form onSubmit={enviar} noValidate>
            <h2 className="contacto__form-titulo">Escribinos</h2>
            {campo('nombre', 'Nombre', { autoComplete: 'name', maxLength: 150 })}
            {campo('email', 'Email', { type: 'email', autoComplete: 'email', maxLength: 191, inputMode: 'email' })}
            {campo('asunto', 'Asunto', { maxLength: 150 })}
            <Campo id="contacto-mensaje" etiqueta="Mensaje" error={errores.mensaje}>
              <textarea id="contacto-mensaje" className="input textarea" rows={5} maxLength={MAX_MENSAJE} value={valores.mensaje}
                aria-invalid={!!errores.mensaje} aria-describedby={`contacto-mensaje-contador${errores.mensaje ? ' contacto-mensaje-error' : ''}`}
                onChange={(e) => cambiar('mensaje', e.target.value)} />
              <p id="contacto-mensaje-contador" className="contacto__contador">{valores.mensaje.length} / {MAX_MENSAJE}</p>
            </Campo>
            {/* Campo trampa para bots: oculto a la vista y a los lectores de pantalla */}
            <div className="campo-trampa" aria-hidden="true">
              <label htmlFor="contacto-sitio">Sitio web</label>
              <input id="contacto-sitio" tabIndex={-1} autoComplete="off" value={trampa} onChange={(e) => setTrampa(e.target.value)} />
            </div>
            {error && <p className="campo__error" role="alert">{error}</p>}
            <button className="btn btn-primary btn-ancho" type="submit" disabled={enviando}>{enviando ? 'Enviando…' : 'Enviar mensaje'}</button>
          </form>
        )}
      </div>
    </section>
  )
}
