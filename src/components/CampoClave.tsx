import { useState } from 'react'
import Campo from './Campo'

interface Props {
  id: string
  etiqueta: string
  valor: string
  onCambiar: (valor: string) => void
  autoComplete: 'current-password' | 'new-password'
  error?: string
  ayuda?: string
}

// Campo de contraseña con botón para mostrarla u ocultarla.
export default function CampoClave({ id, etiqueta, valor, onCambiar, autoComplete, error, ayuda }: Props) {
  const [visible, setVisible] = useState(false)
  const describe = [ayuda ? `${id}-ayuda` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined

  return (
    <Campo id={id} etiqueta={etiqueta} error={error} ayuda={ayuda}>
      <div className="campo-clave">
        <input id={id} className="input" type={visible ? 'text' : 'password'} autoComplete={autoComplete} maxLength={128}
          value={valor} aria-invalid={!!error} aria-describedby={describe} onChange={(e) => onCambiar(e.target.value)} />
        <button type="button" className="campo-clave__ver" aria-pressed={visible} aria-controls={id}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'} onClick={() => setVisible(!visible)}>
          {visible ? 'Ocultar' : 'Mostrar'}
        </button>
      </div>
    </Campo>
  )
}
