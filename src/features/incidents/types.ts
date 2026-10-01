export type IncidentCategory = 'robo' | 'actividad-sospechosa' | 'emergencia'

export interface Incident {
  id: string
  title: string
  description: string
  category: IncidentCategory
  address: string
  reportedAt: string
  coordinates: [number, number]
}
