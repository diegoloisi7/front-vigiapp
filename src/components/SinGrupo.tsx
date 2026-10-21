import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGrupos } from '../context/GruposContext'
import CrearGrupoModal from './CrearGrupoModal'
import EmptyState from './EmptyState'

// Pantalla para el vecino que todavía no pertenece a ningún grupo.
export default function SinGrupo() {
  const { invitaciones } = useGrupos()
  const [crearAbierto, setCrearAbierto] = useState(false)

  return (
    <>
      <EmptyState icono="🏘️" titulo="No tenés grupo aún" texto="Creá tu grupo vecinal o esperá a que el owner de uno te invite.">
        <div className="stack">
          <button type="button" className="btn btn-primary" onClick={() => setCrearAbierto(true)}>Crear grupo</button>
          {invitaciones.length > 0 && (
            <Link to="/app/grupos" className="btn btn-outline">Ver mis invitaciones ({invitaciones.length})</Link>
          )}
        </div>
      </EmptyState>
      <CrearGrupoModal abierto={crearAbierto} onCerrar={() => setCrearAbierto(false)} />
    </>
  )
}
