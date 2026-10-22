import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api'
import { useCategorias } from '../../context/CategoriasContext'
import { useGrupos } from '../../context/GruposContext'
import { useConsulta } from '../../hooks/useConsulta'
import SegmentedControl from '../../components/SegmentedControl'
import Tabs from '../../components/Tabs'
import MapaEmbed from '../../components/MapaEmbed'
import IncidentCard from '../../components/IncidentCard'
import EmptyState from '../../components/EmptyState'
import EstadoConsulta from '../../components/EstadoConsulta'
import MisIncidentes from '../../components/MisIncidentes'
import { ESTADOS, CENTRO_MAPA } from '../../data/mock'
import { normalizar } from '../../utils/formato'
import { esAbierto, esUrgenteActivo } from '../../utils/permisos'
import type { Incidencia } from '../../types'

const POR_PAGINA = 5

type Orden = 'URGENTES' | 'RECIENTES' | 'VISTOS' | 'CERCANOS'

interface Filtros {
  texto: string
  categoria: string // id de categoría o '' (todas)
  estado: string // 'ACTIVOS' (por defecto), un estado puntual o '' (todos)
  tipo: string // 'URGENTE', 'NORMAL' o '' (ambos)
  orden: Orden
}

interface OpcionChip {
  valor: string
  texto: string
  icono?: string
}

const SIN_FILTROS: Filtros = { texto: '', categoria: '', estado: 'ACTIVOS', tipo: '', orden: 'URGENTES' }

const OPCIONES_ESTADO: OpcionChip[] = [
  { valor: 'ACTIVOS', texto: 'Activos' },
  ...Object.entries(ESTADOS).map(([valor, texto]) => ({ valor, texto })),
  { valor: '', texto: 'Todos' },
]

const OPCIONES_ORDEN: { valor: Orden; texto: string }[] = [
  { valor: 'URGENTES', texto: 'Urgentes y más recientes' },
  { valor: 'RECIENTES', texto: 'Más recientes' },
  { valor: 'VISTOS', texto: 'Más vistos' },
  { valor: 'CERCANOS', texto: 'Más cercanos' },
]

const porFecha = (a: Incidencia, b: Incidencia) => new Date(b.creada).getTime() - new Date(a.creada).getTime()

function ordenar(lista: Incidencia[], orden: Orden): Incidencia[] {
  const copia = [...lista]
  if (orden === 'VISTOS') return copia.sort((a, b) => b.vecinos - a.vecinos || porFecha(a, b))
  if (orden === 'CERCANOS') return copia.sort((a, b) => a.distancia - b.distancia)
  if (orden === 'URGENTES') return copia.sort((a, b) => Number(esUrgenteActivo(b)) - Number(esUrgenteActivo(a)) || porFecha(a, b))
  return copia.sort(porFecha)
}

// Fila de chips de filtro (se desliza horizontalmente en celular)
function Chips({ etiqueta, opciones, valor, onCambiar }: {
  etiqueta: string
  opciones: OpcionChip[]
  valor: string
  onCambiar: (valor: string) => void
}) {
  return (
    <div className="chips" role="group" aria-label={etiqueta}>
      {opciones.map((o) => (
        <button
          key={o.valor || 'todas'}
          type="button"
          className={`chip ${valor === o.valor ? 'is-active' : ''}`}
          aria-pressed={valor === o.valor}
          onClick={() => onCambiar(o.valor)}
        >
          {o.icono && <span aria-hidden="true">{o.icono}</span>}
          {o.texto}
        </button>
      ))}
    </div>
  )
}

// Menú "Incidentes": todos los del grupo (mapa o lista) y "Mis incidentes" para actualizarlos o cerrarlos.
export default function Incidentes() {
  const [pestana, setPestana] = useState('todos')

  return (
    <>
      <Tabs
        etiqueta="Incidentes"
        activa={pestana}
        onCambiar={setPestana}
        pestanas={[{ id: 'todos', texto: 'Todos' }, { id: 'mios', texto: 'Mis incidentes' }]}
      />
      <div role="tabpanel" id={`panel-${pestana}`} aria-labelledby={`tab-${pestana}`} tabIndex={0} className="panel">
        {pestana === 'todos' ? <TodosLosIncidentes /> : <MisIncidentes />}
      </div>
    </>
  )
}

