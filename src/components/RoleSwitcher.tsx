import { useState, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { leerVecinoNuevo, simularVecinoNuevo } from '../api/mock'
import { useAuth, ROLES } from '../context/AuthContext'
import { useGrupos } from '../context/GruposContext'
import type { Rol } from '../types'

type Opcion = Rol | 'VECINO_NUEVO'

// Herramienta de desarrollo: permite cambiar el rol para probar las rutas y menús.
// "Vecino nuevo" es un vecino sin ningún grupo. Se quita cuando haya login real con backend.
export default function RoleSwitcher() {
  const { rol, cambiarRol } = useAuth()
  const { recargar } = useGrupos()
  const navigate = useNavigate()
  const [vecinoNuevo, setVecinoNuevo] = useState(leerVecinoNuevo)

  const valor: Opcion = rol === 'VECINO' && vecinoNuevo ? 'VECINO_NUEVO' : rol

  function alCambiar(e: ChangeEvent<HTMLSelectElement>) {
    const opcion = e.target.value as Opcion
    const esNuevo = opcion === 'VECINO_NUEVO'
    simularVecinoNuevo(esNuevo) // reinicia los grupos de ejemplo
    setVecinoNuevo(esNuevo)
    cambiarRol(esNuevo ? ROLES.VECINO : opcion)
    void recargar()
    // Lleva a la pantalla inicial del rol elegido
    if (opcion === ROLES.VISITANTE) navigate('/')
    else if (opcion === ROLES.ADMINISTRADOR) navigate('/admin')
    else navigate('/app')
  }

  return (
    <div className="role-switcher">
      <label htmlFor="rol-prueba">Rol de prueba</label>
      <select id="rol-prueba" value={valor} onChange={alCambiar}>
        <option value="VISITANTE">Visitante</option>
        <option value="VECINO">Vecino</option>
        <option value="VECINO_NUEVO">Vecino nuevo (sin grupo)</option>
        <option value="ADMINISTRADOR">Administrador</option>
      </select>
    </div>
  )
}
