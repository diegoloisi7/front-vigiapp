// La BD conserva identificadores de iconos; la interfaz los representa como emojis.
const EMOJIS_CATEGORIA: Record<string, string> = {
  'shield-alert': '☢️',
  eye: '👁️‍🗨️',
  'car-front': '🚗',
  construction: '🚧',
}

export function emojiDeCategoria(icono?: string | null): string {
  const valor = icono?.trim() || ''
  const nombre = valor.toLowerCase().replace(/\s+/g, '-')
  if (EMOJIS_CATEGORIA[nombre]) return EMOJIS_CATEGORIA[nombre]
  // Un nombre nuevo de icono no se imprime como texto en la interfaz.
  return /^[a-z][a-z0-9-]*$/i.test(nombre) ? '📌' : valor || '📌'
}

export default function IconoCategoria({ icono, className }: { icono?: string | null; className?: string }) {
  return <span className={`icono-categoria${className ? ` ${className}` : ''}`} aria-hidden="true">{emojiDeCategoria(icono)}</span>
}

// Leaflet recibe HTML, así que escapamos incluso los valores nuevos de la base.
export function iconoCategoriaHtml(icono?: string | null): string {
  return emojiDeCategoria(icono).replace(/[&<>"']/g, (caracter) => `&#${caracter.charCodeAt(0)};`)
}
