import { Outlet } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import SideNav from '../components/SideNav'
import TopBar from '../components/TopBar'
import RoleSwitcher from '../components/RoleSwitcher'
import RealtimeAlerts from '../components/RealtimeAlerts'

// Layout del vecino (y del administrador): menú lateral en escritorio, barra inferior en celular.
// Las pantallas /admin/* también viven dentro de este layout.
export default function AppLayout() {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#contenido">Saltar al contenido</a>
      <SideNav />
      <div className="app-body">
        <TopBar />
        <main id="contenido" className="app-main">
          <div className="app-content">
            <Outlet />
          </div>
        </main>
      </div>
      <BottomNav />
      <RoleSwitcher />
      <RealtimeAlerts />
    </div>
  )
}
