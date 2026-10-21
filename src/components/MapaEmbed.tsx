// Mapa de Google Maps de EJEMPLO (iframe embed, no necesita API key).
// Más adelante se reemplaza por Leaflet con los pines de las incidencias.
interface Props {
  lat: number
  lng: number
  zoom?: number
  titulo: string
  className?: string
}

export default function MapaEmbed({ lat, lng, zoom = 16, titulo, className = '' }: Props) {
  const src = `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&hl=es&output=embed`
  return (
    <iframe
      className={`map-frame ${className}`}
      title={titulo}
      src={src}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  )
}
