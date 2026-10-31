import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ApiError, pedir, mensajeDeError } from '../../api/cliente'
import { USAR_MOCK } from '../../api/config'
import { useAuth } from '../../context/AuthContext'
import Campo from '../../components/Campo'
import CampoClave from '../../components/CampoClave'
import PantallaAuth from '../../components/PantallaAuth'

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
type Clave = 'nombre' | 'apellido' | 'email' | 'password' | 'confirmacion' | 'terminos'
type Errores = Partial<Record<Clave, string>>

export default function Registro() {
  const { iniciarSesion, cambiarRol } = useAuth()
  const navigate = useNavigate()
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [terminos, setTerminos] = useState(false)
  const [errores, setErrores] = useState<Errores>({})
  const [error, setError] = useState('')
  const [emailRepetido, setEmailRepetido] = useState(false)
  const [enviando, setEnviando] = useState(false)

  function validar(): Errores {
    const e: Errores = {}
    if (!nombre.trim()) e.nombre = 'Escribí tu nombre.'
    if (!apellido.trim()) e.apellido = 'Escribí tu apellido.'
    if (!EMAIL_VALIDO.test(email.trim())) e.email = 'Escribí un email válido, por ejemplo vecino@correo.com.'
    if (password.length < 8) e.password = 'La contraseña debe tener al menos 8 caracteres.'
    if (confirmacion !== password) e.confirmacion = 'Las contraseñas no coinciden.'
    if (!terminos) e.terminos = 'Tenés que aceptar las condiciones para crear la cuenta.'
    return e
  }

  async function enviar(event: FormEvent) {
    event.preventDefault()
    const nuevos = validar()
    setErrores(nuevos)
    const primero = Object.keys(nuevos)[0]
    if (primero) { document.getElementById(`registro-${primero}`)?.focus(); return }

    setEnviando(true)
    setError('')
    setEmailRepetido(false)
    try {
      if (USAR_MOCK) cambiarRol('VECINO')
      else {
        await pedir('/auth/register', { metodo: 'POST', cuerpo: { firstName: nombre.trim(), lastName: apellido.trim(), email: email.trim(), password } })
        await iniciarSesion(email.trim(), password)
      }
      navigate('/app')
    } catch (causa) {
      if (causa instanceof ApiError && causa.status === 409) setEmailRepetido(true)
      else setError(mensajeDeError(causa))
      setEnviando(false)
    }
  }

  const campoTexto = (clave: 'nombre' | 'apellido', etiqueta: string, valor: string, cambiar: (v: string) => void, autoComplete: string) => (
    <Campo id={`registro-${clave}`} etiqueta={etiqueta} error={errores[clave]}>
      <input id={`registro-${clave}`} className="input" autoComplete={autoComplete} maxLength={100} value={valor}
        aria-invalid={!!errores[clave]} aria-describedby={errores[clave] ? `registro-${clave}-error` : undefined}
        onChange={(e) => cambiar(e.target.value)} />
    </Campo>
  )

  return (
    <PantallaAuth
      titulo="Crear cuenta"
      subtitulo="Sumate para reportar, confirmar y seguir lo que pasa en tu barrio."
      pie={<p>¿Ya tenés cuenta? <Link to="/login">Ingresá</Link></p>}
    >
      <form onSubmit={enviar} noValidate>
        <div className="auth__fila">
          {campoTexto('nombre', 'Nombre', nombre, setNombre, 'given-name')}
          {campoTexto('apellido', 'Apellido', apellido, setApellido, 'family-name')}
        </div>
        <Campo id="registro-email" etiqueta="Email" error={errores.email}>
          <input id="registro-email" className="input" type="email" inputMode="email" autoComplete="email" maxLength={191} value={email}
            aria-invalid={!!errores.email} aria-describedby={errores.email ? 'registro-email-error' : undefined}
            onChange={(e) => { setEmail(e.target.value); setEmailRepetido(false) }} />
        </Campo>
        <CampoClave id="registro-password" etiqueta="Contraseña" valor={password} onCambiar={setPassword} autoComplete="new-password"
          error={errores.password} ayuda={password.length >= 8 ? '✓ Cumple el mínimo de 8 caracteres.' : 'Mínimo 8 caracteres.'} />
        <CampoClave id="registro-confirmacion" etiqueta="Repetí la contraseña" valor={confirmacion} onCambiar={setConfirmacion}
          autoComplete="new-password" error={errores.confirmacion} />

        <div className="campo">
          <label className="check">
            <input id="registro-terminos" type="checkbox" checked={terminos} onChange={(e) => setTerminos(e.target.checked)}
              aria-invalid={!!errores.terminos} aria-describedby={errores.terminos ? 'registro-terminos-error' : undefined} />
            <span>Acepto que mi nombre y mis reportes sean visibles para los vecinos de mis grupos, y me comprometo a usar la app de forma responsable.</span>
          </label>
          {errores.terminos && <p id="registro-terminos-error" className="campo__error" role="alert">{errores.terminos}</p>}
        </div>

        {emailRepetido && (
          <p className="campo__error" role="alert">Ya existe una cuenta con ese email. <Link to="/login">Ingresá</Link> con tu contraseña.</p>
        )}
        {error && <p className="campo__error" role="alert">{error}</p>}
        <button className="btn btn-primary btn-ancho" type="submit" disabled={enviando}>{enviando ? 'Creando la cuenta…' : 'Crear cuenta'}</button>
      </form>
    </PantallaAuth>
  )
}
