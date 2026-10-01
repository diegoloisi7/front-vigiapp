import type { Incident } from '../types'

// Datos locales para construir la interfaz mientras se desarrolla la API.
export const sampleIncidents: Incident[] = [
  {
    id: 'incident-1',
    title: 'Intento de robo',
    description: 'Un vecino alertó sobre un intento de robo de bicicleta.',
    category: 'robo',
    address: 'Av. Rivadavia 5200',
    reportedAt: 'Hace 12 min',
    coordinates: [-34.6158, -58.4333],
  },
  {
    id: 'incident-2',
    title: 'Actividad sospechosa',
    description: 'Persona revisando las puertas de vehículos estacionados.',
    category: 'actividad-sospechosa',
    address: 'Parque Centenario',
    reportedAt: 'Hace 38 min',
    coordinates: [-34.6062, -58.4356],
  },
  {
    id: 'incident-3',
    title: 'Emergencia médica',
    description: 'Se solicitó asistencia para una persona en la vía pública.',
    category: 'emergencia',
    address: 'Díaz Vélez 4800',
    reportedAt: 'Hace 1 h',
    coordinates: [-34.6089, -58.427],
  },
]
