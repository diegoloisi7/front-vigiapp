import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ApiError, mensajeDeError } from '../../api/cliente'
import { USAR_MOCK } from '../../api/config'
import { useAuth } from '../../context/AuthContext'
import Campo from '../../components/Campo'
import CampoClave from '../../components/CampoClave'
import PantallaAuth from '../../components/PantallaAuth'

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
type Errores = { email?: string; password?: string }

export default function Login() {
  const { iniciarSesion, cambiarRol } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errores, setErrores] = useState<Errores>({})
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function enviar(event: FormEvent) {
    event.preventDefault()
    const nuevos: Errores = {}
    if (!EMAIL_VALIDO.test(email.trim())) nuevos.email = 'Escribí un email válido, por ejemplo vecino@correo.com.'
    if (!password) nuevos.password = 'Escribí tu contraseña.'
    setErrores(nuevos)
    const primero = Object.keys(nuevos)[0]
    if (primero) { document.getElementById(`login-${primero}`)?.focus(); return }

    setEnviando(true)
    setError('')
    try {
      const rol = USAR_MOCK ? (cambiarRol('VECINO'), 'VECINO') : await iniciarSesion(email.trim(), password)
      navigate(rol === 'ADMINISTRADOR' ? '/admin' : '/app')
    } catch (causa) {
      // Mensaje genérico: no se revela si falló el email o la contraseña
      setError(causa instanceof ApiError && (causa.status === 401 || causa.status === 400) ? 'Email o contraseña incorrectos.' : mensajeDeError(causa))
      setEnviando(false)
    }
  }

  return (
    <PantallaAuth
      titulo="Ingresar"
      subtitulo="Entrá para ver lo que pasa en tus grupos."
      pie={<>
        <p>¿Todavía no tenés cuenta? <Link to="/registro">Creá una</Link></p>
        <p>¿Olvidaste tu contraseña? <Link to="/contacto">Escribinos</Link> y te ayudamos.</p>
      </>}
    >
      <form onSubmit={enviar} noValidate>
        <Campo id="login-email" etiqueta="Email" error={errores.email}>
          <input id="login-email" className="input" type="email" inputMode="email" autoComplete="email" maxLength={191} value={email}
            aria-invalid={!!errores.email} aria-describedby={errores.email ? 'login-email-error' : undefined}
            onChange={(e) => setEmail(e.target.value)} />
        </Campo>
        <CampoClave id="login-password" etiqueta="Contraseña" valor={password} onCambiar={setPassword}
          autoComplete="current-password" error={errores.password} />
        {error && <p className="campo__error" role="alert">{error}</p>}
        <button className="btn btn-primary btn-ancho" type="submit" disabled={enviando}>{enviando ? 'Ingresando…' : 'Ingresar'}</button>
      </form>
    </PantallaAuth>
  )
}
