import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ApiError, mensajeDeError } from '../../api/cliente'
import { USAR_MOCK } from '../../api/config'
import { useAuth } from '../../context/AuthContext'
import Campo from '../../components/Campo'
import CampoClave from '../../components/CampoClave'
import PantallaAuth from '../../components/PantallaAuth'
import fotoVecino from '../../assets/landing/vecino-celular.webp'

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
type Errores = { email?: string; password?: string }

export default function Login() {
  const { iniciarSesion, cambiarRol, estaLogueado, esAdmin, cargando } = useAuth()
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

  if (cargando) return <div role="status">Cargando sesión…</div>
  if (estaLogueado) return <Navigate to={esAdmin ? '/admin' : '/app'} replace />

  return (
    <PantallaAuth
      titulo="Ingresar"
      subtitulo="Entrá para ver lo que pasa en tus grupos."
      fondo={fotoVecino}
      pie={<>
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

      {/* El registro ya no está en el header: acá tiene que verse claro */}
      <div className="auth-registro">
        <p className="auth-registro__texto">¿No tenés una cuenta?</p>
        <Link to="/registro" className="btn btn-outline btn-ancho">Registrate</Link>
      </div>
    </PantallaAuth>
  )
}
