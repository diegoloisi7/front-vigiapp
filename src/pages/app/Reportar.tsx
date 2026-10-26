import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api'
import { mensajeDeError } from '../../api/cliente'
import { useCategorias } from '../../context/CategoriasContext'
import { useGrupos } from '../../context/GruposContext'
import Campo from '../../components/Campo'
import IconoCategoria, { iconoDeCategoria } from '../../components/IconoCategoria'
import Modal from '../../components/Modal'
import IncidentMap from '../../components/IncidentMap'
import PedirAyudaModal from '../../components/PedirAyudaModal'
import { CENTRO_MAPA } from '../../data/mock'
import { nombreDeUbicacion, textoCoordenadas } from '../../utils/geocodificacion'
import { obtenerUbicacion, type Coordenadas } from '../../utils/ubicacion'

interface FormIncidente {
  titulo: string
  categoria: string
  descripcion: string
  ubicacion: string
}
type Errores = Partial<Record<keyof FormIncidente, string>>
interface Foto {
  nombre: string
  url: string // URL local solo para la vista previa
  archivo: File // el archivo que se envía
}

const FORM_INICIAL: FormIncidente = { titulo: '', categoria: '', descripcion: '', ubicacion: '' }
const MAX_FOTO_MB = 5
const VIGENCIAS = [
  { dias: 1, texto: '24 horas' },
  { dias: 3, texto: '3 días' },
  { dias: 7, texto: '7 días' },
  { dias: 30, texto: '30 días' },
]

// Validación en el front de un incidente NORMAL (todos los datos son obligatorios)
function validar(v: FormIncidente): Errores {
  const e: Errores = {}
  if (v.titulo.trim().length < 5) e.titulo = 'Escribí un título de al menos 5 caracteres.'
  if (!v.categoria) e.categoria = 'Elegí una categoría.'
  if (v.descripcion.trim().length < 10) e.descripcion = 'Contá qué pasa con al menos 10 caracteres.'
  if (!v.ubicacion.trim()) e.ubicacion = 'Indicá dónde está el problema.'
  return e
}

