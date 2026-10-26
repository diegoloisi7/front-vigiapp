import { useMemo, useState, type FormEvent } from 'react'
import { api } from '../../api'
import { mensajeDeError } from '../../api/cliente'
import { useAuth } from '../../context/AuthContext'
import { useConsulta } from '../../hooks/useConsulta'
import Badge from '../../components/Badge'
import Campo from '../../components/Campo'
import ConfirmarModal from '../../components/ConfirmarModal'
import EmptyState from '../../components/EmptyState'
import EstadoConsulta from '../../components/EstadoConsulta'
import Modal from '../../components/Modal'
import TablaAdmin from '../../components/TablaAdmin'
import { normalizar, tiempoRelativo } from '../../utils/formato'
import type { UsuarioAdmin } from '../../types'

type Campos = 'nombre' | 'apellido' | 'email'

// Todos los usuarios: el admin puede editarlos, eliminarlos y blanquear su contraseña.
// Nunca ve ni define contraseñas: el usuario recibe un enlace para crear una nueva.
export default function AdminUsuarios() {
  const { usuario: yo } = useAuth()
  const { datos, cargando, error, recargar } = useConsulta(() => api.admin.usuarios.listar(), [])
  const [buscar, setBuscar] = useState('')
  const [rol, setRol] = useState('')
  const [editando, setEditando] = useState<UsuarioAdmin | null>(null)
  const [eliminando, setEliminando] = useState<UsuarioAdmin | null>(null)
  const [blanqueando, setBlanqueando] = useState<UsuarioAdmin | null>(null)
  const [mensaje, setMensaje] = useState('')

  const filas = useMemo(() => {
    const q = normalizar(buscar.trim())
    return (datos ?? []).filter((u) => (!rol || u.rol === rol) && normalizar(`${u.nombre} ${u.apellido} ${u.email}`).includes(q))
  }, [datos, buscar, rol])

  return (
    <>
      <div className="admin-filtros">
        <div className="campo">
          <label htmlFor="buscar-usuarios">Buscar usuario</label>
          <input id="buscar-usuarios" className="input" type="search" placeholder="Nombre o email" value={buscar} onChange={(e) => setBuscar(e.target.value)} />
        </div>
        <div className="campo">
          <label htmlFor="filtro-rol">Rol</label>
          <select id="filtro-rol" className="input" value={rol} onChange={(e) => setRol(e.target.value)}>
            <option value="">Todos</option>
            <option value="VECINO">Vecinos</option>
            <option value="ADMINISTRADOR">Administradores</option>
          </select>
        </div>
      </div>

      {mensaje && <p className="sugerencia-ok" role="status">{mensaje}</p>}

      <EstadoConsulta cargando={cargando} error={error} onReintentar={recargar}>
        <p className="detalle__meta" role="status">{filas.length} {filas.length === 1 ? 'usuario' : 'usuarios'}</p>
        <TablaAdmin<UsuarioAdmin>
          etiqueta="Usuarios"
          filas={filas}
          clave={(u) => u.id}
          vacio={<EmptyState icono="👥" titulo="No hay usuarios" texto="Probá con otra búsqueda o filtro." />}
          columnas={[
            { clave: 'usuario', titulo: 'Usuario', render: (u) => <><strong>{u.nombre} {u.apellido}</strong><small>{u.email}</small></> },
            { clave: 'rol', titulo: 'Rol', render: (u) => <Badge tipo={u.rol} /> },
            { clave: 'grupos', titulo: 'Grupos', render: (u) => u.cantidadGrupos },
            { clave: 'alta', titulo: 'Alta', render: (u) => tiempoRelativo(u.creado) },
          ]}
          acciones={(u) => (
            <>
              <button type="button" className="btn btn-outline" onClick={() => setEditando(u)}>Editar</button>
              <button type="button" className="btn btn-ghost" onClick={() => setBlanqueando(u)}>Blanquear contraseña</button>
              <button type="button" className="btn btn-ghost" disabled={u.id === yo?.id} onClick={() => setEliminando(u)}>Eliminar</button>
            </>
          )}
        />
      </EstadoConsulta>

      <Modal abierto={editando !== null} onCerrar={() => setEditando(null)} titulo="Editar usuario">
        {editando && <FormUsuario usuario={editando} esUnoMismo={editando.id === yo?.id} onCerrar={() => setEditando(null)} onGuardado={recargar} />}
      </Modal>

      <ConfirmarModal abierto={blanqueando !== null} titulo="Blanquear contraseña" textoBoton="Blanquear contraseña"
        onCerrar={() => setBlanqueando(null)}
        onConfirmar={async () => {
          await api.admin.usuarios.blanquearClave(blanqueando!.id)
          setMensaje(`Listo: ${blanqueando!.email} va a recibir un enlace para crear una contraseña nueva.`)
        }}>
        {blanqueando && (
          <p>
            Se envía un enlace a <strong>{blanqueando.email}</strong> para que <strong>{blanqueando.nombre} {blanqueando.apellido}</strong>
            {' '}cree una contraseña nueva. La actual sigue funcionando hasta que use el enlace. Vos no ves ni definís su contraseña.
          </p>
        )}
      </ConfirmarModal>

      <ConfirmarModal abierto={eliminando !== null} titulo="Eliminar usuario" textoBoton="Eliminar usuario"
        onCerrar={() => setEliminando(null)}
        onConfirmar={async () => { await api.admin.usuarios.eliminar(eliminando!.id); setMensaje(''); recargar() }}>
        {eliminando && (
          <p>
            Vas a eliminar a <strong>{eliminando.nombre} {eliminando.apellido}</strong> ({eliminando.email}). Sale de sus
            {' '}{eliminando.cantidadGrupos} {eliminando.cantidadGrupos === 1 ? 'grupo' : 'grupos'} y se eliminan sus incidentes y avisos.
            {' '}Si creó un grupo, primero hay que eliminarlo. No se puede deshacer.
          </p>
        )}
      </ConfirmarModal>
    </>
  )
}

