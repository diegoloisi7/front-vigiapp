import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useCategorias } from '../context/CategoriasContext'
import { COLOR_PROVISIONAL, estiloIncidencia } from '../data/incidentTypes'
import type { Incidencia } from '../types'
import type { Coordenadas } from '../utils/ubicacion'

// Mapa interactivo (Leaflet + OpenStreetMap):
//  · muestra los incidentes con un marcador por categoría (ícono + color) y permite seleccionarlos;
//  · en "modo elegir ubicación" permite tocar el mapa para poner (y arrastrar) un marcador provisional.
// Los marcadores se actualizan sin recrear el mapa, así los filtros no pierden la posición ni el zoom.

export interface EleccionUbicacion {
  punto: Coordenadas | null // marcador provisional actual
  onElegir: (punto: Coordenadas) => void
}

interface Props {
  incidencias: Incidencia[]
  seleccionId?: number | null
  onSeleccionar?: (id: number) => void
  eligiendo?: EleccionUbicacion // si se pasa, el mapa está en modo "elegir ubicación"
  centro: Coordenadas
  zoom?: number
  ajustarAlCargar?: boolean // encuadra todos los marcadores la primera vez que hay datos
  className?: string
  etiqueta: string
}

const escapar = (t: string) => t.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)

function crearIcono(color: string, icono: string, seleccionado: boolean, urgente: boolean): L.DivIcon {
  const clases = `pin${seleccionado ? ' pin--sel' : ''}${urgente ? ' pin--urgente' : ''}`
  const tam = seleccionado ? 46 : 38
  return L.divIcon({
    className: 'pin-wrap',
    html: `<div class="${clases}" style="--pin:${color}"><span class="pin__ico">${escapar(icono)}</span></div>`,
    iconSize: [tam, tam + 8],
    iconAnchor: [tam / 2, tam + 6],
  })
}

const ICONO_PROVISIONAL = L.divIcon({
  className: 'pin-wrap',
  html: `<div class="pin pin--provisional" style="--pin:${COLOR_PROVISIONAL}"><span class="pin__ico">＋</span></div>`,
  iconSize: [42, 50],
  iconAnchor: [21, 48],
})

interface Entrada {
  marcador: L.Marker
  incidencia: Incidencia
  firma: string
}

