import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api'
import { useAuth } from '../../context/AuthContext'
import { useConsulta } from '../../hooks/useConsulta'
import Card from '../../components/Card'
import EstadoConsulta from '../../components/EstadoConsulta'
import { ESTADOS } from '../../data/mock'
import type { EstadoIncidencia } from '../../types'

const COLOR_ESTADO: Record<EstadoIncidencia, string> = {
  REPORTADO: 'var(--color-incident)',
  EN_SEGUIMIENTO: 'var(--color-primary)',
  RESUELTO: 'var(--color-success)',
  DESCARTADO: 'var(--color-border-strong)',
  EXPIRADO: 'var(--color-border-strong)',
}

// Una barra horizontal: la etiqueta y el valor están en texto, la barra es solo apoyo visual
function Barra({ etiqueta, valor, maximo, color }: { etiqueta: string; valor: number; maximo: number; color?: string }) {
  return (
    <li className="barra">
      <span className="barra__etiqueta">{etiqueta}</span>
      <span className="barra__pista" aria-hidden="true">
        <span className="barra__relleno" style={{ width: `${(valor / maximo) * 100}%`, ...(color ? { '--barra': color } : {}) } as CSSProperties} />
      </span>
      <strong className="barra__valor">{valor}</strong>
    </li>
  )
}

// Dashboard del administrador global: números generales de toda la plataforma.
export default function AdminDashboard() {
  const { usuario } = useAuth()
  const { datos: e, cargando, error, recargar } = useConsulta(() => api.admin.estadisticas(), [])

  return (
    <EstadoConsulta cargando={cargando} error={error} onReintentar={recargar}>
      {e && (
        <>
          <p className="saludo">Hola, {usuario?.nombre}. Este es el resumen general de la plataforma.</p>

          <section className="stats" aria-label="Totales">
            <Link to="/admin/grupos" className="stat-card card">
              <span className="stat-card__valor">{e.totalGrupos}</span>
              <span className="stat-card__etiqueta">Grupos vecinales</span>
            </Link>
            <Link to="/admin/usuarios" className="stat-card card">
              <span className="stat-card__valor">{e.totalVecinos}</span>
              <span className="stat-card__etiqueta">Vecinos totales · {e.usuariosNuevos30d} nuevos en 30 días</span>
            </Link>
            <Link to="/admin/incidencias" className="stat-card card">
              <span className="stat-card__valor">{e.incidentesPorEstado.REPORTADO + e.incidentesPorEstado.EN_SEGUIMIENTO}</span>
              <span className="stat-card__etiqueta">Incidentes activos</span>
            </Link>
            <Link to="/admin/incidencias" className="stat-card card">
              <span className="stat-card__valor">{e.urgentesActivos}</span>
              <span className="stat-card__etiqueta">Alertas urgentes activas</span>
            </Link>
            <Link to="/admin/avisos" className="stat-card card">
              <span className="stat-card__valor">{e.avisosVigentes}</span>
              <span className="stat-card__etiqueta">Avisos vigentes</span>
            </Link>
            <Link to="/admin/contactos" className="stat-card card">
              <span className="stat-card__valor">{e.contactosSinLeer}</span>
              <span className="stat-card__etiqueta">Contactos sin leer</span>
            </Link>
          </section>

          <div className="paneles">
            <Card as="section" aria-labelledby="g-estados">
              <h2 id="g-estados">Incidentes por estado</h2>
              <ul className="barras">
                {(Object.keys(ESTADOS) as EstadoIncidencia[]).map((estado) => (
                  <Barra key={estado} etiqueta={ESTADOS[estado]} valor={e.incidentesPorEstado[estado]}
                    maximo={Math.max(1, ...Object.values(e.incidentesPorEstado))} color={COLOR_ESTADO[estado]} />
                ))}
              </ul>
            </Card>

            <Card as="section" aria-labelledby="g-dias">
              <h2 id="g-dias">Incidentes de los últimos 7 días</h2>
              <ol className="columnas">
                {e.ultimos7dias.map((d, i) => {
                  const maximo = Math.max(1, ...e.ultimos7dias.map((x) => x.cantidad))
                  return (
                    <li key={i} className="columna">
                      <strong className="columna__valor">{d.cantidad}</strong>
                      <span className="columna__barra" aria-hidden="true" style={{ height: `${(d.cantidad / maximo) * 100}%` }} />
                      <span className="columna__dia">{d.etiqueta}</span>
                    </li>
                  )
                })}
              </ol>
            </Card>

            <Card as="section" aria-labelledby="g-categorias">
              <h2 id="g-categorias">Incidentes por categoría</h2>
              <ul className="barras">
                {e.porCategoria.map((c) => (
                  <Barra key={c.categoriaId || 'sin'} etiqueta={`${c.icono} ${c.nombre}`} valor={c.cantidad}
                    maximo={Math.max(1, ...e.porCategoria.map((x) => x.cantidad))} />
                ))}
              </ul>
            </Card>

            <Card as="section" aria-labelledby="g-grupos">
              <h2 id="g-grupos">Grupos con más actividad</h2>
              <ul className="barras">
                {e.topGrupos.map((g) => (
                  <Barra key={g.grupoId} etiqueta={`${g.nombre} (${g.vecinos} vecinos)`} valor={g.incidentes}
                    maximo={Math.max(1, ...e.topGrupos.map((x) => x.incidentes))} />
                ))}
              </ul>
            </Card>
          </div>
        </>
      )}
    </EstadoConsulta>
  )
}
