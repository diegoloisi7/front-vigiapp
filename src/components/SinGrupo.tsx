import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { api } from '../api'
import { mensajeDeError } from '../api/cliente'
import { useAuth } from '../context/AuthContext'
import { useGrupos } from '../context/GruposContext'
import { tiempoRelativo } from '../utils/formato'
import type { Familia } from '../utils/familias'
import type { InvitacionGrupo } from '../types'
import CrearGrupoModal from './CrearGrupoModal'
import Icono, { type NombreIcono } from './vecino/Icono'
import Indicador from './vecino/Indicador'
import TelefonosUtiles from './vecino/TelefonosUtiles'

// Qué sección pidió el vecino (para el aviso compacto de las pantallas que necesitan grupo)
const SECCIONES: [string, string][] = [
  ['/app/incidentes', 'los incidentes'],
  ['/app/incidencias', 'este incidente'],
  ['/app/reportar', 'reportar'],
  ['/app/alertas', 'las alertas y los avisos'],
]

const PASOS: { familia: Familia; icono: NombreIcono; titulo: string; texto: string }[] = [
  { familia: 'servicios', icono: 'farol', titulo: 'Reportá lo que pasa', texto: 'Una luz quemada, un bache o basura: marcás el lugar en el mapa y tus vecinos lo ven al instante.' },
  { familia: 'emergencia', icono: 'sos', titulo: 'Pedí ayuda en segundos', texto: 'Mantenés presionado 3 segundos y todo tu grupo recibe tu ubicación.' },
  { familia: 'comunidad', icono: 'comunidad', titulo: 'Enterate de los avisos', texto: 'Cortes de agua, reuniones o mascotas perdidas, todo en un solo lugar.' },
]

const plural = (n: number) => (n === 1 ? '1 invitación' : `${n} invitaciones`)

// Pantalla del vecino que todavía no pertenece a ningún grupo.
// En el Inicio es una bienvenida completa; en las demás secciones, un aviso compacto.
export default function SinGrupo() {
  const { usuario } = useAuth()
  const { invitaciones, grupoActivo, recargar, cambiarGrupoActivo } = useGrupos()
  const { pathname } = useLocation()
  const [crearAbierto, setCrearAbierto] = useState(false)
  const [respondiendo, setRespondiendo] = useState<number | null>(null)
  const [errorInvitacion, setErrorInvitacion] = useState('')
  const esInicio = pathname === '/app' || pathname === '/app/'
  const seccion = SECCIONES.find(([ruta]) => pathname.startsWith(ruta))?.[1] ?? 'esta sección'

  // Misma lógica que "Mis grupos": responde y, si es el primer grupo, lo deja como activo
  async function responder(invitacion: InvitacionGrupo, aceptar: boolean) {
    setRespondiendo(invitacion.id)
    setErrorInvitacion('')
    try {
      const grupo = await api.invitaciones.responder(invitacion.id, aceptar)
      await recargar()
      if (grupo && !grupoActivo) cambiarGrupoActivo(grupo.id)
    } catch (e) {
      setErrorInvitacion(mensajeDeError(e))
    } finally {
      setRespondiendo(null)
    }
  }

  const modal = <CrearGrupoModal abierto={crearAbierto} onCerrar={() => setCrearAbierto(false)} />

  const listaInvitaciones = invitaciones.length > 0 && (
    <section className="vg-panel vg-singrupo__invitaciones" id="invitaciones" aria-labelledby="t-sg-invitaciones">
      <div className="vg-panel__cabecera"><h2 id="t-sg-invitaciones">Te invitaron</h2></div>
      <div className="vg-singrupo__lista">
        {invitaciones.map((inv) => (
          <article key={inv.id} className="alerta-card">
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
  )

  if (!esInicio) {
    return (
      <div className="vg-singrupo vg-singrupo--compacto">
        <section className="vg-panel vg-singrupo__aviso" aria-labelledby="t-sg-aviso">
          <Indicador familia="comunidad" icono="grupos" tamano={30} className="vg-singrupo__indicador" />
          <div>
            <h2 id="t-sg-aviso">Para ver {seccion} necesitás un grupo</h2>
            <p>Creá el grupo de tu cuadra o aceptá la invitación de un vecino. Es lo que define qué incidentes y avisos ves.</p>
            <div className="vg-acciones">
              <button type="button" className="vg-btn vg-btn--senda" onClick={() => setCrearAbierto(true)}><Icono nombre="mas" />Crear tu grupo</button>
              <Link to="/app" className="btn btn-outline">Ir al inicio</Link>
            </div>
          </div>
        </section>
        {listaInvitaciones}
        {modal}
      </div>
    )
  }

  return (
    <div className="vg-singrupo">
      <section className="vg-hero" aria-labelledby="sg-titulo">
        <div className="vg-hero__inner">
          <div className="vg-hero__texto">
            <p className="vg-hero__saludo">Hola, {usuario?.nombre}</p>
            <h1 id="sg-titulo" className="vg-hero__titulo">Sumate a tu barrio</h1>
            <p className="vg-singrupo__lead">Todavía no estás en un grupo vecinal. Creá el de tu cuadra o aceptá la invitación de un vecino para empezar.</p>
            <div className="vg-hero__acciones">
              <button type="button" className="vg-btn vg-btn--senda vg-btn--grande" onClick={() => setCrearAbierto(true)}><Icono nombre="mas" />Crear tu grupo</button>
              {invitaciones.length > 0 && (
                <a href="#invitaciones" className="vg-btn vg-btn--contorno-blanco vg-btn--grande"><Icono nombre="sobre" />Ver {plural(invitaciones.length)}</a>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="vg-inicio__cuerpo">
        <div className="vg-inicio__principal">
          {listaInvitaciones}
          <section className="vg-panel vg-pasos" aria-labelledby="t-pasos">
            <div className="vg-panel__cabecera"><h2 id="t-pasos">Qué vas a poder hacer</h2></div>
            <ol className="vg-pasos__lista">
              {PASOS.map((p) => (
                <li key={p.titulo}>
                  <Indicador familia={p.familia} icono={p.icono} tamano={30} />
                  <div>
                    <h3>{p.titulo}</h3>
                    <p>{p.texto}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="vg-inicio__lateral" aria-label="Crear un grupo">
          <section className="vg-panel vg-crear-grupo" aria-labelledby="t-crear-grupo">
            <div className="vg-panel__cabecera"><h2 id="t-crear-grupo">Crear tu grupo</h2></div>
            <ol className="vg-mini-pasos">
              <li>Marcás el centro de tu barrio en el mapa.</li>
              <li>Elegís el radio, por ejemplo unas 5 cuadras.</li>
              <li>Invitás a tus vecinos por email.</li>
            </ol>
            <button type="button" className="vg-btn vg-btn--farol" onClick={() => setCrearAbierto(true)}>Crear grupo</button>
          </section>
          <TelefonosUtiles />
        </aside>
      </div>
      {modal}
    </div>
  )
}
