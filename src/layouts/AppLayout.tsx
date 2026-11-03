import { Outlet, useLocation } from 'react-router-dom'
import BannerUrgente from '../components/BannerUrgente'
import RoleSwitcher from '../components/RoleSwitcher'
import NavInferior from '../components/vecino/NavInferior'
import NavSuperior from '../components/vecino/NavSuperior'
import { NotificacionesProvider } from '../context/NotificacionesContext'
import { ModoVecinoContext } from '../components/vecino/modoVecino'

// Se busca de arriba hacia abajo; "/app" va último porque matchea todo lo que empieza con /app
const TITULOS: [string, string][] = [
  ['/app/incidentes', 'Incidentes'],
  ['/app/incidencias', 'Incidente'],
  ['/app/reportar', 'Reportar'],
  ['/app/alertas', 'Alertas y avisos'],
  ['/app/grupos', 'Mis grupos'],
  ['/app/perfil', 'Perfil'],
  ['/app', 'Inicio'],
]

// Layout del vecino: barra superior (escritorio) y barra inferior tipo app (celular).
// Todo lo visual vive bajo .vg-app, así el panel de administración no cambia.
export default function AppLayout() {
  const { pathname } = useLocation()
  const esInicio = pathname === '/app' || pathname === '/app/'
  const titulo = TITULOS.find(([ruta]) => pathname.startsWith(ruta))?.[1] ?? 'VigiApp'

  return (
    <NotificacionesProvider>
      <ModoVecinoContext.Provider value={true}>
      <div className="vg-app">
        <a className="skip-link" href="#contenido">Saltar al contenido</a>
        <NavSuperior />
        <BannerUrgente />
        <main id="contenido" className="vg-main">
          <div key={pathname} className="vg-transicion">
          {esInicio ? (
            <Outlet />
          ) : (
            <>
              <header className="vg-cabecera">
                <div className="vg-cabecera__inner"><h1 className="vg-cabecera__titulo">{titulo}</h1></div>
              </header>
              <div className="vg-pagina"><Outlet /></div>
            </>
          )}
          </div>
        </main>
        <NavInferior />
        <RoleSwitcher />
      </div>
      </ModoVecinoContext.Provider>
    </NotificacionesProvider>
  )
}
