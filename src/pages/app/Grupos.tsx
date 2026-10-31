import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api'
import { mensajeDeError } from '../../api/cliente'
import { useGrupos } from '../../context/GruposContext'
import Badge from '../../components/Badge'
import Card from '../../components/Card'
import CrearGrupoModal from '../../components/CrearGrupoModal'
import EmptyState from '../../components/EmptyState'
import Icono from '../../components/vecino/Icono'
import EstadoConsulta from '../../components/EstadoConsulta'
import { tiempoRelativo } from '../../utils/formato'
import type { InvitacionGrupo } from '../../types'

// "Mis grupos": lista de grupos del vecino, sus invitaciones pendientes y el botón para crear uno.
export default function Grupos() {
  const { grupos, invitaciones, grupoActivo, cargando, error, recargar, cambiarGrupoActivo } = useGrupos()
  const [crearAbierto, setCrearAbierto] = useState(false)
  const [respondiendo, setRespondiendo] = useState<number | null>(null)
  const [errorInvitacion, setErrorInvitacion] = useState('')

  async function responder(invitacion: InvitacionGrupo, aceptar: boolean) {
    setRespondiendo(invitacion.id)
    setErrorInvitacion('')
    try {
      const grupo = await api.invitaciones.responder(invitacion.id, aceptar)
      await recargar()
      if (grupo && !grupoActivo) cambiarGrupoActivo(grupo.id) // su primer grupo pasa a ser el activo
    } catch (e) {
      setErrorInvitacion(mensajeDeError(e))
    } finally {
      setRespondiendo(null)
    }
  }

  return (
    <>
      <EstadoConsulta cargando={cargando} error={error} onReintentar={() => void recargar()}>
        {invitaciones.length > 0 && (
          <section className="bloque" aria-labelledby="t-invitaciones">
            <div className="bloque__head"><h2 id="t-invitaciones">Invitaciones ({invitaciones.length})</h2></div>
            <div className="stack-list">
              {invitaciones.map((inv) => (
                <article key={inv.id} className="alerta-card nivel-aviso">
                  <p className="alerta-card__tag"><Icono nombre="sobre" tamano={18} />Invitación, {tiempoRelativo(inv.creada)}</p>
                  <h3>{inv.grupoNombre}</h3>
                  <p>{inv.invitadoPor} te invitó a sumarte a este grupo vecinal.</p>
                  <div className="grupo-card__acciones">
                    <button type="button" className="btn btn-primary" disabled={respondiendo === inv.id} onClick={() => responder(inv, true)}>Aceptar</button>
                    <button type="button" className="btn btn-outline" disabled={respondiendo === inv.id} onClick={() => responder(inv, false)}>Rechazar</button>
                  </div>
                </article>
              ))}
            </div>
            {errorInvitacion && <p className="campo__error" role="alert">{errorInvitacion}</p>}
          </section>
        )}

        <section className="bloque" aria-labelledby="t-grupos">
          <div className="bloque__head">
            <h2 id="t-grupos">Mis grupos</h2>
            <button type="button" className="btn btn-primary" onClick={() => setCrearAbierto(true)}>Crear grupo</button>
          </div>

          {grupos.length === 0 ? (
            <EmptyState icono={<Icono nombre="grupos" tamano={36} />} titulo="No tenés grupo aún" texto="Creá tu grupo vecinal o aceptá una invitación para empezar.">
              <button type="button" className="btn btn-primary" onClick={() => setCrearAbierto(true)}>Crear grupo</button>
            </EmptyState>
          ) : (
            <div className="vg-grupos">
              {grupos.map((g) => {
                const esActivo = g.id === grupoActivo?.id
                return (
                  <Card as="article" key={g.id} className={`grupo-card${esActivo ? ' grupo-card--activo' : ''}`}>
                    <div className="grupo-card__head">
                      <span className="vg-indicador grupo-card__indicador" aria-hidden="true"><Icono nombre="grupos" tamano={24} /></span>
                      <h3>{g.nombre}</h3>
                      <Badge tipo={g.miRol} />
                      {esActivo && <Badge tipo="ACTIVO" />}
                    </div>
                    <ul className="vg-meta grupo-card__meta">
                      <li><Icono nombre="pin" tamano={16} />{g.zona}</li>
                      <li><Icono nombre="grupos" tamano={16} />{g.cantidadVecinos} {g.cantidadVecinos === 1 ? 'vecino' : 'vecinos'}</li>
                      <li><Icono nombre="perfil" tamano={16} />Owner: {g.ownerNombre}</li>
                    </ul>
                    <div className="grupo-card__acciones">
                      {!esActivo && <button type="button" className="btn btn-outline" onClick={() => cambiarGrupoActivo(g.id)}>Usar este grupo</button>}
                      <Link to={`/app/grupos/${g.id}`} className="btn btn-ghost">{g.miRol === 'OWNER' ? 'Gestionar' : 'Ver grupo'}</Link>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </section>
      </EstadoConsulta>

      <CrearGrupoModal abierto={crearAbierto} onCerrar={() => setCrearAbierto(false)} />
    </>
  )
}
