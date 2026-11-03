import { NavLink, useLocation } from 'react-router-dom'
import { useGrupos } from '../../context/GruposContext'
import { NAV_VECINO, itemActivo } from '../../data/navItems'
import Icono, { type NombreIcono } from './Icono'

const ICONOS: Record<string, NombreIcono> = {
  '/app': 'inicio',
  '/app/incidentes': 'incidentes',
  '/app/reportar': 'mas',
  '/app/alertas': 'alertas',
  '/app/perfil': 'perfil',
}

// Barra inferior tipo app (solo celular y tablet). "Reportar" va al centro, en amarillo.
export default function NavInferior() {
  const { pathname } = useLocation()
  const { grupoActivo } = useGrupos()
  // Sin grupo no se puede reportar: el botón central desaparece
  const items = grupoActivo ? NAV_VECINO : NAV_VECINO.filter((i) => i.to !== '/app/reportar')
  return (
    <nav className="vg-tabbar" aria-label="Navegación principal">
      <ul>
        {items.map((item) => (
          <li key={item.to}>
            <NavLink to={item.to} end={item.end}
              className={({ isActive }) => `vg-tabbar__item${item.destacado ? ' vg-tabbar__item--reportar' : ''}${itemActivo(item, isActive, pathname) ? ' is-active' : ''}`}>
              <span className="vg-tabbar__icono"><Icono nombre={ICONOS[item.to] ?? 'inicio'} tamano={item.destacado ? 26 : 22} /></span>
              <span>{item.texto}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
