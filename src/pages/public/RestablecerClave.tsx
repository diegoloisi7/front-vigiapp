import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { pedir, mensajeDeError } from '../../api/cliente'

export default function RestablecerClave() {
  const { token } = useParams()
  const [password, setPassword] = useState('')
  const [estado, setEstado] = useState('')
  const [listo, setListo] = useState(false)

  async function enviar(event: FormEvent) {
    event.preventDefault()
    try {
      await pedir('/auth/reset-password', { metodo: 'POST', cuerpo: { token, newPassword: password } })
      setListo(true)
      setEstado('Contraseña actualizada.')
    } catch (cause) { setEstado(mensajeDeError(cause)) }
  }

  return <section className="container bloque">
    <h1>Restablecer contraseña</h1>
    {listo ? <p>{estado} <Link to="/login">Ingresar</Link></p> : <form className="formulario" onSubmit={enviar}>
      <label htmlFor="clave-nueva">Nueva contraseña</label>
      <input id="clave-nueva" className="input" type="password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} />
      {estado && <p className="campo__error" role="alert">{estado}</p>}
      <button type="submit" className="btn btn-primary">Guardar contraseña</button>
    </form>}
  </section>
}
