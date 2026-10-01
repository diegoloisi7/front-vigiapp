import { useEffect } from 'react'
import L from 'leaflet'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import type { Incident } from '../types'

const categoryColors: Record<Incident['category'], string> = {
  robo: '#dc5c4c',
  'actividad-sospechosa': '#d89a35',
  emergencia: '#5278bd',
}

function MapBounds({ incidents }: { incidents: Incident[] }) {
  const map = useMap()

  useEffect(() => {
    if (incidents.length > 0) {
      map.fitBounds(incidents.map((incident) => incident.coordinates), { padding: [40, 40] })
    }
  }, [incidents, map])

  return null
}

function markerIcon(color: string) {
  return L.divIcon({
    className: 'incident-marker',
    html: `<span style="--marker-color: ${color}"></span>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}

export function IncidentMap({ incidents }: { incidents: Incident[] }) {
  return (
    <MapContainer center={[-34.61, -58.43]} zoom={14} className="incident-map" scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapBounds incidents={incidents} />
      {incidents.map((incident) => (
        <Marker
          key={incident.id}
          position={incident.coordinates}
          icon={markerIcon(categoryColors[incident.category])}
        >
          <Popup>
            <strong>{incident.title}</strong>
            <br />
            {incident.address}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
