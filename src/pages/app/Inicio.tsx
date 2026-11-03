import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api'
import { useAuth } from '../../context/AuthContext'
import { useCategorias } from '../../context/CategoriasContext'
import { useGrupos } from '../../context/GruposContext'
import { useConsulta } from '../../hooks/useConsulta'
import EstadoConsulta from '../../components/EstadoConsulta'
import IncidentMap from '../../components/IncidentMap'
import PedirAyudaModal from '../../components/PedirAyudaModal'
import Icono from '../../components/vecino/Icono'
import NumeroAnimado from '../../components/vecino/NumeroAnimado'
import { usePinVecino } from '../../components/vecino/usePinVecino'
import FilaIncidente from '../../components/vecino/FilaIncidente'
import TelefonosUtiles from '../../components/vecino/TelefonosUtiles'
import { CENTRO_MAPA } from '../../data/mock'
import { FAMILIAS, ORDEN_FAMILIAS, familiaDeIncidencia, type Familia } from '../../utils/familias'
import { tiempoRelativo } from '../../utils/formato'
import { esAbierto, esUrgenteActivo } from '../../utils/permisos'
import { textoCuadras, textoRadio } from '../../utils/zona'
import type { Aviso, Incidencia } from '../../types'

const SEMANA = 7 * 24 * 60 * 60 * 1000

// Última vez que cambió un incidente (para contar los resueltos de la semana)
const ultimoCambio = (i: Incidencia) =>
  Math.max(new Date(i.creada).getTime(), ...i.historial.map((h) => new Date(h.cuando).getTime()))

