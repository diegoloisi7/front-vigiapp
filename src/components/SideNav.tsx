import { Link, NavLink, useLocation } from 'react-router-dom'
import Logo from './Logo'
import { useAuth } from '../context/AuthContext'
import { NAV_VECINO, NAV_ADMIN, itemActivo } from '../data/navItems'

// Menú lateral fijo (tablet y escritorio). Mismas 5 secciones y mismo orden que la barra inferior.
export default function SideNav() {
  const { esAdmin } = useAuth()
  const { pathname } = useLocation()

  return (
    <nav className="sidenav" aria-label="Navegación principal">
      <Link to="/app" className="brand">
        <Logo />
        <span>Vecinal</span>
      </Link>

      <ul className="sidenav__list">
        {NAV_VECINO.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                [
                  'sidenav__link',
                  item.destacado ? 'sidenav__link--cta' : '',
                  itemActivo(item, isActive, pathname) ? 'is-active' : '',
                ].join(' ')
              }
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
    </nav>
  )
}
