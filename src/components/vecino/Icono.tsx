// Set de íconos propio (SVG de trazo, 24×24). Reemplaza a los emojis en la vista del vecino.
// Los trazos son texto SVG fijo: así sirven tanto en React como en los pines de Leaflet (que reciben HTML).
export type NombreIcono =
  | 'inicio' | 'incidentes' | 'alertas' | 'grupos' | 'perfil' | 'mas' | 'campana' | 'sos'
  | 'seguridad' | 'servicios' | 'emergencia' | 'comunidad' | 'mapa' | 'pin' | 'ojo' | 'reloj'
  | 'check' | 'flecha' | 'telefono' | 'radio' | 'sobre'
  // Indicadores por categoría
  | 'farol' | 'gota' | 'cono' | 'arbol' | 'tacho' | 'semaforo' | 'llama' | 'botiquin'
  // Interfaz
  | 'sol' | 'luna' | 'senal' | 'lupa' | 'grafico' | 'etiqueta' | 'salir'

const SIRENA = '<path d="M7 18v-6a5 5 0 0 1 10 0v6"/><path d="M4 18h16v3H4z"/><path d="M12 2.5v2M4.2 6.2l1.4 1.4M19.8 6.2l-1.4 1.4"/>'

const TRAZOS: Record<NombreIcono, string> = {
  inicio: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>',
  incidentes: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1"/><path d="M9 10h6M9 14h6M9 18h3"/>',
  alertas: '<path d="M12 3.5 2.5 20h19z"/><path d="M12 10v4.5"/><path d="M12 17.5v.01"/>',
  grupos: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7"/><path d="M18 14.5a6.5 6.5 0 0 1 3.5 5.5"/>',
  perfil: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  mas: '<path d="M12 5v14M5 12h14"/>',
  campana: '<path d="M6 16v-5a6 6 0 1 1 12 0v5l2 2H4z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
  sos: SIRENA,
  emergencia: SIRENA,
  seguridad: '<path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
  servicios: '<path d="M14.5 6.5a4 4 0 0 0 5 5l-8.5 8.5a2.1 2.1 0 0 1-3-3z"/><path d="m14.5 6.5 2-2"/>',
  comunidad: '<path d="M3 10v4h3l7 4V6l-7 4z"/><path d="M16.5 9a4 4 0 0 1 0 6"/><path d="M19 6.5a7.5 7.5 0 0 1 0 11"/>',
  mapa: '<path d="m9 4-6 2.5V20l6-2.5 6 2.5 6-2.5V4l-6 2.5z"/><path d="M9 4v13.5M15 6.5V20"/>',
  pin: '<path d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',
  ojo: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  reloj: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7"/>',
  flecha: '<path d="m9 6 6 6-6 6"/>',
  telefono: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  radio: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/>',
  sobre: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  // Farol de calle: poste curvo y pantalla con luz
  farol: '<path d="M7 21h6"/><path d="M10 21V8a4 4 0 0 1 4-4h1"/><path d="M14 4h7l-1.5 3.5h-4z"/><path d="M17.5 10v1.5M15 9.5l-.8 1.2M20 9.5l.8 1.2"/>',
  gota: '<path d="M12 3s6 6.4 6 11a6 6 0 0 1-12 0c0-4.6 6-11 6-11z"/><path d="M9.5 14.5a2.5 2.5 0 0 0 2.5 2.5"/>',
  cono: '<path d="M10 3h4l5 17H5z"/><path d="M7.6 12h8.8M6.4 16h11.2"/><path d="M3 20h18"/>',
  arbol: '<circle cx="12" cy="9" r="6"/><path d="M12 15v6M9 21h6M12 12l-2-2"/>',
  tacho: '<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="m6 7 1 14h10l1-14"/><path d="M10 11v6M14 11v6"/>',
  semaforo: '<rect x="8" y="2.5" width="8" height="19" rx="3"/><circle cx="12" cy="7" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="17" r="1.5"/>',
  llama: '<path d="M12 21c-3.9 0-7-2.9-7-6.6 0-3.1 2.2-5.3 3.6-7.1.3 1.9 1.4 3.2 2.4 3.4C11 7.6 12.4 4.8 14.5 3c.4 3 4.5 5.5 4.5 11.4 0 3.7-3.1 6.6-7 6.6z"/>',
  botiquin: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V4h6v3"/><path d="M12 10.5v6M9 13.5h6"/>',
  sol: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  luna: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  senal: '<path d="M2 9a15 15 0 0 1 20 0"/><path d="M5.5 12.5a10 10 0 0 1 13 0"/><path d="M9 16a5 5 0 0 1 6 0"/><path d="M12 19.5v.01"/>',
  lupa: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  grafico: '<path d="M3 21h18"/><path d="M6 17v-5M11 17V6M16 17v-8M20 17v-3"/>',
  etiqueta: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.5"/>',
  salir: '<path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4"/><path d="m10 16-4-4 4-4"/><path d="M6 12h10"/>',
}

const atributos = (tamano: number) =>
  `viewBox="0 0 24 24" width="${tamano}" height="${tamano}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"`

// Para Leaflet y cualquier lugar que necesite el SVG como texto
export function iconoSvgHtml(nombre: NombreIcono, tamano = 20): string {
  return `<svg ${atributos(tamano)}>${TRAZOS[nombre]}</svg>`
}

interface Props {
  nombre: NombreIcono
  tamano?: number
  className?: string
}

// Decorativo por defecto: el texto de al lado da el significado.
export default function Icono({ nombre, tamano = 20, className }: Props) {
  return (
    <svg viewBox="0 0 24 24" width={tamano} height={tamano} fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" className={className}
      dangerouslySetInnerHTML={{ __html: TRAZOS[nombre] }} />
  )
}
