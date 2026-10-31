import type { ReactNode } from 'react'
import Logo from './Logo'

interface Props {
  titulo: string
  subtitulo?: string
  children: ReactNode
  pie?: ReactNode // links secundarios debajo del formulario
}

// Estructura común de Ingresar, Crear cuenta y Restablecer contraseña:
// panel de marca (solo en escritorio) + tarjeta con el formulario.
export default function PantallaAuth({ titulo, subtitulo, children, pie }: Props) {
  return (
    <section className="auth" aria-labelledby="auth-titulo">
      <aside className="auth__marca">
        <p className="auth__marca-titulo">Tu barrio, organizado y más seguro</p>
        <ul className="auth__beneficios">
          <li><span aria-hidden="true">🗺️</span> Reportá y seguí lo que pasa en tu cuadra</li>
          <li><span aria-hidden="true">🆘</span> Pedí ayuda a tus vecinos en segundos</li>
          <li><span aria-hidden="true">📢</span> Enterate de los avisos de tu comunidad</li>
        </ul>
      </aside>
      <div className="auth__panel">
        <div className="auth__tarjeta">
          <span className="auth__logo"><Logo /></span>
          <h1 id="auth-titulo">{titulo}</h1>
          {subtitulo && <p className="auth__subtitulo">{subtitulo}</p>}
          {children}
          {pie && <div className="auth__pie">{pie}</div>}
        </div>
      </div>
    </section>
  )
}
