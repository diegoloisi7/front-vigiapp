import type { ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'
import { fechaLarga, tiempoRelativo } from '../utils/formato'
import type { Aviso } from '../types'
import Icono from './vecino/Icono'
import Indicador from './vecino/Indicador'

interface Props {
  aviso: Aviso
  acciones?: ReactNode // botones (editar / cerrar) si el usuario puede gestionarlo
}

// Aviso de la comunidad: fila con el indicador de "comunidad". Importante se marca; cerrado o vencido se ve apagado.
export default function AvisoCard({ aviso: a, acciones }: Props) {
  const { usuario } = useAuth()
  const esMio = a.autorId === usuario?.id
  const vigente = a.estado === 'VIGENTE'
  const estadoCerrado = a.estado === 'EXPIRADO' ? 'Vencido' : 'Cerrado'

  return (
    <article className={`vg-aviso${vigente ? '' : ' vg-aviso--cerrado'}${a.prioridad === 'IMPORTANTE' ? ' vg-aviso--importante' : ''}`}>
      <Indicador familia="comunidad" icono="comunidad" tamano={26} className="vg-aviso__indicador" />
      <div className="vg-aviso__cuerpo">
        <p className="vg-aviso__tipo">
          Aviso
          {a.prioridad === 'IMPORTANTE' && <span className="vg-marca-importante">Importante</span>}
          {!vigente && <span className="vg-marca-cerrado">{estadoCerrado}</span>}
        </p>
        <h3 className="vg-aviso__titulo">{a.titulo}</h3>
        <p className="vg-aviso__texto">{a.cuerpo}</p>
        <ul className="vg-meta">
          <li><Icono nombre="perfil" tamano={16} />{esMio ? 'Publicado por vos' : `Publicado por ${a.autorNombre}`}</li>
          <li><Icono nombre="reloj" tamano={16} />{tiempoRelativo(a.fecha)}</li>
          {a.vence && <li><Icono nombre="alertas" tamano={16} />{a.estado === 'EXPIRADO' ? 'Venció el' : 'Vence el'} {fechaLarga(a.vence)}</li>}
        </ul>
        {acciones && <div className="vg-acciones">{acciones}</div>}
      </div>
    </article>
  )
}
