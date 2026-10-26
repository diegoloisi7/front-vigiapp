export interface Coordenadas {
  lat: number
  lng: number
}

// Pide una posición puntual al navegador. Devuelve null si no hay permiso, no hay señal o tarda demasiado.
export function obtenerUbicacion(tiempoMaximoMs = 6000): Promise<Coordenadas | null> {
  return new Promise((resolver) => {
    if (!('geolocation' in navigator)) return resolver(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => resolver({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolver(null),
      { enableHighAccuracy: true, timeout: tiempoMaximoMs, maximumAge: 30000 },
    )
  })
}
