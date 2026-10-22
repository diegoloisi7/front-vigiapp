import { Link, NavLink, useLocation } from 'react-router-dom'
import Logo from './Logo'
import { useAuth } from '../context/AuthContext'
import { NAV_VECINO, NAV_ADMIN, itemActivo } from '../data/navItems'

// Menú lateral fijo (tablet y escritorio). Las secciones van arriba y "Reportar" queda al final del menú.
export default function SideNav() {
  const { esAdmin } = useAuth()
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

      {/* Bloque extra solo para el administrador */}
      {esAdmin && (
        <div>
          <p className="sidenav__group-title" id="grupo-admin">Administración</p>
          <ul className="sidenav__list" aria-labelledby="grupo-admin">
            {NAV_ADMIN.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `sidenav__link ${isActive ? 'is-active' : ''}`}
                >
                  {item.texto}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}

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
