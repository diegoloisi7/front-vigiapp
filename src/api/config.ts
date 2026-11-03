// La app usa la API local por defecto. El modo de ejemplo se activa explícitamente.
export const API_URL: string = ((import.meta.env.VITE_API_URL as string | undefined)?.trim() || 'http://localhost:3000/api').replace(/\/$/, '')
export const USAR_MOCK = import.meta.env.VITE_API_MODE === 'mock'

// Funciones cuyo endpoint todavía no existe en el backend: la interfaz las muestra como "Próximamente".
// Cuando el backend las implemente, poner en false y vuelven a funcionar (el código ya está hecho).
export const PROXIMAMENTE = {
  blanqueoClave: true,    // POST /admin/usuarios/:id/blanqueo-clave
  restablecerClave: true, // POST /auth/reset-password
}
