import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import RoleSwitcher from '../components/RoleSwitcher'
import ToggleTema from '../components/ToggleTema'
import Icono, { type NombreIcono } from '../components/vecino/Icono'
import { ModoVecinoContext } from '../components/vecino/modoVecino'
import { useAuth } from '../context/AuthContext'
import { NAV_ADMIN } from '../data/navItems'

const ICONOS: Record<string, NombreIcono> = {
  '/admin': 'grafico',
  '/admin/grupos': 'grupos',
  '/admin/usuarios': 'perfil',
  '/admin/incidencias': 'incidentes',
  '/admin/categorias': 'etiqueta',
  '/admin/avisos': 'comunidad',
  '/admin/contactos': 'sobre',
}

// Panel del administrador global, con la misma identidad que la vista del vecino:
// barra superior azul (escritorio) y tira de secciones deslizable (pantallas angostas).
// No usa el menú del vecino porque el admin no pertenece a ningún grupo.
export default function AdminLayout() {
  const { usuario, cerrarSesion } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const actual = NAV_ADMIN.find((i) => (i.end ? pathname === i.to : pathname.startsWith(i.to)))
  const iniciales = `${usuario?.nombre?.[0] ?? ''}${usuario?.apellido?.[0] ?? ''}`.toUpperCase() || 'A'

  function salir() {
    cerrarSesion()
    navigate('/')
  }

  const enlace = ({ isActive }: { isActive: boolean }) => `vg-nav__link${isActive ? ' is-active' : ''}`

  return (
    <ModoVecinoContext.Provider value={true}>
      <div className="vg-app vg-admin">
        <a className="skip-link" href="#contenido">Saltar al contenido</a>

        <header className="vg-nav">
          <div className="vg-nav__inner">
            <Link to="/admin" className="vg-marca" aria-label="VigiApp, panel de administración">
              <span className="vg-marca__simbolo"><Icono nombre="pin" tamano={20} /></span>
              <span className="vg-marca__nombre">VigiApp</span>
              <span className="vg-marca__admin">Admin</span>
            </Link>

            <nav className="vg-nav__secciones" aria-label="Administración">
              <ul>
                {NAV_ADMIN.map((item) => (
                  <li key={item.to}><NavLink to={item.to} end={item.end} className={enlace}>{item.texto}</NavLink></li>
                ))}
              </ul>
            </nav>

            <div className="vg-nav__herramientas">
              <ToggleTema />
              <span className="vg-avatar" title={`${usuario?.nombre ?? ''} ${usuario?.apellido ?? ''}`.trim()} aria-hidden="true">{iniciales}</span>
              <button type="button" className="vg-btn vg-btn--contorno-blanco vg-admin__salir" onClick={salir}>
                <Icono nombre="salir" tamano={18} />Salir
              </button>
            </div>
          </div>
        </header>

        {/* Pantallas angostas: las secciones en una tira que se desliza */}
        <nav className="vg-admin__tira" aria-label="Secciones del panel">
          <ul>
            {NAV_ADMIN.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.end} className={({ isActive }) => `vg-admin__tira-link${isActive ? ' is-active' : ''}`}>
                  <Icono nombre={ICONOS[item.to] ?? 'grafico'} tamano={18} />{item.texto}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <main id="contenido" className="vg-main">
          <div key={pathname} className="vg-transicion">
          <header className="vg-cabecera">
            <div className="vg-cabecera__inner">
              <p className="vg-cabecera__etiqueta">Panel de administración</p>
              <h1 className="vg-cabecera__titulo">{actual?.texto ?? 'Administración'}</h1>
            </div>
          </header>
          <div className="vg-pagina"><Outlet /></div>
          </div>
        </main>

        <RoleSwitcher />
      </div>
    </ModoVecinoContext.Provider>
  )
}
