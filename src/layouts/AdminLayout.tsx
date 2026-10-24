import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import RoleSwitcher from '../components/RoleSwitcher'
import { useAuth } from '../context/AuthContext'
import { NAV_ADMIN } from '../data/navItems'

// Front propio del administrador global: menú lateral en escritorio y pestañas deslizables en celular.
// No usa el menú del vecino porque el admin no pertenece a ningún grupo.
export default function AdminLayout() {
  const { usuario, cerrarSesion } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const actual = NAV_ADMIN.find((i) => (i.end ? pathname === i.to : pathname.startsWith(i.to)))

  function salir() {
    cerrarSesion()
    navigate('/')
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#contenido">Saltar al contenido</a>

      <nav className="sidenav" aria-label="Administración">
        <span className="brand">
          <Logo />
          <span>VigiApp · Admin</span>
        </span>
        <ul className="sidenav__list">
          {NAV_ADMIN.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} end={item.end} className={({ isActive }) => `sidenav__link ${isActive ? 'is-active' : ''}`}>
                <span aria-hidden="true">{item.icono}</span>
                <span>{item.texto}</span>
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="sidenav__usuario">
          <span>{usuario?.nombre} {usuario?.apellido}</span>
          <button type="button" className="btn btn-outline" onClick={salir}>Cerrar sesión</button>
        </div>
      </nav>

      <div className="app-body">
        <header className="app-topbar">
          <h1 className="app-topbar__title">{actual?.texto ?? 'Administración'}</h1>
          <button type="button" className="btn btn-ghost admin-salir" onClick={salir}>Salir</button>
        </header>

        <main id="contenido" className="app-main app-main--admin">
          <nav className="admin-tabs" aria-label="Secciones del panel">
            <ul className="admin-tabs__list">
              {NAV_ADMIN.map((item) => (
                <li key={item.to}>
                  <NavLink to={item.to} end={item.end} className={({ isActive }) => `admin-tabs__link ${isActive ? 'is-active' : ''}`}>
                    {item.texto}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <div className="app-content app-content--ancho">
            <Outlet />
          </div>
        </main>
      </div>

      <RoleSwitcher />
    </div>
  )
}