export default function Reportar() {
  const [vista, setVista] = useState<'opciones' | 'formulario' | 'enviado'>('opciones')
  const [valores, setValores] = useState<FormIncidente>(FORM_INICIAL)
  const [vigenciaDias, setVigenciaDias] = useState(7)
  const [errores, setErrores] = useState<Errores>({})
  const [foto, setFoto] = useState<Foto | null>(null)
  const [errorFoto, setErrorFoto] = useState('')
  const [avisoUbicacion, setAvisoUbicacion] = useState('')
  const [buscando, setBuscando] = useState(false)
  const [ayudaAbierta, setAyudaAbierta] = useState(false)
  const [mapaAbierto, setMapaAbierto] = useState(false)
  const [coords, setCoords] = useState<Coordenadas | null>(null) // punto elegido (mapa o ubicación actual)
  const [puntoMapa, setPuntoMapa] = useState<Coordenadas | null>(null) // pin actual dentro del modal
  const [nombrePunto, setNombrePunto] = useState('') // nombre del lugar donde está el pin
  const [buscandoNombre, setBuscandoNombre] = useState(false)
  const temporizador = useRef<number | undefined>(undefined)
  const controlador = useRef<AbortController | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [errorEnvio, setErrorEnvio] = useState('')
  const { categorias } = useCategorias()
  const { grupoActivo } = useGrupos()

  function cambiar(campo: keyof FormIncidente, valor: string) {
    setValores((v) => ({ ...v, [campo]: valor }))
    if (errores[campo]) setErrores((e) => ({ ...e, [campo]: undefined }))
  }

  // Pide la ubicación real al navegador
  async function usarMiUbicacion() {
    setAvisoUbicacion('')
    setBuscando(true)
    const posicion = await obtenerUbicacion(10000)
    setBuscando(false)
    if (!posicion) {
      setBuscando(false)
      return setAvisoUbicacion('No pudimos obtener tu ubicación. Revisá el permiso del navegador o escribila a mano.')
    }
    // Se muestra el nombre del lugar; si no se puede obtener, se deja una referencia con las coordenadas
    const nombre = await nombreDeUbicacion(posicion)
    setBuscando(false)
    setCoords(posicion)
    cambiar('ubicacion', nombre ?? `Mi ubicación actual (${textoCoordenadas(posicion)})`)
  }

  function cancelarBusquedaNombre() {
    window.clearTimeout(temporizador.current)
    controlador.current?.abort()
  }

  // Cada vez que se mueve el pin se busca (con una pequeña espera) el nombre del lugar
  function moverPin(punto: Coordenadas) {
    cancelarBusquedaNombre()
    setPuntoMapa(punto)
    setNombrePunto('')
    setBuscandoNombre(true)
    const control = new AbortController()
    controlador.current = control
    temporizador.current = window.setTimeout(async () => {
      const nombre = await nombreDeUbicacion(punto, control.signal)
      if (control.signal.aborted) return
      setNombrePunto(nombre ?? '')
      setBuscandoNombre(false)
    }, 500)
  }

  function abrirMapa() {
    setMapaAbierto(true)
    if (coords) return moverPin(coords) // ya había un punto: se parte desde ahí
    setPuntoMapa(null)
    setNombrePunto('')
    setBuscandoNombre(false)
  }

  function cerrarMapa() {
    cancelarBusquedaNombre()
    setBuscandoNombre(false)
    setMapaAbierto(false)
  }

  function usarPunto() {
    if (!puntoMapa) return
    setCoords(puntoMapa)
    cambiar('ubicacion', nombrePunto || `Punto en el mapa (${textoCoordenadas(puntoMapa)})`)
    cerrarMapa()
  }

  function elegirFoto(e: ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0]
    setErrorFoto('')
    if (!archivo) return
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(archivo.type)) return setErrorFoto('Elegí una imagen JPG, PNG, WebP o GIF.')
    if (archivo.size > MAX_FOTO_MB * 1024 * 1024) return setErrorFoto(`La foto no puede pesar más de ${MAX_FOTO_MB} MB.`)
    if (foto) URL.revokeObjectURL(foto.url)
    setFoto({ nombre: archivo.name, url: URL.createObjectURL(archivo), archivo })
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
    if (!coords) {
      setErrorEnvio('Elegí un punto en el mapa o usá tu ubicación antes de enviar.')
      return
    }
    setEnviando(true)
    setErrorEnvio('')
    try {
      await api.incidencias.crear({
        titulo: valores.titulo.trim(),
        categoriaId: valores.categoria,
        descripcion: valores.descripcion.trim(),
        ubicacion: valores.ubicacion.trim(),
        lat: coords.lat,
        lng: coords.lng,
        foto: foto?.archivo ?? null,
        grupoId: grupoActivo?.id,
        vigenciaDias,
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
    setVigenciaDias(7)
    setErrores({})
    if (foto) URL.revokeObjectURL(foto.url)
    setFoto(null)
    setCoords(null)
    setVista('opciones')
  }

  if (vista === 'enviado') {
    return (
      <div className="ayuda-ok" role="status">
        <span className="ayuda-ok__icon" aria-hidden="true">✅</span>
        <h2>Incidente enviado</h2>
        <p>Tu grupo ya puede verlo en el mapa y confirmarlo. Lo vas a encontrar en «Mis incidentes» para actualizarlo o cerrarlo.</p>
        <div className="stack">
          <Link to="/app/incidentes" className="btn btn-primary">Ver incidentes</Link>
          <button type="button" className="btn btn-outline" onClick={reiniciar}>Reportar otro</button>
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
              <strong>Incidente normal</strong>
              <span>Un problema del barrio: luz, baches, basura, un árbol caído… Completás los datos ahora.</span>
            </button>
            <button type="button" className="opcion-grande" onClick={() => setAyudaAbierta(true)}>
              <span className="opcion-grande__icono" aria-hidden="true">🆘</span>
              <strong>Urgente · Pedir ayuda</strong>
              <span>Mantenés presionado 3 s y avisás a tu grupo con tu ubicación actual. Los datos se completan después.</span>
            </button>
          </div>
        </>
      )}

      {vista === 'formulario' && (
        <form className="formulario" onSubmit={enviar} noValidate>
          <button type="button" className="volver" onClick={() => setVista('opciones')}>← Cambiar tipo de reporte</button>
          <h2>Reportar un incidente</h2>

          <Campo id="campo-titulo" etiqueta="Título" error={errores.titulo}>
            <input id="campo-titulo" className="input" type="text" maxLength={80} value={valores.titulo}
              aria-invalid={!!errores.titulo} aria-describedby={errores.titulo ? 'campo-titulo-error' : undefined}
              placeholder="Ej.: Luz quemada en la plaza" onChange={(e) => cambiar('titulo', e.target.value)} />
          </Campo>

          <Campo id="campo-categoria" etiqueta="Categoría" error={errores.categoria}>
            <div className="categoria-seleccion">
              <select id="campo-categoria" className="input" value={valores.categoria}
                aria-invalid={!!errores.categoria} aria-describedby={errores.categoria ? 'campo-categoria-error' : undefined}
                onChange={(e) => cambiar('categoria', e.target.value)}>
                <option value="">Elegí una categoría</option>
                {categorias.filter((c) => c.activa).map((c) => <option key={c.id} value={c.id}>{iconoDeCategoria(c.icono)} {c.nombre}</option>)}
              </select>
              {valores.categoria && <IconoCategoria icono={categorias.find((c) => c.id === valores.categoria)?.icono} />}
            </div>
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
              placeholder="Ej.: Calle Los Olmos 120"
              onChange={(e) => { setCoords(null); cambiar('ubicacion', e.target.value) }} />
          </Campo>
          <div className="ubicacion-botones">
            <button type="button" className="btn btn-outline" onClick={usarMiUbicacion} disabled={buscando}>
              {buscando ? 'Buscando…' : '📍 Usar mi ubicación'}
            </button>
            <button type="button" className="btn btn-outline" onClick={abrirMapa}>🗺️ Elegir en el mapa</button>
          </div>
          {avisoUbicacion && <p className="campo__error" role="alert">{avisoUbicacion}</p>}

          <Campo id="campo-vigencia" etiqueta="Vigencia" ayuda="Pasado ese tiempo, si no se resolvió, el incidente expira.">
            <select id="campo-vigencia" className="input" value={vigenciaDias} aria-describedby="campo-vigencia-ayuda"
              onChange={(e) => setVigenciaDias(Number(e.target.value))}>
              {VIGENCIAS.map((v) => <option key={v.dias} value={v.dias}>{v.texto}</option>)}
            </select>
          </Campo>

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

      <Modal abierto={mapaAbierto} onCerrar={cerrarMapa} titulo="Elegir en el mapa">
        <IncidentMap incidencias={[]} centro={coords ?? grupoActivo?.centro ?? CENTRO_MAPA} radioMetros={grupoActivo?.radioMetros} zoom={16} className="map-frame--selector"
          etiqueta="Mapa para elegir la ubicación: tocá el mapa o arrastrá el pin"
          eligiendo={{ punto: puntoMapa, onElegir: moverPin }} />
        <p className="map-lugar" role="status" aria-live="polite">
          📍 {!puntoMapa ? 'Todavía no marcaste ningún punto.' : buscandoNombre ? 'Buscando el nombre del lugar…'
            : nombrePunto || `Sin nombre disponible (${textoCoordenadas(puntoMapa)})`}
        </p>
        <button type="button" className="btn btn-primary btn-ancho" disabled={!puntoMapa || buscandoNombre} onClick={usarPunto}>
          Usar esta ubicación
        </button>
      </Modal>
    </>
  )
}
