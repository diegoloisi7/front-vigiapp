import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import MarcaVigiApp from '../components/marca/MarcaVigiApp'
import RoleSwitcher from '../components/RoleSwitcher'
import { useTema } from '../context/TemaContext'

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

  // Las páginas públicas se ven siempre en modo claro (no tienen interruptor de tema).
  // Al entrar a la app se restaura la preferencia del usuario.
  const { forzarTema } = useTema()
  useEffect(() => {
    forzarTema('claro')
    return () => forzarTema(null)
  }, [forzarTema])

  // Con el menú abierto, Escape lo cierra
  useEffect(() => {
    if (!menuAbierto) return
    const alTeclear = (e: KeyboardEvent) => e.key === 'Escape' && setMenuAbierto(false)
    document.addEventListener('keydown', alTeclear)
    return () => document.removeEventListener('keydown', alTeclear)
  }, [menuAbierto])

  const claseLink = ({ isActive }: { isActive: boolean }) => (isActive ? 'is-active' : '')

  // Mismos ítems para el menú de escritorio y el panel del celular
  const enlaces = (
    <ul className="public-links">
      <li><NavLink to="/" end className={claseLink}>Inicio</NavLink></li>
      <li><NavLink to="/nosotros" className={claseLink}>Nosotros</NavLink></li>
      <li><NavLink to="/contacto" className={claseLink}>Contacto</NavLink></li>
      <li><Link to="/login" className="btn btn-primary">Ingresar</Link></li>
    </ul>
  )

  return (
    <div className="public-shell">
      <a className="skip-link" href="#contenido">Saltar al contenido</a>

      <header className="public-header">
        <div className="container public-header__bar">
          <Link to="/" className="brand" aria-label="VigiApp, ir al inicio">
            <MarcaVigiApp variante="horizontal" tono="claro" decorativo className="marca-header" />
          </Link>

          <nav className="public-nav" aria-label="Navegación principal">{enlaces}</nav>

          <div className="public-header__tools">
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
          <div className="public-footer__marca">
            <Link to="/" className="brand" aria-label="VigiApp, ir al inicio">
              <MarcaVigiApp variante="vertical" tono="oscuro" decorativo className="marca-footer" />
            </Link>
            <p className="public-footer__texto">
              Reportá incidentes, mirá qué pasa cerca tuyo en el mapa y seguí cada problema hasta que se resuelve.
            </p>
            <Link to="/login" className="btn btn-light">Ingresar</Link>
          </div>

          <nav className="public-footer__col" aria-label="Secciones">
            <h2 className="public-footer__titulo">Explorar</h2>
            <ul className="public-footer__links">
              <li><Link to="/#como-funciona">Cómo funciona</Link></li>
              <li><Link to="/#funcionalidades">Funcionalidades</Link></li>
              <li><Link to="/contacto">Dónde estamos</Link></li>
              <li><Link to="/nosotros">Nosotros</Link></li>
            </ul>
          </nav>

          <nav className="public-footer__col" aria-label="Tu cuenta y ayuda">
            <h2 className="public-footer__titulo">Tu cuenta</h2>
            <ul className="public-footer__links">
              <li><Link to="/registro">Crear cuenta</Link></li>
              <li><Link to="/contacto">Contacto</Link></li>
            </ul>
            <p className="public-footer__emergencia">Si es una emergencia, llamá al <a href="tel:911">911</a>.</p>
          </nav>
        </div>

        <div className="container public-footer__base">
          <p>© {new Date().getFullYear()} VigiApp</p>
          <p>Proyecto final de la Tecnicatura Universitaria en Programación · UTN Facultad Regional Haedo</p>
        </div>
      </footer>

      <RoleSwitcher />
    </div>
  )
}
