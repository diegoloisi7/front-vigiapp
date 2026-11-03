import type { CSSProperties, ReactNode } from 'react'
import MarcaVigiApp from './marca/MarcaVigiApp'

interface Props {
  titulo: string
  subtitulo?: string
  children: ReactNode
  pie?: ReactNode // links secundarios debajo del formulario
  fondo?: string // foto de fondo opcional del panel azul (decorativa; también se ve en celular)
}

// Estructura común de Ingresar, Crear cuenta y Restablecer contraseña:
// panel de marca (solo en escritorio) + tarjeta con el formulario.
export default function PantallaAuth({ titulo, subtitulo, children, pie, fondo }: Props) {
  return (
    <section className={`auth${fondo ? ' auth--con-imagen' : ''}`} aria-labelledby="auth-titulo">
      <aside className="auth__marca" style={fondo ? ({ '--auth-foto': `url("${fondo}")` } as CSSProperties) : undefined}>
        <p className="auth__marca-titulo">Tu barrio, organizado y más seguro</p>
        <ul className="auth__beneficios">
          <li><span aria-hidden="true">🗺️</span> Reportá y seguí lo que pasa en tu cuadra</li>
          <li><span aria-hidden="true">🆘</span> Pedí ayuda a tus vecinos en segundos</li>
          <li><span aria-hidden="true">📢</span> Enterate de los avisos de tu comunidad</li>
        </ul>
      </aside>
      <div className="auth__panel">
        <div className="auth__tarjeta">
          <span className="auth__logo"><MarcaVigiApp variante="simbolo" tono="claro" className="auth__logo-svg" /></span>
          <h1 id="auth-titulo">{titulo}</h1>
          {subtitulo && <p className="auth__subtitulo">{subtitulo}</p>}
          {children}
          {pie && <div className="auth__pie">{pie}</div>}
        </div>
      </div>
    </section>
  )
}
