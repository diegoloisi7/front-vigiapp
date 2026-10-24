import type { MouseEvent } from 'react'
import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import Logo from '../components/Logo'
import RoleSwitcher from '../components/RoleSwitcher'
import ToggleTema from '../components/ToggleTema'

// Scroll suave a una sección (respeta "reducir movimiento")
function irASeccion(hash: string) {
  const destino = document.querySelector(hash)
  if (!destino) return
  const reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  destino.scrollIntoView({ behavior: reducir ? 'auto' : 'smooth' })
}

// Layout del visitante: header con menú, contenido y footer.
export default function PublicLayout() {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const { pathname, hash } = useLocation()

  // Al cambiar de ruta: cierra el menú y va a la sección del hash (o arriba de todo)
  useEffect(() => {
    setMenuAbierto(false)
    if (hash) irASeccion(hash)
    else window.scrollTo(0, 0)
  }, [pathname, hash])

  // Con el menú abierto, Escape lo cierra
  useEffect(() => {
    if (!menuAbierto) return
    const alTeclear = (e: KeyboardEvent) => e.key === 'Escape' && setMenuAbierto(false)
    document.addEventListener('keydown', alTeclear)
    return () => document.removeEventListener('keydown', alTeclear)
  }, [menuAbierto])

  // Si ya estamos en la landing, "Nosotros" solo hace scroll
  function alClickNosotros(e: MouseEvent<HTMLAnchorElement>) {
    setMenuAbierto(false)
    if (pathname === '/') {
      e.preventDefault()
      irASeccion('#nosotros')
    }
  }

  const claseLink = ({ isActive }: { isActive: boolean }) => (isActive ? 'is-active' : '')

  // Mismos ítems para el menú de escritorio y el panel del celular
  const enlaces = (
    <ul className="public-links">
      <li><NavLink to="/" end className={claseLink}>Inicio</NavLink></li>
      <li><Link to="/#nosotros" onClick={alClickNosotros}>Nosotros</Link></li>
      <li><NavLink to="/contacto" className={claseLink}>Contacto</NavLink></li>
      <li><NavLink to="/login" className={claseLink}>Ingresar</NavLink></li>
      <li><Link to="/registro" className="btn btn-primary">Registrarse</Link></li>
    </ul>
  )

  return (
    <div className="public-shell">
      <a className="skip-link" href="#contenido">Saltar al contenido</a>

      <header className="public-header">
        <div className="container public-header__bar">
          <Link to="/" className="brand">
            <Logo />
            <span>VigiApp</span>
          </Link>

          <nav className="public-nav" aria-label="Navegación principal">{enlaces}</nav>

          <div className="public-header__tools">
            <ToggleTema />
            <button
              type="button"
              className="menu-toggle"
              aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={menuAbierto}
              aria-controls="menu-celular"
              onClick={() => setMenuAbierto(!menuAbierto)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                {menuAbierto
                  ? <path d="M6 6l12 12M18 6 6 18" />
                  : <path d="M4 7h16M4 12h16M4 17h16" />}
              </svg>
            </button>
          </div>
        </div>

        {menuAbierto && (
          <nav id="menu-celular" className="public-menu-panel" aria-label="Menú">{enlaces}</nav>
        )}
      </header>

      <main id="contenido" className="public-main">
        <Outlet />
      </main>

      <footer className="public-footer">
        <div className="container public-footer__inner">
          <div>
            <Link to="/" className="brand"><Logo /><span>VigiApp</span></Link>
            <p className="public-footer__note">Proyecto universitario — Programación 4</p>
          </div>
          <ul className="public-footer__links">
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/contacto">Contacto</Link></li>
            <li><Link to="/login">Ingresar</Link></li>
            <li><Link to="/registro">Registrarse</Link></li>
          </ul>
        </div>
      </footer>

      <RoleSwitcher />
    </div>
  )
}
