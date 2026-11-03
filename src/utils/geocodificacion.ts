import type { Coordenadas } from './ubicacion'

// Geocodificación inversa con Nominatim (OpenStreetMap): convierte coordenadas en una dirección legible.
// No necesita API key. Su política de uso pide pocos pedidos (1 por segundo como máximo).
interface RespuestaNominatim {
  display_name?: string
  name?: string
  address?: Record<string, string | undefined>
}

export const textoCoordenadas = ({ lat, lng }: Coordenadas) => `${lat.toFixed(5)}, ${lng.toFixed(5)}`

// Arma un nombre corto: "Calle 123, Barrio, Ciudad". Si no hay datos de calle, usa el nombre del lugar.
function nombreCorto(r: RespuestaNominatim): string {
  const a = r.address ?? {}
  const calle = a.road ?? a.pedestrian ?? a.footway ?? a.path
  const lugar = r.name && r.name !== calle ? r.name : ''
  const principal = calle ? [calle, a.house_number].filter(Boolean).join(' ') : lugar
  const zona = a.neighbourhood ?? a.suburb ?? a.quarter ?? a.city_district
  const ciudad = a.city ?? a.town ?? a.village ?? a.municipality ?? a.county
  const partes = [principal, zona, ciudad].filter((x): x is string => !!x)
  return partes.length > 0 ? partes.join(', ') : (r.display_name ?? '')
}

// Devuelve el nombre del lugar, o null si no se pudo obtener (sin conexión, sin resultados, etc.)
export async function nombreDeUbicacion(punto: Coordenadas, senal?: AbortSignal): Promise<string | null> {
  // Si el servicio tarda demasiado se corta, para no dejar al usuario esperando
  const control = new AbortController()
  const cortar = () => control.abort()
  const limite = window.setTimeout(cortar, 6000)
  senal?.addEventListener('abort', cortar)
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${punto.lat}&lon=${punto.lng}&zoom=18&addressdetails=1&accept-language=es`
    const respuesta = await fetch(url, { signal: control.signal, headers: { Accept: 'application/json' } })
    if (!respuesta.ok) return null
    const nombre = nombreCorto((await respuesta.json()) as RespuestaNominatim).trim()
    return nombre || null
  } catch {
    return null
  } finally {
    window.clearTimeout(limite)
    senal?.removeEventListener('abort', cortar)
  }
}

export interface ResultadoBusqueda {
  nombre: string
  punto: Coordenadas
}

// Países donde se busca (código ISO). Vacío = en todo el mundo.
const PAISES_BUSQUEDA = 'ar'

// Búsqueda de direcciones con Nominatim (OpenStreetMap). Devuelve hasta 5 resultados, o [] si falla.
export async function buscarDirecciones(texto: string, senal?: AbortSignal): Promise<ResultadoBusqueda[]> {
  const consulta = texto.trim()
  if (consulta.length < 3) return []
  const control = new AbortController()
  const cortar = () => control.abort()
  const limite = window.setTimeout(cortar, 8000)
  senal?.addEventListener('abort', cortar)
  try {
    const paises = PAISES_BUSQUEDA ? `&countrycodes=${PAISES_BUSQUEDA}` : ''
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&addressdetails=1&accept-language=es${paises}&q=${encodeURIComponent(consulta)}`
    const respuesta = await fetch(url, { signal: control.signal, headers: { Accept: 'application/json' } })
    if (!respuesta.ok) return []
    const datos = (await respuesta.json()) as (RespuestaNominatim & { lat: string; lon: string })[]
    return datos
      .map((r) => ({ nombre: nombreCorto(r) || r.display_name || consulta, punto: { lat: Number(r.lat), lng: Number(r.lon) } }))
      .filter((r) => Number.isFinite(r.punto.lat) && Number.isFinite(r.punto.lng))
  } catch {
    return []
  } finally {
    window.clearTimeout(limite)
    senal?.removeEventListener('abort', cortar)
  }
}
