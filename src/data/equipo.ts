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
  { id: 2, nombre: 'Integrante 2', rol: 'Desarrollo backend', ubicacion: 'Buenos Aires, Argentina',
    aporte: 'Completar: qué aportó al proyecto en una frase.' },
  { id: 3, nombre: 'Integrante 3', rol: 'Rol en el proyecto', ubicacion: 'Buenos Aires, Argentina',
    aporte: 'Completar: qué aportó al proyecto en una frase.' },
  { id: 4, nombre: 'Integrante 4', rol: 'Rol en el proyecto', ubicacion: 'Buenos Aires, Argentina',
    aporte: 'Completar: qué aportó al proyecto en una frase.' },
]
