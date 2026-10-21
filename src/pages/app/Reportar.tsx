import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import Campo from '../../components/Campo'
import Modal from '../../components/Modal'
import MapaEmbed from '../../components/MapaEmbed'
import PedirAyudaModal from '../../components/PedirAyudaModal'
import { api } from '../../api'
import { mensajeDeError } from '../../api/cliente'
import { useCategorias } from '../../context/CategoriasContext'
import { useGrupos } from '../../context/GruposContext'
import { CENTRO_MAPA } from '../../data/mock'

interface FormIncidencia {
  titulo: string
  categoria: string
  descripcion: string
  ubicacion: string
}
type Errores = Partial<Record<keyof FormIncidencia, string>>
interface Foto {
  nombre: string
  url: string
}

const FORM_INICIAL: FormIncidencia = { titulo: '', categoria: '', descripcion: '', ubicacion: '' }
const MAX_FOTO_MB = 5

// Validación en el front: devuelve un objeto { campo: mensaje }
function validar(v: FormIncidencia): Errores {
  const e: Errores = {}
  if (v.titulo.trim().length < 5) e.titulo = 'Escribí un título de al menos 5 caracteres.'
  if (!v.categoria) e.categoria = 'Elegí una categoría.'
  if (v.descripcion.trim().length < 10) e.descripcion = 'Contá qué pasa con al menos 10 caracteres.'
  if (!v.ubicacion.trim()) e.ubicacion = 'Indicá dónde está el problema.'
  return e
}

