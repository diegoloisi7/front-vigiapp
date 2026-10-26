import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { pedir } from '../api/cliente'
import { USAR_MOCK } from '../api/config'
import { USUARIOS_MOCK } from '../data/mock'
import type { Rol, Usuario } from '../types'

export const ROLES: Record<Rol, Rol> = {
  VISITANTE: 'VISITANTE', VECINO: 'VECINO', ADMINISTRADOR: 'ADMINISTRADOR',
}

interface AuthValor {
  rol: Rol
  usuario: Usuario | null
  estaLogueado: boolean
  esAdmin: boolean
  cargando: boolean
  cambiarRol: (nuevoRol: Rol) => void
  iniciarSesion: (email: string, password: string) => Promise<Rol>
  cerrarSesion: () => void
}

interface BackendUser {
  id: string; firstName: string; lastName: string; email: string; appRole: 'USER' | 'ADMIN'
}

const CLAVE_GUARDADA = 'vigiapp_rol_mock'
const CLAVE_TOKEN = 'vigiapp_token'
const AuthContext = createContext<AuthValor | null>(null)

function leerRolGuardado(): Rol {
  try {
    const guardado = localStorage.getItem(CLAVE_GUARDADA)
    return guardado !== null && guardado in ROLES ? (guardado as Rol) : ROLES.VISITANTE
  } catch { return ROLES.VISITANTE }
}

const mapearUsuario = (user: BackendUser): Usuario => ({
  id: Number(user.id), nombre: user.firstName, apellido: user.lastName, email: user.email, comunidad: '',
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [rolMock, setRolMock] = useState<Rol>(leerRolGuardado)
  const [rolReal, setRolReal] = useState<Rol>('VISITANTE')
  const [usuarioReal, setUsuarioReal] = useState<Usuario | null>(null)
  const [cargando, setCargando] = useState(!USAR_MOCK && !!sessionStorage.getItem(CLAVE_TOKEN))

  useEffect(() => {
    if (USAR_MOCK || !sessionStorage.getItem(CLAVE_TOKEN)) return
    void pedir<BackendUser>('/auth/me').then((user) => {
      setUsuarioReal(mapearUsuario(user))
      setRolReal(user.appRole === 'ADMIN' ? 'ADMINISTRADOR' : 'VECINO')
    }).catch(() => {
      sessionStorage.removeItem(CLAVE_TOKEN)
      setRolReal('VISITANTE')
      setUsuarioReal(null)
    }).finally(() => setCargando(false))
  }, [])

  function cambiarRol(nuevoRol: Rol) {
    if (!USAR_MOCK) return
    setRolMock(nuevoRol)
    try { localStorage.setItem(CLAVE_GUARDADA, nuevoRol) } catch { /* sin almacenamiento */ }
  }

  async function iniciarSesion(email: string, password: string) {
    const result = await pedir<{ accessToken: string }>('/auth/login', { metodo: 'POST', cuerpo: { email, password } })
    sessionStorage.setItem(CLAVE_TOKEN, result.accessToken)
    let user: BackendUser
    try {
      user = await pedir<BackendUser>('/auth/me')
    } catch (error) {
      sessionStorage.removeItem(CLAVE_TOKEN)
      throw error
    }
    setUsuarioReal(mapearUsuario(user))
    const newRole = user.appRole === 'ADMIN' ? 'ADMINISTRADOR' : 'VECINO'
    setRolReal(newRole)
    return newRole as Rol
  }

  function cerrarSesion() {
    if (USAR_MOCK) cambiarRol(ROLES.VISITANTE)
    else {
      void pedir('/auth/logout', { metodo: 'POST' }).catch(() => {})
      sessionStorage.removeItem(CLAVE_TOKEN)
      setRolReal('VISITANTE')
      setUsuarioReal(null)
    }
  }

  const rol = USAR_MOCK ? rolMock : rolReal
  const valor: AuthValor = {
    rol,
    usuario: USAR_MOCK ? (rolMock === 'VISITANTE' ? null : USUARIOS_MOCK[rolMock]) : usuarioReal,
    estaLogueado: rol !== 'VISITANTE', esAdmin: rol === 'ADMINISTRADOR', cargando,
    cambiarRol, iniciarSesion, cerrarSesion,
  }
  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthValor {
  const contexto = useContext(AuthContext)
  if (!contexto) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return contexto
}
