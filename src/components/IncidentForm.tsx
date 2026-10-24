import { useEffect, useState, type ChangeEvent, type CSSProperties } from 'react'
import { api } from '../api'
import { USAR_MOCK } from '../api/config'
import { mensajeDeError } from '../api/cliente'
import Campo from './Campo'
import { colorDeCategoria } from '../data/incidentTypes'
import { nombreDeUbicacion, textoCoordenadas } from '../utils/geocodificacion'
import { obtenerUbicacion, type Coordenadas } from '../utils/ubicacion'
import type { Categoria, Incidencia } from '../types'

// Flujo para reportar un incidente desde el mapa, en 4 pasos:
// 1) categoría · 2) ubicación (tocar el mapa) · 3) datos · 4) revisar y confirmar.
// El incidente solo se da por registrado cuando la API responde bien.
interface Props {
  categorias: Categoria[]
  grupoId?: number
  punto: Coordenadas | null // marcador provisional (lo maneja el mapa)
  onCambiarPunto: (punto: Coordenadas) => void
  onCancelar: () => void
  onEnviado: (creada: Incidencia) => void
}

type Paso = 'categoria' | 'ubicacion' | 'datos' | 'revisar'
const PASOS: Paso[] = ['categoria', 'ubicacion', 'datos', 'revisar']
const MAX_FOTO_MB = 5
const VIGENCIAS = [
  { dias: 1, texto: '24 horas' },
  { dias: 3, texto: '3 días' },
  { dias: 7, texto: '7 días' },
  { dias: 30, texto: '30 días' },
]

interface Foto { nombre: string; url: string; archivo: File }
interface Errores { titulo?: string; descripcion?: string; foto?: string }

