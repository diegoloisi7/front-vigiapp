// URL base de la API (viene de .env). Sin URL, la app usa los datos de ejemplo.
export const API_URL: string = ((import.meta.env.VITE_API_URL as string | undefined) ?? '').replace(/\/$/, '')
export const USAR_MOCK = API_URL === ''

// Funciones cuyo endpoint todavía no existe en el backend: la interfaz las muestra como "Próximamente".
// Cuando el backend las implemente, poner en false y vuelven a funcionar (el código ya está hecho).
export const PROXIMAMENTE = {
  blanqueoClave: true,    // POST /admin/usuarios/:id/blanqueo-clave
  restablecerClave: true, // POST /auth/reset-password
}
