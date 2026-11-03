import { Link } from 'react-router-dom'
import { useCategorias } from '../../context/CategoriasContext'
import type { Incidencia } from '../../types'
import { etiquetaDeIncidencia, familiaDeIncidencia } from '../../utils/familias'
import { textoDistancia, textoVecinos, tiempoRelativo } from '../../utils/formato'
import BadgeEstado from './BadgeEstado'
import Icono from './Icono'
import { IndicadorIncidencia } from './Indicador'

interface Props {
  incidencia: Incidencia
  destacada?: boolean        // más grande, con descripción y foto
  como?: 'li' | 'div'        // dentro de un <ul> o suelta
  sinEnlace?: boolean        // vista previa: el título no es un enlace
  mostrarDistancia?: boolean
}

// Fila del tablero de reportes: indicador cuadrado (ícono de la categoría sobre el color del tipo),
// el reporte al centro y el estado a la derecha. Toda la fila es clickeable.
export default function FilaIncidente({ incidencia: i, destacada = false, como = 'li', sinEnlace = false, mostrarDistancia = false }: Props) {
  const { categoriaPorId } = useCategorias()
  const categoria = categoriaPorId(i.categoriaId)
  const familia = familiaDeIncidencia(i, categoria)
  const Contenedor = como

  return (
    <Contenedor className={`vg-fila vg-fila--${familia}${destacada ? ' vg-fila--destacada' : ''}`}>
      <IndicadorIncidencia incidencia={i} tamano={destacada ? 40 : 28} className="vg-fila__indicador" />
      <div className="vg-fila__cuerpo">
        <p className="vg-fila__tipo">{etiquetaDeIncidencia(i, categoria)}</p>
        <h3 className="vg-fila__titulo">
          {sinEnlace ? i.titulo : <Link to={`/app/incidencias/${i.id}`} className="vg-fila__enlace">{i.titulo}</Link>}
        </h3>
        {destacada && i.descripcion && <p className="vg-fila__descripcion">{i.descripcion}</p>}
        <ul className="vg-meta">
          <li><Icono nombre="pin" tamano={16} />{i.ubicacion || 'Sin ubicación'}</li>
          <li><Icono nombre="reloj" tamano={16} />{tiempoRelativo(i.creada)}</li>
          {i.vecinos > 0 && <li><Icono nombre="ojo" tamano={16} />{textoVecinos(i.vecinos)}</li>}
          {mostrarDistancia && Number.isFinite(i.distancia) && <li><Icono nombre="radio" tamano={16} />{textoDistancia(i.distancia)}</li>}
        </ul>
      </div>
      <div className="vg-fila__lado">
        <BadgeEstado estado={i.estado} />
        {destacada && i.fotoUrl && <img className="vg-fila__foto" src={i.fotoUrl} alt="" loading="lazy" />}
      </div>
    </Contenedor>
  )
}