export default function IncidentForm({ categorias, grupoId, punto, onCambiarPunto, onCancelar, onEnviado }: Props) {
  const [paso, setPaso] = useState<Paso>('categoria')
  const [categoriaId, setCategoriaId] = useState('')
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [vigenciaDias, setVigenciaDias] = useState(7)
  const [foto, setFoto] = useState<Foto | null>(null)
  const [errores, setErrores] = useState<Errores>({})
  const [aviso, setAviso] = useState('')
  const [buscandoGps, setBuscandoGps] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [errorEnvio, setErrorEnvio] = useState('')

  // Nombre del lugar donde está el marcador (se busca un instante después de moverlo)
  const lat = punto?.lat
  const lng = punto?.lng
  const clave = lat === undefined || lng === undefined ? '' : `${lat},${lng}`
  const [nombre, setNombre] = useState<{ clave: string; texto: string | null }>({ clave: '', texto: null })
  useEffect(() => {
    if (lat === undefined || lng === undefined) return
    const control = new AbortController()
    const espera = window.setTimeout(async () => {
      const texto = await nombreDeUbicacion({ lat, lng }, control.signal)
      if (!control.signal.aborted) setNombre({ clave: `${lat},${lng}`, texto })
    }, 500)
    return () => { window.clearTimeout(espera); control.abort() }
  }, [lat, lng])
  const buscandoNombre = clave !== '' && nombre.clave !== clave
  const nombreLugar = nombre.clave === clave ? nombre.texto : null
  const ubicacionTexto = punto ? (nombreLugar ?? `Punto en el mapa (${textoCoordenadas(punto)})`) : ''

  const categoria = categorias.find((c) => c.id === categoriaId)
  const indice = PASOS.indexOf(paso)

  async function usarMiUbicacion() {
    setAviso('')
    setBuscandoGps(true)
    const posicion = await obtenerUbicacion(10000)
    setBuscandoGps(false)
    if (posicion) onCambiarPunto(posicion)
    else setAviso('No pudimos obtener tu ubicación. Revisá el permiso del navegador o tocá el mapa.')
  }

  function elegirFoto(e: ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0]
    setErrores((x) => ({ ...x, foto: undefined }))
    if (!archivo) return
    if (!archivo.type.startsWith('image/')) return setErrores((x) => ({ ...x, foto: 'El archivo tiene que ser una imagen.' }))
    if (archivo.size > MAX_FOTO_MB * 1024 * 1024) return setErrores((x) => ({ ...x, foto: `La foto no puede pesar más de ${MAX_FOTO_MB} MB.` }))
    if (foto) URL.revokeObjectURL(foto.url)
    setFoto({ nombre: archivo.name, url: URL.createObjectURL(archivo), archivo })
  }

  function quitarFoto() {
    if (foto) URL.revokeObjectURL(foto.url)
    setFoto(null)
  }

  function cancelar() {
    if (foto) URL.revokeObjectURL(foto.url)
    onCancelar()
  }

  function irARevisar() {
    const nuevos: Errores = { foto: errores.foto }
    if (titulo.trim().length < 5) nuevos.titulo = 'Escribí un título de al menos 5 caracteres.'
    if (descripcion.trim().length < 10) nuevos.descripcion = 'Contá qué pasa con al menos 10 caracteres.'
    setErrores(nuevos)
    if (nuevos.titulo) return document.getElementById('form-titulo')?.focus()
    if (nuevos.descripcion) return document.getElementById('form-descripcion')?.focus()
    if (nuevos.foto) return
    setPaso('revisar')
  }

  async function confirmar() {
    if (!punto || !categoriaId) return
    setEnviando(true)
    setErrorEnvio('')
    try {
      const creada = await api.incidencias.crear({
        titulo: titulo.trim(),
        categoriaId,
        descripcion: descripcion.trim(),
        ubicacion: ubicacionTexto,
        lat: punto.lat,
        lng: punto.lng,
        foto: foto?.archivo ?? null,
        grupoId,
        vigenciaDias,
      })
      onEnviado(creada) // recién acá el padre actualiza el mapa
    } catch (e) {
      setErrorEnvio(mensajeDeError(e))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="reporte-mapa" aria-label="Reportar un incidente">
      <header className="reporte-mapa__head">
        <h3>Reportar incidente</h3>
        <button type="button" className="btn btn-ghost" onClick={cancelar} disabled={enviando}>Cancelar</button>
      </header>
      <p className="reporte-mapa__paso" aria-live="polite">Paso {indice + 1} de {PASOS.length}</p>
      <progress className="reporte-mapa__barra" max={PASOS.length} value={indice + 1} aria-hidden="true" />

      {paso === 'categoria' && (
        <>
          <p className="lead">¿Qué tipo de incidente es?</p>
          <div className="categorias-grid" role="group" aria-label="Categoría">
            {categorias.filter((c) => c.activa).map((c) => (
              <button key={c.id} type="button" className={`categoria-op ${categoriaId === c.id ? 'is-active' : ''}`}
                style={{ '--pin': colorDeCategoria(c.id) } as CSSProperties}
                aria-pressed={categoriaId === c.id} onClick={() => setCategoriaId(c.id)}>
                <span aria-hidden="true">{c.icono}</span>{c.nombre}
              </button>
            ))}
          </div>
          <button type="button" className="btn btn-primary btn-ancho" disabled={!categoriaId} onClick={() => setPaso('ubicacion')}>Siguiente</button>
        </>
      )}

      {paso === 'ubicacion' && (
        <>
          <p className="lead">Marcá el lugar en el mapa</p>
          <p className="map-nota">Tocá el mapa donde ocurre el incidente. Después podés arrastrar el pin para ajustarlo.</p>
          <button type="button" className="btn btn-outline btn-ancho" onClick={usarMiUbicacion} disabled={buscandoGps}>
            {buscandoGps ? 'Buscando…' : '📍 Usar mi ubicación'}
          </button>
          {aviso && <p className="campo__error" role="alert">{aviso}</p>}
          <p className="map-lugar" role="status" aria-live="polite">
            {!punto ? 'Todavía no marcaste ningún punto.' : buscandoNombre ? '📍 Buscando el nombre del lugar…' : `📍 ${ubicacionTexto}`}
          </p>
          <div className="reporte-mapa__botones">
            <button type="button" className="btn btn-outline" onClick={() => setPaso('categoria')}>Atrás</button>
            <button type="button" className="btn btn-primary" disabled={!punto || buscandoNombre} onClick={() => setPaso('datos')}>Siguiente</button>
          </div>
        </>
      )}

      {paso === 'datos' && (
        <div className="formulario formulario--panel">
          <Campo id="form-titulo" etiqueta="Título" error={errores.titulo}>
            <input id="form-titulo" className="input" type="text" maxLength={80} value={titulo} aria-invalid={!!errores.titulo}
              aria-describedby={errores.titulo ? 'form-titulo-error' : undefined} placeholder="Ej.: Luz quemada en la plaza"
              onChange={(e) => { setTitulo(e.target.value); setErrores((x) => ({ ...x, titulo: undefined })) }} />
          </Campo>
          <Campo id="form-descripcion" etiqueta="Descripción" error={errores.descripcion}>
            <textarea id="form-descripcion" className="input textarea" rows={4} maxLength={500} value={descripcion} aria-invalid={!!errores.descripcion}
              aria-describedby={errores.descripcion ? 'form-descripcion-error' : undefined} placeholder="¿Qué pasa? ¿Desde cuándo? ¿A quién afecta?"
              onChange={(e) => { setDescripcion(e.target.value); setErrores((x) => ({ ...x, descripcion: undefined })) }} />
          </Campo>
          <Campo id="form-vigencia" etiqueta="Vigencia" ayuda="Pasado ese tiempo, si no se resolvió, el incidente expira.">
            <select id="form-vigencia" className="input" value={vigenciaDias} aria-describedby="form-vigencia-ayuda"
              onChange={(e) => setVigenciaDias(Number(e.target.value))}>
              {VIGENCIAS.map((v) => <option key={v.dias} value={v.dias}>{v.texto}</option>)}
            </select>
          </Campo>
          <Campo id="form-foto" etiqueta="Foto (opcional)" error={errores.foto} ayuda={`Una imagen de hasta ${MAX_FOTO_MB} MB.`}>
            <input id="form-foto" className="input input--archivo" type="file" accept="image/*"
              aria-describedby={`form-foto-ayuda${errores.foto ? ' form-foto-error' : ''}`} onChange={elegirFoto} />
          </Campo>
          {foto && (
            <div className="foto-contenida">
              <img src={foto.url} alt={`Vista previa de ${foto.nombre}`} />
              <button type="button" className="btn btn-ghost" onClick={quitarFoto}>Quitar foto</button>
            </div>
          )}
          <div className="reporte-mapa__botones">
            <button type="button" className="btn btn-outline" onClick={() => setPaso('ubicacion')}>Atrás</button>
            <button type="button" className="btn btn-primary" onClick={irARevisar}>Revisar</button>
          </div>
        </div>
      )}

      {paso === 'revisar' && (
        <>
          <p className="lead">Revisá antes de enviar</p>
          <dl className="panel-incidente__datos">
            <div><dt>Categoría</dt><dd>{categoria?.icono} {categoria?.nombre}</dd></div>
            <div><dt>Título</dt><dd>{titulo.trim()}</dd></div>
            <div><dt>Descripción</dt><dd>{descripcion.trim()}</dd></div>
            <div><dt>📍 Ubicación</dt><dd>{ubicacionTexto}</dd></div>
            <div><dt>Vigencia</dt><dd>{VIGENCIAS.find((v) => v.dias === vigenciaDias)?.texto}</dd></div>
          </dl>
          {foto && <div className="foto-contenida"><img src={foto.url} alt={`Foto adjunta: ${foto.nombre}`} /></div>}
          {USAR_MOCK && <p className="map-nota">Modo de prueba: no hay servidor conectado, el reporte se guarda solo en memoria y se pierde al recargar.</p>}
          {errorEnvio && <p className="campo__error" role="alert">{errorEnvio}</p>}
          <div className="reporte-mapa__botones">
            <button type="button" className="btn btn-outline" disabled={enviando} onClick={() => setPaso('datos')}>Editar</button>
            <button type="button" className="btn btn-primary" disabled={enviando} onClick={confirmar}>{enviando ? 'Enviando…' : 'Confirmar y enviar'}</button>
          </div>
        </>
      )}
    </section>
  )
}