function FormUsuario({ usuario, esUnoMismo, onCerrar, onGuardado }: { usuario: UsuarioAdmin; esUnoMismo: boolean; onCerrar: () => void; onGuardado: () => void }) {
  const [valores, setValores] = useState<Record<Campos, string>>({ nombre: usuario.nombre, apellido: usuario.apellido, email: usuario.email })
  const [rol, setRol] = useState(usuario.rol)
  const [errores, setErrores] = useState<Partial<Record<Campos, string>>>({})
  const [enviando, setEnviando] = useState(false)
  const [errorEnvio, setErrorEnvio] = useState('')

  async function guardar(e: FormEvent) {
    e.preventDefault()
    const nuevos: Partial<Record<Campos, string>> = {}
    if (!valores.nombre.trim()) nuevos.nombre = 'Escribí el nombre.'
    if (!valores.apellido.trim()) nuevos.apellido = 'Escribí el apellido.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valores.email.trim())) nuevos.email = 'Escribí un email válido.'
    setErrores(nuevos)
    const primero = Object.keys(nuevos)[0]
    if (primero) return document.getElementById(`admin-usuario-${primero}`)?.focus()
    setEnviando(true)
    setErrorEnvio('')
    try {
      await api.admin.usuarios.actualizar(usuario.id, { ...valores, rol })
      onGuardado()
      onCerrar()
    } catch (err) {
      setErrorEnvio(mensajeDeError(err))
      setEnviando(false)
    }
  }

  const campo = (clave: Campos, etiqueta: string, tipo = 'text') => (
    <Campo id={`admin-usuario-${clave}`} etiqueta={etiqueta} error={errores[clave]}>
      <input id={`admin-usuario-${clave}`} className="input" type={tipo} value={valores[clave]}
        aria-invalid={!!errores[clave]} aria-describedby={errores[clave] ? `admin-usuario-${clave}-error` : undefined}
        onChange={(e) => setValores({ ...valores, [clave]: e.target.value })} />
    </Campo>
  )

  return (
    <form onSubmit={guardar} noValidate>
      {campo('nombre', 'Nombre')}
      {campo('apellido', 'Apellido')}
      {campo('email', 'Email', 'email')}
      <Campo id="admin-usuario-rol" etiqueta="Rol" ayuda={esUnoMismo ? 'No podés cambiar tu propio rol.' : undefined}>
        <select id="admin-usuario-rol" className="input" value={rol} disabled={esUnoMismo}
          aria-describedby={esUnoMismo ? 'admin-usuario-rol-ayuda' : undefined}
          onChange={(e) => setRol(e.target.value as UsuarioAdmin['rol'])}>
          <option value="VECINO">Vecino</option>
          <option value="ADMINISTRADOR">Administrador</option>
        </select>
      </Campo>
      {errorEnvio && <p className="campo__error" role="alert">{errorEnvio}</p>}
      <button type="submit" className="btn btn-primary btn-ancho" disabled={enviando}>{enviando ? 'Guardando…' : 'Guardar cambios'}</button>
    </form>
  )
}
