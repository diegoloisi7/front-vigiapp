import { NavLink, Outlet } from 'react-router-dom'
import { NAV_ADMIN } from '../data/navItems'

// Submenú del panel de administración.
// En celular son pestañas deslizables; en escritorio se ocultan porque el menú lateral ya las tiene.
export default function AdminLayout() {
  return (
    <>
      <nav className="admin-tabs" aria-label="Panel de administración">
        <ul className="admin-tabs__list">
          {NAV_ADMIN.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) => `admin-tabs__link ${isActive ? 'is-active' : ''}`}
              >
                {item.texto}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <Outlet />
    </>
  )
}
