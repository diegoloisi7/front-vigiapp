import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useGrupos } from '../../context/GruposContext'
import CampanaNotificaciones from '../CampanaNotificaciones'
import SelectorGrupo from '../SelectorGrupo'
import ToggleTema from '../ToggleTema'
import Icono from './Icono'

const SECCIONES = [
  { to: '/app', texto: 'Inicio', end: true },
  { to: '/app/incidentes', texto: 'Incidentes', tambien: '/app/incidencias' },
  { to: '/app/alertas', texto: 'Alertas' },
  { to: '/app/grupos', texto: 'Mis grupos' },
]

// Barra superior del vecino. En escritorio: marca, secciones, grupo, tema, notificaciones,
// "Reportar" y avatar. En celular se compacta (las secciones pasan a la barra inferior).
export default function NavSuperior() {
  const { usuario } = useAuth()
  const { grupoActivo } = useGrupos()
  const { pathname } = useLocation()
  const iniciales = `${usuario?.nombre?.[0] ?? ''}${usuario?.apellido?.[0] ?? ''}`.toUpperCase() || 'V'

  return (
    <header className="vg-nav">
      <div className="vg-nav__inner">
        <Link to="/app" className="vg-marca" aria-label="VigiApp, ir al inicio">
          <span className="vg-marca__simbolo"><Icono nombre="pin" tamano={20} /></span>
          <span className="vg-marca__nombre">VigiApp</span>
        </Link>

        <nav className="vg-nav__secciones" aria-label="Secciones">
          <ul>
            {SECCIONES.map((s) => (
              <li key={s.to}>
                <NavLink to={s.to} end={s.end}
                  className={({ isActive }) => `vg-nav__link${isActive || (s.tambien && pathname.startsWith(s.tambien)) ? ' is-active' : ''}`}>
                  {s.texto}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="vg-nav__herramientas">
          <SelectorGrupo />
          <ToggleTema />
          <CampanaNotificaciones />
          {grupoActivo && <Link to="/app/reportar" className="vg-btn vg-btn--senda vg-nav__reportar"><Icono nombre="mas" />Reportar</Link>}
          <Link to="/app/perfil" className="vg-avatar" aria-label={`Tu perfil${usuario ? `, ${usuario.nombre}` : ''}`}>{iniciales}</Link>
        </div>
      </div>
    </header>
  )
}
