import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../../api'
import { mensajeDeError } from '../../api/cliente'
import { useGrupos } from '../../context/GruposContext'
import { useConsulta } from '../../hooks/useConsulta'
import Badge from '../../components/Badge'
import Campo from '../../components/Campo'
import EmptyState from '../../components/EmptyState'
import EstadoConsulta from '../../components/EstadoConsulta'
import { tiempoRelativo } from '../../utils/formato'

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Detalle de un grupo: miembros y, si sos owner, las invitaciones (enviar, ver estado y cancelar).
export default function DetalleGrupo() {
  const { id } = useParams()
  const { grupoActivo, cambiarGrupoActivo, recargar: recargarGrupos } = useGrupos()
  const { datos: grupo, cargando, error, recargar } = useConsulta(() => api.grupos.obtener(Number(id)), [id])

  const [email, setEmail] = useState('')
  const [errorEmail, setErrorEmail] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviada, setEnviada] = useState('')
  const [cancelando, setCancelando] = useState<number | null>(null)
  const [errorAccion, setErrorAccion] = useState('')

  async function invitar(e: FormEvent) {
    e.preventDefault()
    setEnviada('')
    setErrorAccion('')
    if (!EMAIL_VALIDO.test(email.trim())) {
      setErrorEmail('Escribí un email válido, por ejemplo vecino@correo.com.')
      document.getElementById('invitar-email')?.focus()
      return
    }
    setErrorEmail('')
    setEnviando(true)
    try {
      await api.grupos.invitar(Number(id), email)
      setEnviada(email.trim())
      setEmail('')
      recargar()
    } catch (err) {
      setErrorAccion(mensajeDeError(err))
    } finally {
      setEnviando(false)
    }
  }

  async function cancelar(invitacionId: number) {
    setCancelando(invitacionId)
    setErrorAccion('')
    try {
      await api.grupos.cancelarInvitacion(Number(id), invitacionId)
      recargar()
    } catch (err) {
      setErrorAccion(mensajeDeError(err))
    } finally {
      setCancelando(null)
    }
  }

  if (cargando || error) {
    return <EstadoConsulta cargando={cargando} error={error} onReintentar={recargar}>{null}</EstadoConsulta>
  }
  if (!grupo) {
    return (
      <EmptyState icono="🧭" titulo="No encontramos ese grupo" texto="Puede que se haya eliminado o que el enlace sea incorrecto.">
        <Link to="/app/grupos" className="btn btn-primary">Volver a mis grupos</Link>
      </EmptyState>
    )
  }

  const esOwner = grupo.miRol === 'OWNER'
  const esActivo = grupo.id === grupoActivo?.id

  return (
    <>
      <Link to="/app/grupos" className="volver">← Mis grupos</Link>

      <div className="grupo-card__head">
        <h2>{grupo.nombre}</h2>
        <Badge tipo={grupo.miRol} />
        {esActivo && <Badge tipo="ACTIVO" />}
      </div>
      <p className="grupo-card__meta">{grupo.zona} · Owner: {grupo.ownerNombre}</p>
      {!esActivo && (
        <button type="button" className="btn btn-outline" onClick={() => { cambiarGrupoActivo(grupo.id); void recargarGrupos() }}>
          Usar este grupo
        </button>
      )}

      <section className="bloque bloque--separado" aria-labelledby="t-miembros">
        <div className="bloque__head"><h2 id="t-miembros">Miembros ({grupo.miembros.length})</h2></div>
        <ul className="miembros">
          {grupo.miembros.map((m) => (
            <li key={m.usuarioId} className="miembro">
              <span className="miembro__avatar" aria-hidden="true">{m.nombre[0]}{m.apellido[0]}</span>
              <span className="miembro__nombre">{m.nombre} {m.apellido}</span>
              <Badge tipo={m.rol} />
            </li>
          ))}
        </ul>
      </section>

      {esOwner ? (
        <section className="bloque" aria-labelledby="t-invitar">
          <div className="bloque__head"><h2 id="t-invitar">Invitar vecinos</h2></div>
          <form className="invitar" onSubmit={invitar} noValidate>
            <Campo id="invitar-email" etiqueta="Email del vecino" error={errorEmail}>
              <input id="invitar-email" className="input" type="email" inputMode="email" autoComplete="off" value={email}
                aria-invalid={!!errorEmail} aria-describedby={errorEmail ? 'invitar-email-error' : undefined}
                placeholder="vecino@correo.com" onChange={(e) => setEmail(e.target.value)} />
            </Campo>
            <button type="submit" className="btn btn-primary" disabled={enviando}>{enviando ? 'Enviando…' : 'Enviar invitación'}</button>
          </form>
          {enviada && <p role="status" className="detalle__meta">Invitación enviada a {enviada}.</p>}
          {errorAccion && <p className="campo__error" role="alert">{errorAccion}</p>}

          <h3 className="subtitulo">Invitaciones enviadas</h3>
          {grupo.invitaciones.length === 0 ? (
            <p className="detalle__meta">Todavía no enviaste invitaciones.</p>
          ) : (
            <ul className="lista-invitaciones">
              {grupo.invitaciones.map((inv) => (
                <li key={inv.id} className="fila-invitacion">
                  <span>
                    <strong>{inv.email}</strong>
                    <span className="detalle__meta"> · {tiempoRelativo(inv.creada)}</span>
                  </span>
                  <span className="fila-invitacion__estado">
                    <Badge tipo={inv.estado} />
                    {inv.estado === 'PENDIENTE' && (
                      <button type="button" className="btn btn-ghost" disabled={cancelando === inv.id} onClick={() => cancelar(inv.id)}>
                        {cancelando === inv.id ? 'Cancelando…' : 'Cancelar'}
                      </button>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <p className="detalle__meta">Solo el owner del grupo puede invitar vecinos.</p>
      )}
    </>
  )
}
