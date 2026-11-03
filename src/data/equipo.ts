// Equipo de VigiApp (página /nosotros).
import fotoDiego from '../assets/equipo/diego.webp'
import fotoElias from '../assets/equipo/elias.webp'
import fotoFranco from '../assets/equipo/franco.webp'
import fotoLeandro from '../assets/equipo/leandro.webp'

// Las fotos están en src/assets/equipo/ (cuadradas, 400 × 400, WebP). Sin foto, se muestran las iniciales.
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
  { id: 1, nombre: 'Franco Tenedini', foto: fotoFranco, rol: 'Desarrollo frontend', ubicacion: 'Buenos Aires, Argentina',
    aporte: 'Diseñó y construyó la interfaz: pantallas, mapas, notificaciones en vivo y accesibilidad.' },
  { id: 2, nombre: 'Diego Loisi', foto: fotoDiego, rol: 'Desarrollo backend', ubicacion: 'Buenos Aires, Argentina',
    aporte: 'Desarrolló la API y la lógica del servidor que hacen funcionar la app.' },
  { id: 3, nombre: 'Leandro Alfonso', foto: fotoLeandro, rol: 'Team leader y documentación', ubicacion: 'Buenos Aires, Argentina',
    aporte: 'Coordinó al equipo y llevó la documentación del proyecto.' },
  { id: 4, nombre: 'Elias Gritti', foto: fotoElias, rol: 'Base de datos y backend', ubicacion: 'Buenos Aires, Argentina',
    aporte: 'Diseñó la base de datos y participó en el desarrollo del backend.' },
]
