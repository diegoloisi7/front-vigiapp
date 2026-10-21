import { useLocation } from 'react-router-dom'
import SelectorGrupo from './SelectorGrupo'

// Se busca de arriba hacia abajo; "/app" va último porque matchea todo lo que empieza con /app
const TITULOS = [
  ['/app/mapa', 'Mapa'],
  ['/app/incidencias', 'Incidencia'],
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
  const titulo = TITULOS.find(([ruta]) => pathname.startsWith(ruta))?.[1] ?? 'Vecinal'

  return (
    <header className="app-topbar">
      <h1 className="app-topbar__title">{titulo}</h1>
      <SelectorGrupo />
    </header>
  )
}
