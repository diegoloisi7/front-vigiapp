import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { CENTRO_MAPA } from '../data/mock'
import { buscarDirecciones, nombreDeUbicacion, textoCoordenadas, type ResultadoBusqueda } from '../utils/geocodificacion'
import { obtenerUbicacion, type Coordenadas } from '../utils/ubicacion'
import { RADIO_MAXIMO, RADIO_MINIMO, textoCuadras, textoRadio } from '../utils/zona'
import Icono, { iconoSvgHtml } from './vecino/Icono'

interface Props {
  centro: Coordenadas | null
  radio: number // en metros
  onCentro: (centro: Coordenadas) => void
  onRadio: (radio: number) => void
  error?: string
  radioMaximo?: number // por defecto RADIO_MAXIMO
}

const ICONO_CENTRO = L.divIcon({
  className: 'pin-wrap',
  html: `<div class="pin-propio"><span class="vg-pin vg-pin--comunidad">${iconoSvgHtml('inicio', 20)}</span></div>`,
  iconSize: [38, 46],
  iconAnchor: [19, 46],
})

// Toma el color de marca del tema actual (claro u oscuro) para dibujar el círculo
const colorDeMarca = () => getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#1F4E79'

// Selector del área de un grupo: centro (tocando el mapa, arrastrando el pin, buscando una dirección
// o con la ubicación actual) y radio con un deslizador que dibuja el círculo en vivo.
export default function SelectorZonaMapa({ centro, radio, onCentro, onRadio, error, radioMaximo = RADIO_MAXIMO }: Props) {
  const elemento = useRef<HTMLDivElement>(null)
  const mapa = useRef<L.Map | null>(null)
  const marcador = useRef<L.Marker | null>(null)
  const circulo = useRef<L.Circle | null>(null)
  const alElegir = useRef(onCentro)
  alElegir.current = onCentro

  const [busqueda, setBusqueda] = useState('')
  const [resultados, setResultados] = useState<ResultadoBusqueda[] | null>(null)
  const [buscando, setBuscando] = useState(false)
  const [ubicando, setUbicando] = useState(false)
  const [aviso, setAviso] = useState('')
  const [direccion, setDireccion] = useState('')

  // Crea el mapa una sola vez
  useEffect(() => {
    const el = elemento.current
    if (!el) return
    const inicio = centro ?? CENTRO_MAPA
    const m = L.map(el, { zoomControl: true }).setView([inicio.lat, inicio.lng], centro ? 15 : 13)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(m)
    m.on('click', (e: L.LeafletMouseEvent) => alElegir.current({ lat: e.latlng.lat, lng: e.latlng.lng }))
    mapa.current = m
    const observador = new ResizeObserver(() => m.invalidateSize())
    observador.observe(el)
    return () => {
      observador.disconnect()
      m.remove()
      mapa.current = null
      marcador.current = null
      circulo.current = null
    }
    // El mapa se crea una vez; el centro inicial solo define la vista de arranque
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sincroniza el pin y el círculo con el centro y el radio
  useEffect(() => {
    const m = mapa.current
    if (!m) return
    if (!centro) {
      marcador.current?.remove(); marcador.current = null
      circulo.current?.remove(); circulo.current = null
      return
    }
    const punto: L.LatLngTuple = [centro.lat, centro.lng]
    if (!marcador.current) {
      marcador.current = L.marker(punto, { icon: ICONO_CENTRO, draggable: true, keyboard: true, title: 'Centro del grupo (podés arrastrarlo)' }).addTo(m)
      marcador.current.on('dragend', () => {
        const p = marcador.current?.getLatLng()
        if (p) alElegir.current({ lat: p.lat, lng: p.lng })
      })
    } else {
      marcador.current.setLatLng(punto)
    }
    if (!circulo.current) {
      const color = colorDeMarca()
      circulo.current = L.circle(punto, { radius: radio, color, fillColor: color, fillOpacity: 0.1, weight: 2 }).addTo(m)
    } else {
      circulo.current.setLatLng(punto).setRadius(radio)
    }
    // Encuadra el área completa (con una pequeña demora para no saltar mientras se mueve el deslizador)
    const id = window.setTimeout(() => {
      if (circulo.current) m.fitBounds(circulo.current.getBounds(), { padding: [24, 24], maxZoom: 17 })
    }, 200)
    return () => window.clearTimeout(id)
  }, [centro, radio])

  // Muestra la dirección aproximada del centro (con demora, para no saturar el servicio)
  useEffect(() => {
    if (!centro) { setDireccion(''); return }
    const control = new AbortController()
    setDireccion('')
    const id = window.setTimeout(() => {
      void nombreDeUbicacion(centro, control.signal).then((nombre) => setDireccion(nombre ?? textoCoordenadas(centro)))
    }, 700)
    return () => { window.clearTimeout(id); control.abort() }
  }, [centro])

  async function buscar() {
    if (busqueda.trim().length < 3) { setAviso('Escribí al menos 3 letras de la dirección.'); return }
    setAviso('')
    setBuscando(true)
    const encontrados = await buscarDirecciones(busqueda)
    setBuscando(false)
    setResultados(encontrados)
    if (encontrados.length === 0) setAviso('No encontramos esa dirección. Probá con calle y altura, o tocá el mapa.')
  }

  // Enter en el buscador busca la dirección (y no envía el formulario del grupo)
  function alTeclear(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { e.preventDefault(); void buscar() }
  }

  function elegirResultado(r: ResultadoBusqueda) {
    setResultados(null)
    setBusqueda(r.nombre)
    onCentro(r.punto)
  }

  async function usarMiUbicacion() {
    setAviso('')
    setUbicando(true)
    const posicion = await obtenerUbicacion(10000)
    setUbicando(false)
    if (posicion) onCentro(posicion)
    else setAviso('No pudimos obtener tu ubicación. Revisá el permiso del navegador o buscá la dirección.')
  }

  return (
    <fieldset className="zona-mapa">
      <legend>Zona del grupo</legend>
      <p className="campo__ayuda">Marcá el centro del barrio y ajustá el radio: los incidentes solo se pueden reportar dentro de esa área.</p>

      <div className="zona-mapa__buscador">
        <label htmlFor="grupo-centro" className="sr-only">Buscar una dirección</label>
        <input id="grupo-centro" className="input" type="search" value={busqueda} placeholder="Buscá una calle o un lugar"
          aria-invalid={!!error} aria-describedby={error ? 'grupo-centro-error' : undefined}
          onChange={(e) => setBusqueda(e.target.value)} onKeyDown={alTeclear} />
        <button type="button" className="btn btn-outline" onClick={() => void buscar()} disabled={buscando}>{buscando ? 'Buscando…' : 'Buscar'}</button>
      </div>
      {resultados && resultados.length > 0 && (
        <ul className="zona-mapa__resultados" aria-label="Resultados de la búsqueda">
          {resultados.map((r) => (
            <li key={`${r.punto.lat},${r.punto.lng}`}>
              <button type="button" onClick={() => elegirResultado(r)}><Icono nombre="pin" tamano={16} /> {r.nombre}</button>
            </li>
          ))}
        </ul>
      )}
      <button type="button" className="btn btn-ghost zona-mapa__ubicacion" onClick={() => void usarMiUbicacion()} disabled={ubicando}>
        {ubicando ? 'Buscando tu ubicación…' : <><Icono nombre="radio" tamano={18} /> Usar mi ubicación</>}
      </button>
      {aviso && <p className="campo__error" role="alert">{aviso}</p>}

      <div className="mapa-contenedor">
        <div ref={elemento} className="map-frame zona-mapa__mapa" role="application" aria-label="Mapa para marcar el centro del grupo" />
        {!centro && <p className="mapa-aviso">Tocá el mapa para marcar el centro</p>}
      </div>
      <p className="zona-mapa__direccion" aria-live="polite">
        {centro ? <><Icono nombre="pin" tamano={16} /> {direccion || 'Buscando la dirección…'}</> : 'Todavía no marcaste el centro.'}
      </p>
      {error && <p id="grupo-centro-error" className="campo__error" role="alert">{error}</p>}

      <div className="zona-mapa__radio">
        <label htmlFor="grupo-radio">Radio: <strong>{textoRadio(radio)}</strong> <span>({textoCuadras(radio)})</span></label>
        <input id="grupo-radio" type="range" min={RADIO_MINIMO} max={radioMaximo} step={50} value={radio}
          aria-valuetext={`${textoRadio(radio)}, ${textoCuadras(radio)}`}
          onChange={(e) => onRadio(Number(e.target.value))} />
        <div className="zona-mapa__escala" aria-hidden="true"><span>{textoRadio(RADIO_MINIMO)}</span><span>{textoRadio(radioMaximo)}</span></div>
      </div>

      <details className="zona-mapa__manual">
        <summary>Ingresar coordenadas a mano</summary>
        <CoordenadasManuales centro={centro} onCentro={onCentro} />
      </details>
    </fieldset>
  )
}

// Alternativa accesible y precisa: escribir latitud y longitud
function CoordenadasManuales({ centro, onCentro }: { centro: Coordenadas | null; onCentro: (c: Coordenadas) => void }) {
  const [lat, setLat] = useState(centro ? String(centro.lat) : '')
  const [lng, setLng] = useState(centro ? String(centro.lng) : '')
  const [error, setError] = useState('')

  // Si el centro cambia desde el mapa, se actualizan los campos
  useEffect(() => {
    if (centro) { setLat(centro.lat.toFixed(6)); setLng(centro.lng.toFixed(6)) }
  }, [centro])

  function aplicar() {
    const la = Number(lat), lo = Number(lng)
    if (lat === '' || lng === '' || !Number.isFinite(la) || !Number.isFinite(lo) || Math.abs(la) > 90 || Math.abs(lo) > 180) {
      setError('Latitud entre -90 y 90, y longitud entre -180 y 180.')
      return
    }
    setError('')
    onCentro({ lat: la, lng: lo })
  }

  return (
    <div className="zona-mapa__coords">
      <div className="campo">
        <label htmlFor="grupo-lat">Latitud</label>
        <input id="grupo-lat" className="input" type="number" step="any" inputMode="decimal" value={lat} onChange={(e) => setLat(e.target.value)} />
      </div>
      <div className="campo">
        <label htmlFor="grupo-lng">Longitud</label>
        <input id="grupo-lng" className="input" type="number" step="any" inputMode="decimal" value={lng} onChange={(e) => setLng(e.target.value)} />
      </div>
      <button type="button" className="btn btn-outline" onClick={aplicar}>Aplicar coordenadas</button>
      {error && <p className="campo__error" role="alert">{error}</p>}
    </div>
  )
}
