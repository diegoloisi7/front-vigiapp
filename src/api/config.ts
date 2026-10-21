// URL base de la API (viene de .env). Sin URL, la app usa los datos de ejemplo.
export const API_URL: string = ((import.meta.env.VITE_API_URL as string | undefined) ?? '').replace(/\/$/, '')
export const USAR_MOCK = API_URL === ''
