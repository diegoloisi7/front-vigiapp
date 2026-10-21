// Ítems de navegación compartidos por la barra inferior, el menú lateral y el panel admin.
// Así el orden es siempre el mismo en celular y escritorio.

export const NAV_VECINO = [
  { to: '/app', icono: '🏠', texto: 'Inicio', end: true },
  // "tambien": el Mapa queda activo al ver el detalle de una incidencia
  { to: '/app/mapa', icono: '🗺️', texto: 'Mapa', tambien: '/app/incidencias' },
  { to: '/app/reportar', icono: '🚨', texto: 'Reportar', destacado: true },
  { to: '/app/alertas', icono: '🔔', texto: 'Alertas' },
  { to: '/app/perfil', icono: '👤', texto: 'Perfil' },
]

export const NAV_ADMIN = [
  { to: '/admin', texto: 'Dashboard', end: true },
  { to: '/admin/incidencias', texto: 'Incidencias' },
  { to: '/admin/categorias', texto: 'Categorías' },
  { to: '/admin/avisos', texto: 'Avisos' },
  { to: '/admin/alertas', texto: 'Alertas' },
  { to: '/admin/contactos', texto: 'Contactos' },
]

// Devuelve true si el ítem debe verse activo
export function itemActivo(item, isActive, pathname) {
  return isActive || (item.tambien ? pathname.startsWith(item.tambien) : false)
}
