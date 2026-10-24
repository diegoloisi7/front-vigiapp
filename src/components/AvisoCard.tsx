import type { ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'
import { fechaLarga, tiempoRelativo } from '../utils/formato'
import type { Aviso } from '../types'
import Badge from './Badge'

interface Props {
  aviso: Aviso
  acciones?: ReactNode // botones (editar / cerrar) si el usuario puede gestionarlo
}

// Aviso de la comunidad (azul), con prioridad NORMAL o IMPORTANTE. Cerrado o vencido se ve apagado.
export default function AvisoCard({ aviso: a, acciones }: Props) {
  const { usuario } = useAuth()
  const esMio = a.autorId === usuario?.id
  const vigente = a.estado === 'VIGENTE'

  return (
    <article className={`alerta-card ${vigente ? 'nivel-aviso' : 'nivel-cerrado'}`}>
      <p className="alerta-card__tag">
        Aviso · <Badge tipo={a.prioridad} />
        {!vigente && <Badge tipo={a.estado === 'EXPIRADO' ? 'EXPIRADO' : 'CERRADO'} />}
      </p>
      <h3>{a.titulo}</h3>
      <p>{a.cuerpo}</p>
      <p className="alerta-card__meta">
        <span>{esMio ? 'Publicado por vos' : `Publicado por ${a.autorNombre}`}</span>
        <span>{tiempoRelativo(a.fecha)}</span>
        {a.vence && <span>{a.estado === 'EXPIRADO' ? 'Venció el' : 'Vence el'} {fechaLarga(a.vence)}</span>}
      </p>
      {acciones && <div className="grupo-card__acciones">{acciones}</div>}
    </article>
  )
}
