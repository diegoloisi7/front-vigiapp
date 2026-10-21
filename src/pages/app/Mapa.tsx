import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api'
import { useCategorias } from '../../context/CategoriasContext'
import { useGrupos } from '../../context/GruposContext'
import { useConsulta } from '../../hooks/useConsulta'
import SegmentedControl from '../../components/SegmentedControl'
import MapaEmbed from '../../components/MapaEmbed'
import IncidentCard from '../../components/IncidentCard'
import EmptyState from '../../components/EmptyState'
import EstadoConsulta from '../../components/EstadoConsulta'
import { ESTADOS, CENTRO_MAPA } from '../../data/mock'
import { normalizar } from '../../utils/formato'

const POR_PAGINA = 5

interface Filtros {
  texto: string
  categoria: string // id de categoría o '' (todas)
  estado: string // estado o '' (todos)
}

interface OpcionChip {
  valor: string
  texto: string
  icono?: string
}

const SIN_FILTROS: Filtros = { texto: '', categoria: '', estado: '' }

const OPCIONES_ESTADO: OpcionChip[] = [
  { valor: '', texto: 'Todos' },
  ...Object.entries(ESTADOS).map(([valor, texto]) => ({ valor, texto })),
]

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

export default function Mapa() {
  const { categorias, categoriaPorId } = useCategorias()
  const { grupoActivo } = useGrupos()
  const grupoId = grupoActivo?.id
  const { datos, cargando, error, recargar } = useConsulta(() => api.incidencias.listar(grupoId), [grupoId])
  const incidencias = useMemo(() => datos ?? [], [datos])

  const [vista, setVista] = useState('mapa')
  const [filtros, setFiltros] = useState<Filtros>(SIN_FILTROS)
  const [pagina, setPagina] = useState(1)
  const [seleccionId, setSeleccionId] = useState<number | null>(null)

  function cambiarFiltro(campo: keyof Filtros, valor: string) {
    setFiltros((f) => ({ ...f, [campo]: valor }))
    setPagina(1)
  }
  function limpiar() {
    setFiltros(SIN_FILTROS)
    setPagina(1)
  }
  const hayFiltros = filtros.texto || filtros.categoria || filtros.estado

  const categoriasActivas = categorias.filter((c) => c.activa)
  const opcionesCategoria: OpcionChip[] = [
    { valor: '', texto: 'Todas' },
    ...categoriasActivas.map((c) => ({ valor: c.id, texto: c.nombre, icono: c.icono })),
  ]

  // Aplica buscador, categoría y estado; las más nuevas primero
  const filtradas = useMemo(() => {
    const buscado = normalizar(filtros.texto.trim())
    return incidencias
      .filter((i) => {
        if (filtros.categoria && i.categoriaId !== filtros.categoria) return false
        if (filtros.estado && i.estado !== filtros.estado) return false
        if (!buscado) return true
        const campos = `${i.titulo} ${i.ubicacion} ${i.descripcion} ${categoriaPorId(i.categoriaId)?.nombre ?? ''}`
        return normalizar(campos).includes(buscado)
      })
      .sort((a, b) => new Date(b.creada).getTime() - new Date(a.creada).getTime())
  }, [filtros, incidencias, categoriaPorId])

  const seleccionada = filtradas.find((i) => i.id === seleccionId) ?? filtradas[0]
  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA))
  const paginaActual = Math.min(pagina, totalPaginas)
  const visibles = filtradas.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA)

  const vacio = (
    <EmptyState icono="🔍" titulo="No encontramos incidencias" texto="Probá con otra búsqueda o quitá algún filtro.">
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
          <section className="mapa-vista" aria-label="Mapa de incidencias">
            <Chips etiqueta="Filtrar por categoría" opciones={opcionesCategoria} valor={filtros.categoria} onCambiar={(v) => cambiarFiltro('categoria', v)} />
            <Chips etiqueta="Filtrar por estado" opciones={OPCIONES_ESTADO} valor={filtros.estado} onCambiar={(v) => cambiarFiltro('estado', v)} />

            {filtradas.length === 0 ? vacio : (
              <>
                <MapaEmbed
                  lat={seleccionada?.lat ?? CENTRO_MAPA.lat}
                  lng={seleccionada?.lng ?? CENTRO_MAPA.lng}
                  titulo={`Mapa de ${seleccionada?.titulo}`}
                />
                <p className="map-nota">Mapa de ejemplo de Google Maps. Elegí una incidencia para ubicarla.</p>

                <h2 className="subtitulo">En el mapa ({filtradas.length})</h2>
                <div className="pin-chips" role="group" aria-label="Elegir incidencia para ver en el mapa">
                  {filtradas.map((i) => (
                    <button
                      key={i.id}
                      type="button"
                      className={`pin-chip ${i.id === seleccionada.id ? 'is-active' : ''}`}
                      aria-pressed={i.id === seleccionada.id}
                      onClick={() => setSeleccionId(i.id)}
                    >
                      <span aria-hidden="true">{categoriaPorId(i.categoriaId)?.icono}</span>
                      {i.titulo}
                    </button>
                  ))}
                </div>
                <IncidentCard incidencia={seleccionada} mostrarDistancia />
              </>
            )}
          </section>
        ) : (
          <section aria-label="Lista de incidencias">
            <form className="filtros" role="search" onSubmit={(e) => e.preventDefault()}>
              <div className="campo">
                <label htmlFor="buscar">Buscar</label>
                <input id="buscar" className="input" type="search" placeholder="Título, lugar o palabra clave"
                  value={filtros.texto} onChange={(e) => cambiarFiltro('texto', e.target.value)} />
              </div>
              <div className="campo">
                <label htmlFor="f-categoria">Categoría</label>
                <select id="f-categoria" className="input" value={filtros.categoria} onChange={(e) => cambiarFiltro('categoria', e.target.value)}>
                  <option value="">Todas</option>
                  {categoriasActivas.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div className="campo">
                <label htmlFor="f-estado">Estado</label>
                <select id="f-estado" className="input" value={filtros.estado} onChange={(e) => cambiarFiltro('estado', e.target.value)}>
                  <option value="">Todos</option>
                  {Object.entries(ESTADOS).map(([v, t]) => <option key={v} value={v}>{t}</option>)}
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

      <p className="map-nota">¿No ves lo que pasa? <Link to="/app/reportar">Reportá una incidencia</Link>.</p>
    </>
  )
}
