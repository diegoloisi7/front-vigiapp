import { API_URL } from './config'

// Error de la API: guarda el código HTTP (0 = sin conexión).
export class ApiError extends Error {
  status: number

  constructor(mensaje: string, status: number) {
    super(mensaje)
    this.name = 'ApiError'
    this.status = status
  }
}

interface Opciones {
  metodo?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  cuerpo?: unknown
}

// Intenta leer el mensaje de error que mande el backend ({ mensaje } o { error })
async function leerMensaje(respuesta: Response): Promise<string> {
  try {
    const datos = (await respuesta.json()) as { mensaje?: string; error?: string }
    return datos.mensaje ?? datos.error ?? `Error ${respuesta.status}`
  } catch {
    return `Error ${respuesta.status}`
  }
}

// Pedido HTTP genérico a la API. Usa cookies (credentials: 'include') para la sesión.
export async function pedir<T>(ruta: string, { metodo = 'GET', cuerpo }: Opciones = {}): Promise<T> {
  let respuesta: Response
  try {
    // Con FormData (subida de archivos) el navegador pone solo el Content-Type con su boundary
    const esFormulario = cuerpo instanceof FormData
    respuesta = await fetch(`${API_URL}${ruta}`, {
      method: metodo,
      headers: cuerpo !== undefined && !esFormulario ? { 'Content-Type': 'application/json' } : undefined,
      body: cuerpo === undefined ? undefined : esFormulario ? cuerpo : JSON.stringify(cuerpo),
      credentials: 'include',
    })
  } catch {
    throw new ApiError('No hay conexión con el servidor.', 0)
  }
  if (!respuesta.ok) throw new ApiError(await leerMensaje(respuesta), respuesta.status)
  if (respuesta.status === 204) return undefined as T
  return (await respuesta.json()) as T
}

// Texto para mostrar al usuario cuando algo falla
export function mensajeDeError(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Ocurrió un error inesperado.'
}
