import { useLocation } from 'react-router-dom'
import SelectorGrupo from './SelectorGrupo'
import ToggleTema from './ToggleTema'

// Se busca de arriba hacia abajo; "/app" va último porque matchea todo lo que empieza con /app
const TITULOS = [
  ['/app/incidentes', 'Incidentes'],
  ['/app/incidencias', 'Incidente'],
  ['/app/reportar', 'Reportar'],
  ['/app/alertas', 'Alertas y avisos'],
  ['/app/grupos', 'Mis grupos'],
  ['/app/perfil', 'Perfil'],
  ['/admin', 'Administración'],
  ['/app', 'Inicio'],
]

// Encabezado simple con el título de la sección (es el <h1> de la pantalla).
export default function TopBar() {
  const { pathname } = useLocation()
  const titulo = TITULOS.find(([ruta]) => pathname.startsWith(ruta))?.[1] ?? 'VigiApp'

  return (
    <header className="app-topbar">
      <h1 className="app-topbar__title">{titulo}</h1>
      <div className="app-topbar__tools">
        <SelectorGrupo />
        <ToggleTema />
      </div>
    </header>
  )
}