export default function Reportar() {
  const [vista, setVista] = useState<'opciones' | 'formulario' | 'enviado'>('opciones')
  const [valores, setValores] = useState(FORM_INICIAL)
  const [errores, setErrores] = useState<Errores>({})
  const [foto, setFoto] = useState<Foto | null>(null)
  const [errorFoto, setErrorFoto] = useState('')
  const [avisoUbicacion, setAvisoUbicacion] = useState('')
  const [buscando, setBuscando] = useState(false)
  const [ayudaAbierta, setAyudaAbierta] = useState(false)
  const [mapaAbierto, setMapaAbierto] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [errorEnvio, setErrorEnvio] = useState('')
  const { categorias } = useCategorias()
  const { grupoActivo } = useGrupos()

  function cambiar(campo: keyof FormIncidencia, valor: string) {
    setValores((v) => ({ ...v, [campo]: valor }))
    if (errores[campo]) setErrores((e) => ({ ...e, [campo]: undefined }))
  }

  // Pide la ubicación real al navegador
  function usarMiUbicacion() {
    setAvisoUbicacion('')
    if (!('geolocation' in navigator)) {
      setAvisoUbicacion('Tu navegador no permite obtener la ubicación. Escribila a mano.')
      return
    }
    setBuscando(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        cambiar('ubicacion', `Mi ubicación actual (${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)})`)
        setBuscando(false)
      },
      () => {
        setBuscando(false)
        setAvisoUbicacion('No pudimos obtener tu ubicación. Revisá el permiso del navegador o escribila a mano.')
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  function elegirFoto(e: ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0]
    setErrorFoto('')
    if (!archivo) return
    if (!archivo.type.startsWith('image/')) return setErrorFoto('El archivo tiene que ser una imagen.')
    if (archivo.size > MAX_FOTO_MB * 1024 * 1024) return setErrorFoto(`La foto no puede pesar más de ${MAX_FOTO_MB} MB.`)
    if (foto) URL.revokeObjectURL(foto.url)
    setFoto({ nombre: archivo.name, url: URL.createObjectURL(archivo) })
  }

  async function enviar(e: FormEvent) {
    e.preventDefault()
    const nuevos = validar(valores)
    setErrores(nuevos)
    const primero = Object.keys(nuevos)[0]
    if (primero) {
      document.getElementById(`campo-${primero}`)?.focus() // lleva el foco al primer error
      return
    }
    setEnviando(true)
    setErrorEnvio('')
    try {
      // La foto todavía no se envía (falta definir con el back cómo se sube)
      await api.incidencias.crear({
        titulo: valores.titulo.trim(),
        categoriaId: valores.categoria,
        descripcion: valores.descripcion.trim(),
        ubicacion: valores.ubicacion.trim(),
        grupoId: grupoActivo?.id,
      })
      setVista('enviado')
    } catch (error) {
      setErrorEnvio(mensajeDeError(error))
    } finally {
      setEnviando(false)
    }
  }

  function reiniciar() {
    setValores(FORM_INICIAL)
    setErrores({})
    setFoto(null)
    setVista('opciones')
  }

  if (vista === 'enviado') {
    return (
      <div className="ayuda-ok" role="status">
        <span className="ayuda-ok__icon" aria-hidden="true">✅</span>
        <h2>Incidencia enviada</h2>
        <p>Tus vecinos ya pueden verla en el mapa y confirmarla.</p>
        <div className="stack">
          <Link to="/app/mapa" className="btn btn-primary">Ver el mapa</Link>
          <button type="button" className="btn btn-outline" onClick={reiniciar}>Reportar otra</button>
        </div>
      </div>
    )
  }

  return (
    <>
      {vista === 'opciones' && (
        <>
          <p className="lead">¿Qué querés reportar?</p>
          <div className="opciones-reporte">
            <button type="button" className="opcion-grande" onClick={() => setVista('formulario')}>
              <span className="opcion-grande__icono" aria-hidden="true">📝</span>
              <strong>Incidencia</strong>
              <span>Un problema del barrio: luz, baches, basura, un árbol caído…</span>
            </button>
            <button type="button" className="opcion-grande" onClick={() => setAyudaAbierta(true)}>
              <span className="opcion-grande__icono" aria-hidden="true">🆘</span>
              <strong>Emergencia / Pedir ayuda</strong>
              <span>Aviso inmediato a tu comunidad ante un peligro real.</span>
            </button>
          </div>
        </>
      )}

      {vista === 'formulario' && (
        <form className="formulario" onSubmit={enviar} noValidate>
          <button type="button" className="volver" onClick={() => setVista('opciones')}>← Cambiar tipo de reporte</button>
          <h2>Reportar una incidencia</h2>

          <Campo id="campo-titulo" etiqueta="Título" error={errores.titulo}>
            <input id="campo-titulo" className="input" type="text" maxLength={80} value={valores.titulo}
              aria-invalid={!!errores.titulo} aria-describedby={errores.titulo ? 'campo-titulo-error' : undefined}
              placeholder="Ej.: Luz quemada en la plaza" onChange={(e) => cambiar('titulo', e.target.value)} />
          </Campo>

          <Campo id="campo-categoria" etiqueta="Categoría" error={errores.categoria}>
            <select id="campo-categoria" className="input" value={valores.categoria}
              aria-invalid={!!errores.categoria} aria-describedby={errores.categoria ? 'campo-categoria-error' : undefined}
              onChange={(e) => cambiar('categoria', e.target.value)}>
              <option value="">Elegí una categoría</option>
              {categorias.filter((c) => c.activa).map((c) => <option key={c.id} value={c.id}>{c.icono} {c.nombre}</option>)}
            </select>
          </Campo>

          <Campo id="campo-descripcion" etiqueta="Descripción" error={errores.descripcion}>
            <textarea id="campo-descripcion" className="input textarea" rows={4} maxLength={500} value={valores.descripcion}
              aria-invalid={!!errores.descripcion} aria-describedby={errores.descripcion ? 'campo-descripcion-error' : undefined}
              placeholder="¿Qué pasa? ¿Desde cuándo? ¿A quién afecta?" onChange={(e) => cambiar('descripcion', e.target.value)} />
          </Campo>

          <Campo id="campo-ubicacion" etiqueta="Ubicación" error={errores.ubicacion}
            ayuda="Escribí la dirección o usá uno de los botones.">
            <input id="campo-ubicacion" className="input" type="text" value={valores.ubicacion}
              aria-invalid={!!errores.ubicacion}
              aria-describedby={`campo-ubicacion-ayuda${errores.ubicacion ? ' campo-ubicacion-error' : ''}`}
              placeholder="Ej.: Calle Los Olmos 120" onChange={(e) => cambiar('ubicacion', e.target.value)} />
          </Campo>
          <div className="ubicacion-botones">
            <button type="button" className="btn btn-outline" onClick={usarMiUbicacion} disabled={buscando}>
              {buscando ? 'Buscando…' : '📍 Usar mi ubicación'}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => setMapaAbierto(true)}>🗺️ Elegir en el mapa</button>
          </div>
          {avisoUbicacion && <p className="campo__error" role="alert">{avisoUbicacion}</p>}

          <Campo id="campo-foto" etiqueta="Foto (opcional)" error={errorFoto} ayuda={`Una imagen de hasta ${MAX_FOTO_MB} MB.`}>
            <input id="campo-foto" className="input input--archivo" type="file" accept="image/*"
              aria-describedby={`campo-foto-ayuda${errorFoto ? ' campo-foto-error' : ''}`} onChange={elegirFoto} />
          </Campo>
          {foto && <img className="foto-previa" src={foto.url} alt={`Vista previa de ${foto.nombre}`} />}

          {errorEnvio && <p className="campo__error" role="alert">{errorEnvio}</p>}
          <button type="submit" className="btn btn-primary btn-ancho" disabled={enviando}>
            {enviando ? 'Enviando…' : 'Enviar reporte'}
          </button>
        </form>
      )}

      <PedirAyudaModal abierto={ayudaAbierta} onCerrar={() => setAyudaAbierta(false)} />

      <Modal abierto={mapaAbierto} onCerrar={() => setMapaAbierto(false)} titulo="Elegir en el mapa">
        <MapaEmbed lat={CENTRO_MAPA.lat} lng={CENTRO_MAPA.lng} zoom={15} titulo="Mapa para elegir la ubicación" className="map-frame--chico" />
        <p className="map-nota">Mapa de ejemplo. Más adelante vas a poder mover un pin para marcar el punto exacto.</p>
        <button type="button" className="btn btn-primary btn-ancho"
          onClick={() => { cambiar('ubicacion', 'Punto elegido en el mapa (ejemplo)'); setMapaAbierto(false) }}>
          Usar esta ubicación
        </button>
      </Modal>
    </>
  )
}
