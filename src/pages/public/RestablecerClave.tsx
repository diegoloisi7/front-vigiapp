import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ApiError, pedir, mensajeDeError } from '../../api/cliente'
import CampoClave from '../../components/CampoClave'
import PantallaAuth from '../../components/PantallaAuth'
import Proximamente from '../../components/Proximamente'
import { PROXIMAMENTE } from '../../api/config'

type Errores = { nueva?: string; confirmacion?: string }

export default function RestablecerClave() {
  const { token } = useParams()
  const [nueva, setNueva] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [errores, setErrores] = useState<Errores>({})
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [listo, setListo] = useState(false)

  async function enviar(event: FormEvent) {
    event.preventDefault()
    const nuevos: Errores = {}
    if (nueva.length < 8) nuevos.nueva = 'La contraseña debe tener al menos 8 caracteres.'
    if (confirmacion !== nueva) nuevos.confirmacion = 'Las contraseñas no coinciden.'
    setErrores(nuevos)
    const primero = Object.keys(nuevos)[0]
    if (primero) { document.getElementById(`clave-${primero}`)?.focus(); return }

    setEnviando(true)
    setError('')
    try {
      await pedir('/auth/reset-password', { metodo: 'POST', cuerpo: { token, newPassword: nueva } })
      setListo(true)
    } catch (causa) {
      setError(causa instanceof ApiError && causa.status === 404
        ? 'Todavía no se pueden restablecer contraseñas desde la app. Escribinos desde Contacto y te ayudamos.'
        : mensajeDeError(causa))
      setEnviando(false)
    }
  }

  // El backend todavía no tiene POST /auth/reset-password: se explica y se ofrece Contacto
  if (PROXIMAMENTE.restablecerClave) {
    return (
      <PantallaAuth titulo="Restablecer contraseña" pie={<p><Link to="/login">Volver a ingresar</Link></p>}>
        <div className="auth-proximamente" role="status">
          <Proximamente />
          <p>Todavía no se pueden restablecer contraseñas desde la app.</p>
          <p>Mientras tanto, escribinos desde Contacto y te ayudamos a recuperar el acceso.</p>
          <Link to="/contacto" className="btn btn-primary btn-ancho">Ir a Contacto</Link>
        </div>
      </PantallaAuth>
    )
  }

  if (!token) {
    return (
      <PantallaAuth titulo="Enlace no válido" subtitulo="El enlace para restablecer la contraseña está incompleto."
        pie={<p><Link to="/login">Volver a ingresar</Link></p>}>
        <p>Revisá que hayas copiado el enlace completo o pedí uno nuevo.</p>
      </PantallaAuth>
    )
  }

  if (listo) {
    return (
      <PantallaAuth titulo="Contraseña actualizada">
        <div className="auth-exito" role="status">
          <span className="auth-exito__icono" aria-hidden="true">✅</span>
          <p>Ya podés ingresar con tu nueva contraseña.</p>
          <Link to="/login" className="btn btn-primary btn-ancho">Ingresar</Link>
        </div>
      </PantallaAuth>
    )
  }

  return (
    <PantallaAuth titulo="Restablecer contraseña" subtitulo="Elegí una contraseña nueva para tu cuenta."
      pie={<p><Link to="/login">Volver a ingresar</Link></p>}>
      <form onSubmit={enviar} noValidate>
        <CampoClave id="clave-nueva" etiqueta="Nueva contraseña" valor={nueva} onCambiar={setNueva} autoComplete="new-password"
          error={errores.nueva} ayuda={nueva.length >= 8 ? '✓ Cumple el mínimo de 8 caracteres.' : 'Mínimo 8 caracteres.'} />
        <CampoClave id="clave-confirmacion" etiqueta="Repetí la contraseña" valor={confirmacion} onCambiar={setConfirmacion}
          autoComplete="new-password" error={errores.confirmacion} />
        {error && <p className="campo__error" role="alert">{error}</p>}
        <button type="submit" className="btn btn-primary btn-ancho" disabled={enviando}>{enviando ? 'Guardando…' : 'Guardar contraseña'}</button>
      </form>
    </PantallaAuth>
  )
}
