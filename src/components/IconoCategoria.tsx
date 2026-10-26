const ICONO_PREDETERMINADO = '📌'

export function iconoDeCategoria(icono?: string | null): string {
  return icono?.trim() || ICONO_PREDETERMINADO
}

export default function IconoCategoria({ icono, className }: { icono?: string | null; className?: string }) {
  return <span className={`icono-categoria${className ? ` ${className}` : ''}`} aria-hidden="true">{iconoDeCategoria(icono)}</span>
}

// Leaflet recibe HTML; escapamos el valor de la base antes de insertarlo en el marcador.
export function iconoCategoriaHtml(icono?: string | null): string {
  return iconoDeCategoria(icono).replace(/[&<>"']/g, (caracter) => `&#${caracter.charCodeAt(0)};`)
}
