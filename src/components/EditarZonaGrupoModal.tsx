import { useMemo, useState, type FormEvent } from 'react'
import { api } from '../api'
import { mensajeDeError } from '../api/cliente'
import { useConsulta } from '../hooks/useConsulta'
import type { GrupoDetalle } from '../types'
import { esAbierto } from '../utils/permisos'
import type { Coordenadas } from '../utils/ubicacion'
import { RADIO_MAXIMO, distanciaMetros } from '../utils/zona'
import Campo from './Campo'
import Modal from './Modal'
import SelectorZonaMapa from './SelectorZonaMapa'
import Icono from './vecino/Icono'

interface Props {
  grupo: GrupoDetalle | null // null = modal cerrado
  onCerrar: () => void
  onGuardado: () => void
}

// Edición del grupo por su owner: nombre, barrio y zona (centro + radio) en el mapa.
export default function EditarZonaGrupoModal({ grupo, onCerrar, onGuardado }: Props) {
  return (
    <Modal abierto={grupo !== null} onCerrar={onCerrar} titulo="Editar grupo">
      {grupo && <FormEditarGrupo grupo={grupo} onCerrar={onCerrar} onGuardado={onGuardado} />}
    </Modal>
  )
}

type Errores = { nombre?: string; zona?: string; centro?: string }

function FormEditarGrupo({ grupo, onCerrar, onGuardado }: { grupo: GrupoDetalle; onCerrar: () => void; onGuardado: () => void }) {
  const [nombre, setNombre] = useState(grupo.nombre)
  const [zona, setZona] = useState(grupo.zona)
  const [centro, setCentro] = useState<Coordenadas | null>(grupo.centro ?? null)
  const [radio, setRadio] = useState(grupo.radioMetros ?? 500)
  const [errores, setErrores] = useState<Errores>({})
  const [enviando, setEnviando] = useState(false)
  const [errorEnvio, setErrorEnvio] = useState('')

  // Incidentes activos del grupo: para avisar cuáles quedarían fuera del área nueva
  const { datos: incidentes } = useConsulta(() => api.incidencias.listar(grupo.id), [grupo.id])
  const quedanAfuera = useMemo(() => {
    if (!centro) return 0
    return (incidentes ?? []).filter((i) => esAbierto(i) && i.lat != null && i.lng != null
      && distanciaMetros(centro, { lat: i.lat, lng: i.lng }) > radio).length
  }, [incidentes, centro, radio])

  async function guardar(e: FormEvent) {
    e.preventDefault()
    const nuevos: Errores = {}
    if (nombre.trim().length < 3) nuevos.nombre = 'Escribí un nombre de al menos 3 caracteres.'
    if (!zona.trim()) nuevos.zona = 'Indicá el barrio o la zona del grupo.'
    if (!centro) nuevos.centro = 'Marcá el centro del grupo en el mapa.'
    setErrores(nuevos)
    const primero = Object.keys(nuevos)[0]
    if (primero) { document.getElementById(`grupo-${primero}`)?.focus(); return }

    // Solo se envía lo que cambió
    const cambios: Parameters<typeof api.grupos.actualizar>[1] = {}
    if (nombre.trim() !== grupo.nombre) cambios.nombre = nombre.trim()
    if (zona.trim() !== grupo.zona) cambios.zona = zona.trim()
    if (!grupo.centro || centro!.lat !== grupo.centro.lat || centro!.lng !== grupo.centro.lng) cambios.centro = centro!
    if (radio !== grupo.radioMetros) cambios.radioMetros = radio
    if (Object.keys(cambios).length === 0) { onCerrar(); return }

    setEnviando(true)
    setErrorEnvio('')
    try {
      await api.grupos.actualizar(grupo.id, cambios)
      onGuardado()
      onCerrar()
    } catch (err) {
      setErrorEnvio(mensajeDeError(err))
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={guardar} noValidate>
      <Campo id="grupo-nombre" etiqueta="Nombre del grupo" error={errores.nombre}>
        <input id="grupo-nombre" className="input" type="text" maxLength={60} value={nombre}
          aria-invalid={!!errores.nombre} aria-describedby={errores.nombre ? 'grupo-nombre-error' : undefined}
          onChange={(e) => setNombre(e.target.value)} />
      </Campo>
      <Campo id="grupo-zona" etiqueta="Barrio o zona" error={errores.zona}>
        <input id="grupo-zona" className="input" type="text" maxLength={80} value={zona}
          aria-invalid={!!errores.zona} aria-describedby={errores.zona ? 'grupo-zona-error' : undefined}
          onChange={(e) => setZona(e.target.value)} />
      </Campo>

      <SelectorZonaMapa centro={centro} radio={radio} error={errores.centro}
        radioMaximo={Math.max(RADIO_MAXIMO, grupo.radioMetros ?? 0)}
        onCentro={(c) => { setCentro(c); if (errores.centro) setErrores((x) => ({ ...x, centro: undefined })) }}
        onRadio={setRadio} />

      {quedanAfuera > 0 && (
        <p className="aviso-zona" role="status">
          <Icono nombre="alertas" tamano={18} /> {quedanAfuera === 1 ? '1 incidente activo quedaría' : `${quedanAfuera} incidentes activos quedarían`} fuera del área nueva.
          No se borran, pero ya no se van a poder reportar incidentes nuevos en ese lugar.
        </p>
      )}
      {errorEnvio && <p className="campo__error" role="alert">{errorEnvio}</p>}
      <button type="submit" className="btn btn-primary btn-ancho" disabled={enviando}>{enviando ? 'Guardando…' : 'Guardar cambios'}</button>
    </form>
  )
}