export default function IncidentMap({
  incidencias, seleccionId = null, onSeleccionar, eligiendo, centro, zoom = 15, ajustarAlCargar = false, className = '', etiqueta,
}: Props) {
  const { categoriaPorId } = useCategorias()
  const contenedor = useRef<HTMLDivElement>(null)
  const mapa = useRef<L.Map | null>(null)
  const capa = useRef<L.LayerGroup | null>(null)
  const entradas = useRef(new Map<number, Entrada>())
  const provisional = useRef<L.Marker | null>(null)
  const yaAjustado = useRef(false)

  // Lo último que llegó por props, para que los eventos de Leaflet no queden con valores viejos
  const seleccionRef = useRef(seleccionId)
  const onSeleccionarRef = useRef(onSeleccionar)
  const eligiendoRef = useRef(eligiendo)
  useEffect(() => {
    seleccionRef.current = seleccionId
    onSeleccionarRef.current = onSeleccionar
    eligiendoRef.current = eligiendo
  })

  // Crea el mapa una sola vez
  useEffect(() => {
    const el = contenedor.current
    if (!el) return
    const m = L.map(el, { zoomControl: true }).setView([centro.lat, centro.lng], zoom)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(m)
    capa.current = L.layerGroup().addTo(m)
    mapa.current = m

    m.on('click', (e: L.LeafletMouseEvent) => {
      const modo = eligiendoRef.current
      if (modo) modo.onElegir({ lat: e.latlng.lat, lng: e.latlng.lng })
    })

    // El contenedor puede cambiar de tamaño (modal, panel, rotación del celular): se recalcula el mapa
    const observador = new ResizeObserver(() => m.invalidateSize())
    observador.observe(el)

    const registro = entradas.current
    return () => {
      observador.disconnect()
      m.remove()
      mapa.current = null
      capa.current = null
      provisional.current = null
      registro.clear()
      yaAjustado.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- el mapa se crea una sola vez
  }, [])

  // Sincroniza los marcadores con la lista: agrega, mueve, repinta o quita solo lo que cambió
  useEffect(() => {
    const grupo = capa.current
    if (!grupo) return
    const vigentes = new Set<number>()

    for (const i of incidencias) {
      if (i.lat === null || i.lng === null) continue // sin ubicación: no se dibuja
      vigentes.add(i.id)
      const estilo = estiloIncidencia(i, categoriaPorId(i.categoriaId))
      const firma = `${i.lat},${i.lng},${estilo.color},${estilo.icono},${estilo.urgente}`
      const previa = entradas.current.get(i.id)
      const seleccionado = seleccionRef.current === i.id

      if (!previa) {
        const marcador = L.marker([i.lat, i.lng], {
          icon: crearIcono(estilo.color, estilo.icono, seleccionado, estilo.urgente),
          title: `${i.titulo} (${estilo.nombre})`,
          alt: `${i.titulo}, ${estilo.nombre}`,
          keyboard: true,
          riseOnHover: true,
          zIndexOffset: seleccionado ? 1000 : estilo.urgente ? 500 : 0,
        }).addTo(grupo)
        marcador.on('click', (e) => {
          L.DomEvent.stopPropagation(e) // que el clic no cuente como "elegir ubicación"
          if (!eligiendoRef.current) onSeleccionarRef.current?.(i.id)
        })
        entradas.current.set(i.id, { marcador, incidencia: i, firma })
      } else if (previa.firma !== firma) {
        previa.marcador.setLatLng([i.lat, i.lng])
        previa.marcador.setIcon(crearIcono(estilo.color, estilo.icono, seleccionado, estilo.urgente))
        previa.marcador.getElement()?.setAttribute('title', `${i.titulo} (${estilo.nombre})`)
        previa.firma = firma
        previa.incidencia = i
      } else {
        previa.incidencia = i
      }
    }

    for (const [id, entrada] of entradas.current) {
      if (!vigentes.has(id)) {
        entrada.marcador.remove()
        entradas.current.delete(id)
      }
    }

    // Primera vez con datos: encuadra todos los marcadores
    if (ajustarAlCargar && !yaAjustado.current && vigentes.size > 0 && mapa.current) {
      const puntos = [...entradas.current.values()].map((e) => e.marcador.getLatLng())
      mapa.current.fitBounds(L.latLngBounds(puntos), { padding: [40, 40], maxZoom: 16 })
      yaAjustado.current = true
    }
  }, [incidencias, categoriaPorId, ajustarAlCargar])

  // Marca el incidente seleccionado (más grande, al frente) y centra el mapa en él
  const seleccionPrevia = useRef<number | null>(null)
  useEffect(() => {
    const repintar = (id: number | null, seleccionado: boolean) => {
      const entrada = id === null ? undefined : entradas.current.get(id)
      if (!entrada) return
      const estilo = estiloIncidencia(entrada.incidencia, categoriaPorId(entrada.incidencia.categoriaId))
      entrada.marcador.setIcon(crearIcono(estilo.color, estilo.icono, seleccionado, estilo.urgente))
      entrada.marcador.setZIndexOffset(seleccionado ? 1000 : estilo.urgente ? 500 : 0)
    }
    if (seleccionPrevia.current !== seleccionId) repintar(seleccionPrevia.current, false)
    repintar(seleccionId, true)
    seleccionPrevia.current = seleccionId

    const actual = seleccionId === null ? undefined : entradas.current.get(seleccionId)
    if (actual && mapa.current && !eligiendoRef.current) {
      const m = mapa.current
      if (!m.getBounds().pad(-0.2).contains(actual.marcador.getLatLng())) m.panTo(actual.marcador.getLatLng())
    }
  }, [seleccionId, incidencias, categoriaPorId])

  // Marcador provisional del nuevo reporte (arrastrable)
  const punto = eligiendo?.punto ?? null
  const hayModoElegir = !!eligiendo
  useEffect(() => {
    const m = mapa.current
    if (!m) return
    if (!hayModoElegir || !punto) {
      provisional.current?.remove()
      provisional.current = null
      return
    }
    if (!provisional.current) {
      const pin = L.marker([punto.lat, punto.lng], {
        icon: ICONO_PROVISIONAL, draggable: true, keyboard: true, title: 'Ubicación del nuevo incidente (arrastrá para ajustar)', zIndexOffset: 2000,
      }).addTo(m)
      pin.on('dragend', () => {
        const p = pin.getLatLng()
        eligiendoRef.current?.onElegir({ lat: p.lat, lng: p.lng })
      })
      provisional.current = pin
    } else {
      provisional.current.setLatLng([punto.lat, punto.lng])
    }
    if (!m.getBounds().pad(-0.15).contains([punto.lat, punto.lng])) m.panTo([punto.lat, punto.lng])
  }, [punto, hayModoElegir])

  return (
    <div className={`mapa-contenedor ${hayModoElegir ? 'is-eligiendo' : ''}`}>
      <div ref={contenedor} className={`map-frame map-selector ${className}`} role="application" aria-label={etiqueta} />
      {hayModoElegir && (
        <p className="mapa-aviso" role="status">
          {punto ? 'Arrastrá el pin para ajustar el punto.' : 'Tocá el mapa para marcar dónde ocurre.'}
        </p>
      )}
    </div>
  )
}
