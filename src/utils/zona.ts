import type { Coordenadas } from './ubicacion'

// Límites del radio de un grupo en la interfaz (el backend acepta cualquier radio mayor a 0)
export const RADIO_MINIMO = 100
export const RADIO_MAXIMO = 3000

export const textoRadio = (metros: number) =>
  metros >= 1000 ? `${(metros / 1000).toLocaleString('es-AR', { maximumFractionDigits: 2 })} km` : `${metros} m`

// Una cuadra porteña mide unos 100 m: ayuda a que el vecino entienda el tamaño del área
export const textoCuadras = (metros: number) => {
  const cuadras = Math.round(metros / 100)
  return cuadras <= 1 ? 'alrededor de 1 cuadra a la redonda' : `unas ${cuadras} cuadras a la redonda`
}

// Distancia en metros entre dos puntos (fórmula de Haversine, la misma que usa el backend)
export function distanciaMetros(a: Coordenadas, b: Coordenadas): number {
  const rad = (grados: number) => (grados * Math.PI) / 180
  const dLat = rad(b.lat - a.lat)
  const dLng = rad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 6_371_008.8 * 2 * Math.atan2(Math.sqrt(Math.min(1, h)), Math.sqrt(Math.max(0, 1 - h)))
}
