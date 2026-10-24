import type { ReactElement } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth, ROLES } from './context/AuthContext'

import PublicLayout from './layouts/PublicLayout'
import AppLayout from './layouts/AppLayout'
import AdminLayout from './layouts/AdminLayout'
import RequiereGrupo from './components/RequiereGrupo'

import Landing from './pages/public/Landing'
import Registro from './pages/public/Registro'
import Login from './pages/public/Login'
import Contacto from './pages/public/Contacto'

import Inicio from './pages/app/Inicio'
import Incidentes from './pages/app/Incidentes'
import DetalleIncidencia from './pages/app/DetalleIncidencia'
import Reportar from './pages/app/Reportar'
import Alertas from './pages/app/Alertas'
import Perfil from './pages/app/Perfil'
import Grupos from './pages/app/Grupos'
import DetalleGrupo from './pages/app/DetalleGrupo'

import AdminDashboard from './pages/admin/AdminDashboard'
import AdminGrupos from './pages/admin/AdminGrupos'
import AdminUsuarios from './pages/admin/AdminUsuarios'
import AdminIncidencias from './pages/admin/AdminIncidencias'
import AdminCategorias from './pages/admin/AdminCategorias'
import AdminAvisos from './pages/admin/AdminAvisos'
import AdminContactos from './pages/admin/AdminContactos'

// Protege rutas: sin sesión → /login. Con soloAdmin, un vecino vuelve a /app.
// Con soloVecino, el administrador global va a su panel (no pertenece a grupos).
function RutaPrivada({ soloAdmin = false, soloVecino = false, children }: { soloAdmin?: boolean; soloVecino?: boolean; children: ReactElement }): ReactElement {
  const { rol, esAdmin } = useAuth()
  if (rol === ROLES.VISITANTE) return <Navigate to="/login" replace />
  if (soloAdmin && !esAdmin) return <Navigate to="/app" replace />
  if (soloVecino && esAdmin) return <Navigate to="/admin" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      {/* Públicas */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/contacto" element={<Contacto />} />
      </Route>

      {/* Vecino */}
      <Route path="/app" element={<RutaPrivada soloVecino><AppLayout /></RutaPrivada>}>
        {/* Sin grupo, estas pantallas muestran "No tenés grupo aún" */}
        <Route element={<RequiereGrupo />}>
          <Route index element={<Inicio />} />
          <Route path="incidentes" element={<Incidentes />} />
          <Route path="mapa" element={<Navigate to="/app/incidentes" replace />} />
          <Route path="incidencias/:id" element={<DetalleIncidencia />} />
          <Route path="reportar" element={<Reportar />} />
          <Route path="alertas" element={<Alertas />} />
        </Route>
        <Route path="grupos" element={<Grupos />} />
        <Route path="grupos/:id" element={<DetalleGrupo />} />
        <Route path="perfil" element={<Perfil />} />
      </Route>

      {/* Administrador global: front propio */}
      <Route path="/admin" element={<RutaPrivada soloAdmin><AdminLayout /></RutaPrivada>}>
        <Route index element={<AdminDashboard />} />
        <Route path="grupos" element={<AdminGrupos />} />
        <Route path="usuarios" element={<AdminUsuarios />} />
        <Route path="incidencias" element={<AdminIncidencias />} />
        <Route path="categorias" element={<AdminCategorias />} />
        <Route path="avisos" element={<AdminAvisos />} />
        <Route path="contactos" element={<AdminContactos />} />
      </Route>

      {/* Cualquier otra ruta vuelve al inicio */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