function TodosLosIncidentes() {
  const { categorias, categoriaPorId } = useCategorias()
  const { grupoActivo } = useGrupos()
  const grupoId = grupoActivo?.id
  const { datos, cargando, error, recargar } = useConsulta(() => api.incidencias.listar(grupoId), [grupoId])
  const incidencias = useMemo(() => datos ?? [], [datos])

  const [vista, setVista] = useState('mapa')
  const [filtros, setFiltros] = useState<Filtros>(SIN_FILTROS)
  const [pagina, setPagina] = useState(1)
  const [seleccionId, setSeleccionId] = useState<number | null>(null)

  function cambiarFiltro<K extends keyof Filtros>(campo: K, valor: Filtros[K]) {
    setFiltros((f) => ({ ...f, [campo]: valor }))
    setPagina(1)
  }
  function limpiar() {
    setFiltros(SIN_FILTROS)
    setPagina(1)
  }
  const hayFiltros = filtros.texto || filtros.categoria || filtros.tipo || filtros.estado !== SIN_FILTROS.estado

  const categoriasActivas = categorias.filter((c) => c.activa)
  const opcionesCategoria: OpcionChip[] = [
    { valor: '', texto: 'Todas' },
    ...categoriasActivas.map((c) => ({ valor: c.id, texto: c.nombre, icono: c.icono })),
  ]

  // Aplica buscador, categoría, estado y tipo, y ordena según lo elegido
  const filtradas = useMemo(() => {
    const buscado = normalizar(filtros.texto.trim())
    const resultado = incidencias.filter((i) => {
      if (filtros.categoria && i.categoriaId !== filtros.categoria) return false
      if (filtros.tipo && i.tipo !== filtros.tipo) return false
      if (filtros.estado === 'ACTIVOS' ? !esAbierto(i) : filtros.estado && i.estado !== filtros.estado) return false
      if (!buscado) return true
      const campos = `${i.titulo} ${i.ubicacion} ${i.descripcion} ${categoriaPorId(i.categoriaId)?.nombre ?? ''}`
      return normalizar(campos).includes(buscado)
    })
    return ordenar(resultado, filtros.orden)
  }, [filtros, incidencias, categoriaPorId])

  const seleccionada = filtradas.find((i) => i.id === seleccionId) ?? filtradas[0]
  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA))
  const paginaActual = Math.min(pagina, totalPaginas)
  const visibles = filtradas.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA)

  const vacio = (
    <EmptyState icono="🔍" titulo="No encontramos incidentes" texto="Probá con otra búsqueda o quitá algún filtro.">
      <button type="button" className="btn btn-outline" onClick={limpiar}>Limpiar filtros</button>
    </EmptyState>
  )

  return (
    <>
      <SegmentedControl
        etiqueta="Ver como"
        valor={vista}
        onCambiar={setVista}
        opciones={[{ valor: 'mapa', texto: 'Mapa', icono: '🗺️' }, { valor: 'lista', texto: 'Lista', icono: '📋' }]}
      />

      <EstadoConsulta cargando={cargando} error={error} onReintentar={recargar}>
        {vista === 'mapa' ? (
          <section className="mapa-vista" aria-label="Mapa de incidentes">
            <Chips etiqueta="Filtrar por categoría" opciones={opcionesCategoria} valor={filtros.categoria} onCambiar={(v) => cambiarFiltro('categoria', v)} />
            <Chips etiqueta="Filtrar por estado" opciones={OPCIONES_ESTADO} valor={filtros.estado} onCambiar={(v) => cambiarFiltro('estado', v)} />

            {filtradas.length === 0 ? vacio : (
              <>
                <MapaEmbed
                  lat={seleccionada?.lat ?? CENTRO_MAPA.lat}
                  lng={seleccionada?.lng ?? CENTRO_MAPA.lng}
                  titulo={`Mapa de ${seleccionada?.titulo}`}
                />
                <p className="map-nota">
                  {seleccionada?.lat === null ? 'Este incidente no tiene ubicación en el mapa. ' : ''}
                  Mapa de ejemplo de Google Maps. Elegí un incidente para ubicarlo.
                </p>

                <h2 className="subtitulo">En el mapa ({filtradas.length})</h2>
                <div className="pin-chips" role="group" aria-label="Elegir incidente para ver en el mapa">
                  {filtradas.map((i) => (
                    <button
                      key={i.id}
                      type="button"
                      className={`pin-chip ${i.id === seleccionada.id ? 'is-active' : ''}`}
                      aria-pressed={i.id === seleccionada.id}
                      onClick={() => setSeleccionId(i.id)}
                    >
                      <span aria-hidden="true">{categoriaPorId(i.categoriaId)?.icono ?? (i.tipo === 'URGENTE' ? '🆘' : '📌')}</span>
                      {i.titulo}
                    </button>
                  ))}
                </div>
                <IncidentCard incidencia={seleccionada} mostrarDistancia />
              </>
            )}
          </section>
        ) : (
          <section aria-label="Lista de incidentes">
            <form className="filtros" role="search" onSubmit={(e) => e.preventDefault()}>
              <div className="campo">
                <label htmlFor="buscar">Buscar</label>
                <input id="buscar" className="input" type="search" placeholder="Título, lugar o palabra clave"
                  value={filtros.texto} onChange={(e) => cambiarFiltro('texto', e.target.value)} />
              </div>
              <div className="campo">
                <label htmlFor="f-orden">Ordenar por</label>
                <select id="f-orden" className="input" value={filtros.orden} onChange={(e) => cambiarFiltro('orden', e.target.value as Orden)}>
                  {OPCIONES_ORDEN.map((o) => <option key={o.valor} value={o.valor}>{o.texto}</option>)}
                </select>
              </div>
              <div className="campo">
                <label htmlFor="f-estado">Estado</label>
                <select id="f-estado" className="input" value={filtros.estado} onChange={(e) => cambiarFiltro('estado', e.target.value)}>
                  {OPCIONES_ESTADO.map((o) => <option key={o.valor || 'todos'} value={o.valor}>{o.texto}</option>)}
                </select>
              </div>
              <div className="campo">
                <label htmlFor="f-tipo">Tipo</label>
                <select id="f-tipo" className="input" value={filtros.tipo} onChange={(e) => cambiarFiltro('tipo', e.target.value)}>
                  <option value="">Todos</option>
                  <option value="URGENTE">Urgentes</option>
                  <option value="NORMAL">Normales</option>
                </select>
              </div>
              <div className="campo">
                <label htmlFor="f-categoria">Categoría</label>
                <select id="f-categoria" className="input" value={filtros.categoria} onChange={(e) => cambiarFiltro('categoria', e.target.value)}>
                  <option value="">Todas</option>
                  {categoriasActivas.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
            </form>

            <div className="resultados-head">
              <p role="status">{filtradas.length} {filtradas.length === 1 ? 'resultado' : 'resultados'}</p>
              {hayFiltros && <button type="button" className="btn btn-ghost" onClick={limpiar}>Limpiar filtros</button>}
            </div>

            {filtradas.length === 0 ? vacio : (
              <>
                <div className="stack-list">
                  {visibles.map((i) => <IncidentCard key={i.id} incidencia={i} />)}
                </div>
                {totalPaginas > 1 && (
                  <nav className="paginacion" aria-label="Paginación">
                    <button type="button" className="btn btn-outline" disabled={paginaActual === 1} onClick={() => setPagina(paginaActual - 1)}>Anterior</button>
                    <span>Página {paginaActual} de {totalPaginas}</span>
                    <button type="button" className="btn btn-outline" disabled={paginaActual === totalPaginas} onClick={() => setPagina(paginaActual + 1)}>Siguiente</button>
                  </nav>
                )}
              </>
            )}
          </section>
        )}
      </EstadoConsulta>

      <p className="map-nota">¿No ves lo que pasa? <Link to="/app/reportar">Reportá un incidente</Link>.</p>
    </>
  )
}
