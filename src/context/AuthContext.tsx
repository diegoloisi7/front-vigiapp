import { createContext, useContext, useState, type ReactNode } from 'react'
import { USUARIOS_MOCK } from '../data/mock'
import type { Rol, Usuario } from '../types'

// Roles posibles de la app (rol global)
export const ROLES: Record<Rol, Rol> = {
  VISITANTE: 'VISITANTE',
  VECINO: 'VECINO',
  ADMINISTRADOR: 'ADMINISTRADOR',
}

interface AuthValor {
  rol: Rol
  usuario: Usuario | null // null si es visitante
  estaLogueado: boolean
  esAdmin: boolean
  cambiarRol: (nuevoRol: Rol) => void
  cerrarSesion: () => void
}

const CLAVE_GUARDADA = 'vigiapp_rol_mock'
const AuthContext = createContext<AuthValor | null>(null)

// Lee el rol guardado (así no se pierde al recargar mientras desarrollamos)
function leerRolGuardado(): Rol {
  try {
    const guardado = localStorage.getItem(CLAVE_GUARDADA)
    return guardado !== null && guardado in ROLES ? (guardado as Rol) : ROLES.VISITANTE
  } catch {
    return ROLES.VISITANTE
  }
}

// Sesión SIMULADA: todavía no hay backend, solo se cambia el rol para probar la navegación.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [rol, setRol] = useState<Rol>(leerRolGuardado)

  function cambiarRol(nuevoRol: Rol) {
    setRol(nuevoRol)
    try { localStorage.setItem(CLAVE_GUARDADA, nuevoRol) } catch { /* sin almacenamiento: se ignora */ }
  }

  const valor: AuthValor = {
    rol,
    usuario: rol === 'VISITANTE' ? null : USUARIOS_MOCK[rol],
    estaLogueado: rol !== ROLES.VISITANTE,
    esAdmin: rol === ROLES.ADMINISTRADOR,
    cambiarRol,
    cerrarSesion: () => cambiarRol(ROLES.VISITANTE),
  }

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthValor {
  const contexto = useContext(AuthContext)
  if (!contexto) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return contexto
}
