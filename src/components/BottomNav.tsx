import { NavLink, useLocation } from 'react-router-dom'
import { NAV_VECINO, itemActivo } from '../data/navItems'

// Barra inferior fija (solo celular). El botón central "Reportar" es circular y elevado.
export default function BottomNav() {
  const { pathname } = useLocation()

  return (
    <nav className="bottom-nav" aria-label="Navegación principal">
      <ul className="bottom-nav__list">
        {NAV_VECINO.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                [
                  'bottom-nav__item',
                  item.destacado ? 'bottom-nav__item--report' : '',
                  itemActivo(item, isActive, pathname) ? 'is-active' : '',
                ].join(' ')
              }
            >
              {item.destacado ? (
                <span className="bottom-nav__report-circle">
                  <span className="bottom-nav__icon" aria-hidden="true">{item.icono}</span>
                </span>
              ) : (
                <span className="bottom-nav__icon" aria-hidden="true">{item.icono}</span>
              )}
              <span>{item.texto}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
