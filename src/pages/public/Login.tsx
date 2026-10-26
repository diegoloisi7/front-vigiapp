import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { mensajeDeError } from '../../api/cliente'
import { USAR_MOCK } from '../../api/config'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const { iniciarSesion, cambiarRol } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function enviar(event: FormEvent) {
    event.preventDefault()
    setEnviando(true)
    setError('')
    try {
      const role = USAR_MOCK ? (cambiarRol('VECINO'), 'VECINO') : await iniciarSesion(email, password)
      navigate(role === 'ADMINISTRADOR' ? '/admin' : '/app')
    } catch (cause) { setError(mensajeDeError(cause)) }
    finally { setEnviando(false) }
  }

  return <section className="container bloque">
    <h1>Ingresar</h1>
    <form className="formulario" onSubmit={enviar}>
      <label htmlFor="login-email">Email</label>
      <input id="login-email" className="input" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
      <label htmlFor="login-password">Contraseña</label>
      <input id="login-password" className="input" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
      {error && <p className="campo__error" role="alert">{error}</p>}
      <button className="btn btn-primary" type="submit" disabled={enviando}>{enviando ? 'Ingresando…' : 'Ingresar'}</button>
    </form>
    <p>¿Todavía no tenés cuenta? <Link to="/registro">Registrate</Link>.</p>
  </section>
}
