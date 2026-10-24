import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useGrupos } from '../context/GruposContext'
import Modal from './Modal'

// Botón del encabezado que muestra el grupo activo y permite cambiarlo.
export default function SelectorGrupo() {
  const { esAdmin } = useAuth()
  const { grupos, grupoActivo, invitaciones, cargando, cambiarGrupoActivo } = useGrupos()
  const [abierto, setAbierto] = useState(false)

  if (esAdmin || cargando) return null
  if (!grupoActivo) {
    return <Link to="/app/grupos" className="selector-grupo"><span aria-hidden="true">🏘️</span> Sin grupo</Link>
  }

  return (
    <>
      <button type="button" className="selector-grupo" aria-haspopup="dialog" onClick={() => setAbierto(true)}>
        <span aria-hidden="true">🏘️</span>
        <span className="selector-grupo__nombre">{grupoActivo.nombre}</span>
        <span aria-hidden="true">▾</span>
        {invitaciones.length > 0 && <span className="selector-grupo__aviso" role="img" aria-label="Tenés invitaciones pendientes" />}
      </button>

      <Modal abierto={abierto} onCerrar={() => setAbierto(false)} titulo="Elegir grupo">
        <div className="stack-list" role="group" aria-label="Mis grupos">
          {grupos.map((g) => (
            <button
              key={g.id}
              type="button"
              className={`grupo-opcion ${g.id === grupoActivo.id ? 'is-active' : ''}`}
              aria-pressed={g.id === grupoActivo.id}
              onClick={() => { cambiarGrupoActivo(g.id); setAbierto(false) }}
            >
              <strong>{g.nombre}</strong>
              <span>{g.zona} · {g.miRol === 'OWNER' ? 'Sos owner' : 'Miembro'}</span>
            </button>
          ))}
        </div>
        <Link to="/app/grupos" className="btn btn-outline btn-ancho selector-grupo__link" onClick={() => setAbierto(false)}>
          Mis grupos{invitaciones.length > 0 ? ` · ${invitaciones.length} ${invitaciones.length === 1 ? 'invitación' : 'invitaciones'}` : ''}
        </Link>
      </Modal>
    </>
  )
}