const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`

// Inicio del vecino. Prioridad: estado del barrio y pedidos de ayuda → mapa y lo último → info del grupo.
export default function Inicio() {
  const { usuario } = useAuth()
  const { grupoActivo, invitaciones } = useGrupos()
  const { categoriaPorId } = useCategorias()
  const grupoId = grupoActivo?.id
  const [ayudaAbierta, setAyudaAbierta] = useState(false)
  const pinHtml = usePinVecino() // pin del mapa = mismo indicador que el tablero

  const { datos, cargando, error, recargar } = useConsulta(
    () => Promise.all([api.incidencias.listar(grupoId), api.avisos.listar(grupoId)]),
    [grupoId],
  )
  const [todas, todosAvisos] = datos ?? ([[], []] as [Incidencia[], Aviso[]])

  const abiertos = todas.filter(esAbierto)
  const urgentes = todas.filter(esUrgenteActivo)
  const resueltosSemana = todas.filter((i) => i.estado === 'RESUELTO' && ultimoCambio(i) >= Date.now() - SEMANA).length
  // Los pedidos de ayuda activos ya están arriba, en rojo: acá va el resto.
  // 1 destacado + 4 = filas completas en la grilla de 3 columnas (y en la de 2).
  const recientes = todas
    .filter((i) => i.estado !== 'DESCARTADO' && i.estado !== 'EXPIRADO' && !esUrgenteActivo(i))
    .sort((a, b) => new Date(b.creada).getTime() - new Date(a.creada).getTime())
    .slice(0, 5)
  const avisos = todosAvisos
    .filter((a) => a.estado === 'VIGENTE')
    .sort((a, b) => Number(b.prioridad === 'IMPORTANTE') - Number(a.prioridad === 'IMPORTANTE')
      || new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, 3)

  // Abiertos por familia, para la leyenda del mapa
  const porFamilia = abiertos.reduce<Record<Familia, number>>((acc, i) => {
    acc[familiaDeIncidencia(i, categoriaPorId(i.categoriaId))]++
    return acc
  }, { emergencia: 0, seguridad: 0, servicios: 0, comunidad: 0 })
  const enMapa = abiertos.filter((i) => i.lat != null && i.lng != null)

  const listo = !cargando && !error
  const estado = !listo
    ? { tono: 'cargando', texto: 'Revisando el estado del barrio…' }
    : urgentes.length > 0
      ? { tono: 'emergencia', texto: plural(urgentes.length, 'pedido de ayuda activo', 'pedidos de ayuda activos') }
      : abiertos.length > 0
        ? { tono: 'atencion', texto: plural(abiertos.length, 'incidente abierto', 'incidentes abiertos') }
        : { tono: 'tranquilo', texto: 'Todo tranquilo por ahora' }

  const cifras = [
    { valor: abiertos.length, texto: 'Abiertos' },
    { valor: urgentes.length, texto: 'Pedidos de ayuda', alerta: urgentes.length > 0 },
    { valor: resueltosSemana, texto: 'Resueltos en 7 días' },
  ]

  return (
    <div className="vg-inicio">
      {/* Estado del barrio */}
      <section className="vg-hero" aria-labelledby="inicio-titulo">
        <div className="vg-hero__inner">
          <div className="vg-hero__texto">
            <p className="vg-hero__saludo">Hola, {usuario?.nombre}</p>
            <h1 id="inicio-titulo" className="vg-hero__titulo">{grupoActivo?.nombre ?? 'Tu barrio'}</h1>
            {grupoActivo ? (
              <p className={`vg-hero__estado vg-hero__estado--${estado.tono}`} aria-live="polite">
                <span className="vg-hero__punto" aria-hidden="true" />{estado.texto}
              </p>
            ) : (
              <p className="vg-hero__estado">Todavía no estás en un grupo vecinal.</p>
            )}
            {grupoActivo && (
              <p className="vg-hero__zona">
                <span><Icono nombre="pin" tamano={18} />{grupoActivo.zona}</span>
                {grupoActivo.radioMetros != null && <span><Icono nombre="radio" tamano={18} />Radio de {textoRadio(grupoActivo.radioMetros)}</span>}
              </p>
            )}
            <div className="vg-hero__acciones">
              <Link to="/app/reportar" className="vg-btn vg-btn--senda vg-btn--grande"><Icono nombre="mas" />Reportar incidente</Link>
              <button type="button" className="vg-btn vg-btn--sos vg-btn--grande" onClick={() => setAyudaAbierta(true)}>
                <Icono nombre="sos" />Pedir ayuda
              </button>
            </div>
          </div>
          {grupoActivo && (
            <dl className="vg-hero__cifras">
              {cifras.map((c) => (
                <div key={c.texto} className={`vg-cifra${c.alerta ? ' vg-cifra--alerta' : ''}`}>
                  <dt>{c.texto}</dt>
                  <dd>{listo ? <NumeroAnimado valor={c.valor} /> : '–'}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>

      <div className="vg-inicio__cuerpo">
        <div className="vg-inicio__principal">
          {/* Pedidos de ayuda activos: lo primero que se ve */}
          {urgentes.length > 0 && (
            <section className="vg-sos" aria-labelledby="t-sos">
              {/* En celular es el encabezado del único contenedor rojo; en escritorio queda solo para lectores de pantalla */}
              <h2 id="t-sos" className="vg-sos__titulo">
                <Icono nombre="sos" tamano={22} />{plural(urgentes.length, 'pedido de ayuda activo', 'pedidos de ayuda activos')}
              </h2>
              <ul>
                {urgentes.map((u) => {
                  const esMio = u.autorId === usuario?.id
                  return (
                    <li key={u.id} className="vg-sos__item">
                      <span className="vg-sos__icono" aria-hidden="true"><Icono nombre="sos" tamano={26} /></span>
                      <div className="vg-sos__texto">
                        <h3>{esMio ? 'Tu pedido de ayuda está activo' : 'Un vecino pidió ayuda'}</h3>
                        <p>{u.ubicacion || 'Ubicación compartida'}, {tiempoRelativo(u.creada)}.<span className="vg-sos__consejo"> Si estás en peligro, llamá al 911.</span></p>
                      </div>
                      <div className="vg-sos__acciones">
                        <Link to={`/app/incidencias/${u.id}`} className="vg-btn vg-btn--blanco">{esMio ? 'Completar datos' : 'Ver detalle'}</Link>
                        <a href="tel:911" className="vg-btn vg-btn--contorno-blanco vg-sos__911-item"><Icono nombre="telefono" tamano={18} />911</a>
                      </div>
                    </li>
                  )
                })}
              </ul>
              {/* Celular: un solo 911 para todo el bloque, en lugar de uno por pedido */}
              <a href="tel:911" className="vg-btn vg-btn--blanco vg-sos__911-movil"><Icono nombre="telefono" tamano={18} />Si estás en peligro, llamá al 911</a>
            </section>
          )}

          {/* Mapa de la zona */}
          {grupoActivo ? (
            <section className="vg-panel vg-mapa" aria-labelledby="t-mapa">
              <div className="vg-panel__cabecera">
                <h2 id="t-mapa">Mapa de tu zona</h2>
                <Link to="/app/incidentes" className="vg-enlace">Abrir mapa completo<Icono nombre="flecha" tamano={18} /></Link>
              </div>
              <ul className="vg-leyenda" aria-label="Incidentes abiertos por tipo">
                {ORDEN_FAMILIAS.map((f) => (
                  <li key={f} className={`vg-chip vg-chip--${f}`}>
                    <Icono nombre={FAMILIAS[f].icono} tamano={16} />{FAMILIAS[f].nombre}<strong>{listo ? porFamilia[f] : '–'}</strong>
                  </li>
                ))}
              </ul>
              <IncidentMap incidencias={enMapa} centro={grupoActivo.centro ?? CENTRO_MAPA} radioMetros={grupoActivo.radioMetros}
                zoom={15} className="vg-mapa__lienzo" pinHtml={pinHtml} etiqueta={`Mapa de la zona de ${grupoActivo.nombre} con los incidentes abiertos`} />
            </section>
          ) : (
            <section className="vg-panel vg-sin-grupo" aria-labelledby="t-sin-grupo">
              <span className="vg-tile vg-tile--grande" aria-hidden="true"><Icono nombre="grupos" tamano={28} /></span>
              <h2 id="t-sin-grupo">Sumate a tu barrio</h2>
              <p>Creá un grupo para tu cuadra o aceptá una invitación para ver los incidentes y avisos de tus vecinos.</p>
              <Link to="/app/grupos" className="vg-btn vg-btn--farol">Ir a Mis grupos</Link>
            </section>
          )}

          {/* Lo último del barrio */}
          <section className="vg-recientes" aria-labelledby="t-recientes">
            <div className="vg-seccion__cabecera">
              <h2 id="t-recientes">Lo último en el barrio</h2>
              <Link to="/app/incidentes" className="vg-enlace">Ver todos<Icono nombre="flecha" tamano={18} /></Link>
            </div>
            <EstadoConsulta cargando={cargando} error={error} onReintentar={recargar}>
              {recientes.length > 0 ? (
                <ul className="vg-tablero">
                  {recientes.map((i, n) => <FilaIncidente key={i.id} incidencia={i} destacada={n === 0} />)}
                </ul>
              ) : (
                <div className="vg-vacio">
                  <Icono nombre="check" tamano={28} />
                  <p>No hay incidentes recientes en tu grupo. Si ves algo, reportalo y tus vecinos se van a enterar.</p>
                  <Link to="/app/reportar" className="vg-btn vg-btn--farol">Reportar incidente</Link>
                </div>
              )}
            </EstadoConsulta>
          </section>
        </div>

        <aside className="vg-inicio__lateral" aria-label="Información del barrio">
          {invitaciones.length > 0 && (
            <section className="vg-panel vg-invitacion" aria-labelledby="t-invitaciones">
              <span className="vg-invitacion__icono" aria-hidden="true"><Icono nombre="sobre" tamano={22} /></span>
              <div>
                <h2 id="t-invitaciones">{plural(invitaciones.length, 'invitación pendiente', 'invitaciones pendientes')}</h2>
                <p>Te invitaron a {invitaciones.map((inv) => inv.grupoNombre).join(', ')}.</p>
              </div>
              <Link to="/app/grupos" className="vg-btn vg-btn--farol">Ver y responder</Link>
            </section>
          )}

          <section className="vg-panel vg-avisos" aria-labelledby="t-avisos">
            <div className="vg-panel__cabecera">
              <h2 id="t-avisos"><span className="vg-tile vg-tile--comunidad" aria-hidden="true"><Icono nombre="comunidad" tamano={18} /></span>Avisos de la comunidad</h2>
            </div>
            {avisos.length > 0 ? (
              <ul className="vg-avisos__lista">
                {avisos.map((a) => (
                  <li key={a.id}>
                    <p className="vg-avisos__titulo">
                      {a.prioridad === 'IMPORTANTE' && <span className="vg-marca-importante">Importante</span>}
                      {a.titulo}
                    </p>
                    <p className="vg-avisos__meta">{a.autorNombre}, {tiempoRelativo(a.fecha)}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="vg-panel__vacio">{listo ? 'No hay avisos vigentes en tu grupo.' : 'Cargando avisos…'}</p>
            )}
            <Link to="/app/alertas" className="vg-enlace">Ver todos los avisos<Icono nombre="flecha" tamano={18} /></Link>
          </section>

          {grupoActivo && (
            <section className="vg-panel vg-grupo" aria-labelledby="t-grupo">
              <div className="vg-panel__cabecera"><h2 id="t-grupo">Tu grupo</h2></div>
              <dl className="vg-datos">
                <div><dt>Vecinos</dt><dd>{grupoActivo.cantidadVecinos}</dd></div>
                {grupoActivo.radioMetros != null && <div><dt>Radio</dt><dd>{textoRadio(grupoActivo.radioMetros)}</dd></div>}
              </dl>
              {grupoActivo.radioMetros != null && <p className="vg-grupo__nota">Cubre {textoCuadras(grupoActivo.radioMetros)}.</p>}
              <Link to={`/app/grupos/${grupoActivo.id}`} className="vg-enlace">Ver el grupo<Icono nombre="flecha" tamano={18} /></Link>
            </section>
          )}

          <TelefonosUtiles />
        </aside>
      </div>

      <PedirAyudaModal abierto={ayudaAbierta} onCerrar={() => setAyudaAbierta(false)} onEnviado={recargar} />
    </div>
  )
}
