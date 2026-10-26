import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useGrupos } from '../../context/GruposContext'
import Card from '../../components/Card'
import Campo from '../../components/Campo'
import Modal from '../../components/Modal'
import { pedir, mensajeDeError } from '../../api/cliente'
import { USAR_MOCK } from '../../api/config'

interface Claves {
  actual: string
  nueva: string
  repetir: string
}
type ErroresClaves = Partial<Record<keyof Claves, string>>

const CLAVES_VACIAS: Claves = { actual: '', nueva: '', repetir: '' }

export default function Perfil() {
  const { usuario, esAdmin, cerrarSesion } = useAuth()
  const { grupoActivo } = useGrupos()
  const navigate = useNavigate()
  const [claveAbierta, setClaveAbierta] = useState(false)
  const [claves, setClaves] = useState<Claves>(CLAVES_VACIAS)
  const [errores, setErrores] = useState<ErroresClaves>({})
  const [claveOk, setClaveOk] = useState(false)

  const iniciales = `${usuario?.nombre?.[0] ?? ''}${usuario?.apellido?.[0] ?? ''}`

  function abrirClave() { setClaves(CLAVES_VACIAS); setErrores({}); setClaveOk(false); setClaveAbierta(true) }

  async function guardarClave(e: FormEvent) {
    e.preventDefault()
    const nuevos: ErroresClaves = {}
    if (!claves.actual) nuevos.actual = 'Ingresá tu contraseña actual.'
    if (claves.nueva.length < 8) nuevos.nueva = 'La nueva contraseña debe tener al menos 8 caracteres.'
    if (claves.repetir !== claves.nueva) nuevos.repetir = 'Las contraseñas no coinciden.'
    setErrores(nuevos)
    const primero = Object.keys(nuevos)[0]
    if (primero) return document.getElementById(`clave-${primero}`)?.focus()
    try {
      if (!USAR_MOCK) await pedir('/auth/password', { metodo: 'PATCH', cuerpo: { currentPassword: claves.actual, newPassword: claves.nueva } })
      setClaveOk(true)
    } catch (cause) {
      setErrores({ actual: mensajeDeError(cause) })
    }
  }

  function salir() { cerrarSesion(); navigate('/') }

  const campoClave = (campo: keyof Claves, etiqueta: string, autoComplete: string) => (
    <Campo id={`clave-${campo}`} etiqueta={etiqueta} error={errores[campo]}>
      <input id={`clave-${campo}`} className="input" type="password" autoComplete={autoComplete}
        value={claves[campo]} aria-invalid={!!errores[campo]}
        aria-describedby={errores[campo] ? `clave-${campo}-error` : undefined}
        onChange={(e) => setClaves({ ...claves, [campo]: e.target.value })} />
    </Campo>
  )

  return (
    <>
      <div className="perfil-head">
        <span className="avatar" aria-hidden="true">{iniciales}</span>
        <div>
          <h2>{usuario?.nombre} {usuario?.apellido}</h2>
          <p>{esAdmin ? 'Administrador' : 'Vecino'}{grupoActivo ? ` · ${grupoActivo.nombre}` : ''}</p>
        </div>
      </div>

      <div className="perfil-grid">
        <Card as="section" aria-labelledby="p-datos">
          <h3 id="p-datos">Mis datos</h3>
          <dl className="datos">
            <dt>Nombre</dt><dd>{usuario?.nombre}</dd>
            <dt>Apellido</dt><dd>{usuario?.apellido}</dd>
            <dt>Email</dt><dd>{usuario?.email}</dd>
          </dl>
          <button type="button" className="btn btn-outline" onClick={abrirClave}>Cambiar contraseña</button>
        </Card>

        {!esAdmin && (
          <Card as="section" aria-labelledby="p-grupo">
            <h3 id="p-grupo">Mi grupo activo</h3>
            {grupoActivo ? (
              <dl className="datos">
                <dt>Nombre</dt><dd>{grupoActivo.nombre}</dd>
                <dt>Zona</dt><dd>{grupoActivo.zona}</dd>
                <dt>Vecinos</dt><dd>{grupoActivo.cantidadVecinos}</dd>
                <dt>Mi rol</dt><dd>{grupoActivo.miRol === 'OWNER' ? 'Owner' : 'Miembro'}</dd>
              </dl>
            ) : (
              <p>No tenés grupo aún.</p>
            )}
            <Link to="/app/grupos" className="btn btn-outline">Mis grupos</Link>
          </Card>
        )}
      </div>

      <nav className="lista-acciones" aria-label="Más opciones">
        {!esAdmin && <Link to="/app/grupos">🏘️ Mis grupos</Link>}
        <Link to="/contacto">✉️ Contacto</Link>
        <button type="button" onClick={salir}>↩︎ Cerrar sesión</button>
      </nav>

      <Modal abierto={claveAbierta} onCerrar={() => setClaveAbierta(false)} titulo="Cambiar contraseña">
        {claveOk ? (
          <div className="ayuda-ok" role="status">
            <span className="ayuda-ok__icon" aria-hidden="true">✅</span>
            <h3>Contraseña actualizada</h3>
            {USAR_MOCK && <p>Demostración con datos de ejemplo.</p>}
            <button type="button" className="btn btn-primary" onClick={() => setClaveAbierta(false)}>Listo</button>
          </div>
        ) : (
          <form onSubmit={guardarClave} noValidate>
            {campoClave('actual', 'Contraseña actual', 'current-password')}
            {campoClave('nueva', 'Nueva contraseña', 'new-password')}
            {campoClave('repetir', 'Repetir nueva contraseña', 'new-password')}
            <button type="submit" className="btn btn-primary btn-ancho">Guardar contraseña</button>
          </form>
        )}
      </Modal>
    </>
  )
}
