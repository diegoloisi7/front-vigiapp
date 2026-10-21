import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { mensajeDeError } from '../api/cliente'
import { useGrupos } from '../context/GruposContext'
import Campo from './Campo'
import Modal from './Modal'

type Errores = { nombre?: string; zona?: string }

// Formulario para crear un grupo. Quien lo crea queda como owner y el grupo pasa a ser el activo.
export default function CrearGrupoModal({ abierto, onCerrar }: { abierto: boolean; onCerrar: () => void }) {
  const navigate = useNavigate()
  const { recargar, cambiarGrupoActivo } = useGrupos()
  const [nombre, setNombre] = useState('')
  const [zona, setZona] = useState('')
  const [errores, setErrores] = useState<Errores>({})
  const [enviando, setEnviando] = useState(false)
  const [errorEnvio, setErrorEnvio] = useState('')

  function cerrar() {
    setNombre('')
    setZona('')
    setErrores({})
    setErrorEnvio('')
    onCerrar()
  }

  async function enviar(e: FormEvent) {
    e.preventDefault()
    const nuevos: Errores = {}
    if (nombre.trim().length < 3) nuevos.nombre = 'Escribí un nombre de al menos 3 caracteres.'
    if (!zona.trim()) nuevos.zona = 'Indicá el barrio o la zona del grupo.'
    setErrores(nuevos)
    const primero = Object.keys(nuevos)[0]
    if (primero) return document.getElementById(`grupo-${primero}`)?.focus()

    setEnviando(true)
    setErrorEnvio('')
    try {
      const grupo = await api.grupos.crear({ nombre, zona })
      cambiarGrupoActivo(grupo.id)
      navigate(`/app/grupos/${grupo.id}`) // lleva al grupo nuevo para invitar vecinos
      cerrar()
      await recargar()
    } catch (error) {
      setErrorEnvio(mensajeDeError(error))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Modal abierto={abierto} onCerrar={cerrar} titulo="Crear grupo">
      <form onSubmit={enviar} noValidate>
        <p className="campo__ayuda">Vas a ser el owner del grupo: podés invitar vecinos y cerrar incidentes y avisos.</p>
        <Campo id="grupo-nombre" etiqueta="Nombre del grupo" error={errores.nombre}>
          <input id="grupo-nombre" className="input" type="text" maxLength={60} value={nombre}
            aria-invalid={!!errores.nombre} aria-describedby={errores.nombre ? 'grupo-nombre-error' : undefined}
            placeholder="Ej.: Barrio Los Álamos" onChange={(e) => setNombre(e.target.value)} />
        </Campo>
        <Campo id="grupo-zona" etiqueta="Barrio o zona" error={errores.zona}>
          <input id="grupo-zona" className="input" type="text" maxLength={80} value={zona}
            aria-invalid={!!errores.zona} aria-describedby={errores.zona ? 'grupo-zona-error' : undefined}
            placeholder="Ej.: Manzanas 1 a 12" onChange={(e) => setZona(e.target.value)} />
        </Campo>
        {errorEnvio && <p className="campo__error" role="alert">{errorEnvio}</p>}
        <button type="submit" className="btn btn-primary btn-ancho" disabled={enviando}>
          {enviando ? 'Creando…' : 'Crear grupo'}
        </button>
      </form>
    </Modal>
  )
}
