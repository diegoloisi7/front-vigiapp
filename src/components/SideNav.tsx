import { Link, NavLink, useLocation } from 'react-router-dom'
import Logo from './Logo'
import { NAV_VECINO, itemActivo } from '../data/navItems'

// Menú lateral fijo del vecino (tablet y escritorio). Las secciones van arriba y "Reportar" queda al final.
export default function SideNav() {
  const { pathname } = useLocation()
  const secciones = NAV_VECINO.filter((item) => !item.destacado)
  const reportar = NAV_VECINO.find((item) => item.destacado)

  return (
    <nav className="sidenav" aria-label="Navegación principal">
      <Link to="/app" className="brand">
        <Logo />
        <span>Vecinal</span>
      </Link>

      <ul className="sidenav__list">
        {secciones.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) => `sidenav__link ${itemActivo(item, isActive, pathname) ? 'is-active' : ''}`}
            >
              <span aria-hidden="true">{item.icono}</span>
              <span>{item.texto}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      {reportar && (
        <NavLink
          to={reportar.to}
          className={({ isActive }) => `sidenav__link sidenav__link--cta sidenav__cta-final ${isActive ? 'is-active' : ''}`}
        >
          <span aria-hidden="true">{reportar.icono}</span>
          <span>{reportar.texto}</span>
        </NavLink>
      )}
    </nav>
  )
}
