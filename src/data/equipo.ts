// Equipo de VigiApp (página /nosotros).
// Para mostrar una foto: guardala en /public/equipo/ y poné su ruta en "foto", por ejemplo '/equipo/franco.jpg'.
// "github" y "linkedin" son opcionales: si no están, no se muestran los botones.
export interface MiembroEquipo {
  id: number
  nombre: string
  rol: string
  ubicacion: string
  aporte: string // qué hizo en el proyecto, en una frase
  foto?: string
  github?: string
  linkedin?: string
}

export const EQUIPO: MiembroEquipo[] = [
  { id: 1, nombre: 'Franco Tenedini', rol: 'Desarrollo frontend', ubicacion: 'Buenos Aires, Argentina',
    aporte: 'Diseñó y construyó la interfaz: pantallas, mapas, notificaciones en vivo y accesibilidad.' },
  { id: 2, nombre: 'Diego Loisi', rol: 'Desarrollo backend', ubicacion: 'Buenos Aires, Argentina',
    aporte: 'Desarrolló la API y la lógica del servidor que hacen funcionar la app.' },
  { id: 3, nombre: 'Leandro Alfonso', rol: 'Team leader y documentación', ubicacion: 'Buenos Aires, Argentina',
    aporte: 'Coordinó al equipo y llevó la documentación del proyecto.' },
  { id: 4, nombre: 'Elias Gritti', rol: 'Base de datos y backend', ubicacion: 'Buenos Aires, Argentina',
    aporte: 'Diseñó la base de datos y participó en el desarrollo del backend.' },
]
