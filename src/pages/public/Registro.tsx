import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { pedir, mensajeDeError } from '../../api/cliente'
import { USAR_MOCK } from '../../api/config'
import { useAuth } from '../../context/AuthContext'

export default function Registro() {
  const { iniciarSesion, cambiarRol } = useAuth()
  const navigate = useNavigate()
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function enviar(event: FormEvent) {
    event.preventDefault()
    setEnviando(true)
    setError('')
    try {
      if (USAR_MOCK) cambiarRol('VECINO')
      else {
        await pedir('/auth/register', { metodo: 'POST', cuerpo: { firstName: nombre, lastName: apellido, email, password } })
        await iniciarSesion(email, password)
      }
      navigate('/app')
    } catch (cause) { setError(mensajeDeError(cause)) }
    finally { setEnviando(false) }
  }

  return <section className="container bloque">
    <h1>Crear cuenta</h1>
    <form className="formulario" onSubmit={enviar}>
      <label htmlFor="registro-nombre">Nombre</label>
      <input id="registro-nombre" className="input" required value={nombre} onChange={(event) => setNombre(event.target.value)} />
      <label htmlFor="registro-apellido">Apellido</label>
      <input id="registro-apellido" className="input" required value={apellido} onChange={(event) => setApellido(event.target.value)} />
      <label htmlFor="registro-email">Email</label>
      <input id="registro-email" className="input" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
      <label htmlFor="registro-password">Contraseña (mínimo 8 caracteres)</label>
      <input id="registro-password" className="input" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} />
      {error && <p className="campo__error" role="alert">{error}</p>}
      <button className="btn btn-primary" type="submit" disabled={enviando}>{enviando ? 'Registrando…' : 'Registrarme'}</button>
    </form>
    <p>¿Ya tenés cuenta? <Link to="/login">Ingresá</Link>.</p>
  </section>
}
