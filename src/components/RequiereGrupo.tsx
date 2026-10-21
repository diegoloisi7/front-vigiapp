import { Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useGrupos } from '../context/GruposContext'
import EstadoConsulta from './EstadoConsulta'
import SinGrupo from './SinGrupo'

// Protege las pantallas que dependen de un grupo: sin grupo, el vecino ve "No tenés grupo aún".
// El administrador global no necesita grupo.
export default function RequiereGrupo() {
  const { esAdmin } = useAuth()
  const { grupoActivo, cargando, error, recargar } = useGrupos()

  if (esAdmin) return <Outlet />
  if (cargando || error) {
    return <EstadoConsulta cargando={cargando} error={error} onReintentar={() => void recargar()}>{null}</EstadoConsulta>
  }
  if (!grupoActivo) return <SinGrupo />
  return <Outlet />
}
