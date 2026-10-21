// "hace 5 min", "hace 2 h", "hace 3 días"
export function tiempoRelativo(iso) {
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (min < 1) return 'ahora'
  if (min < 60) return `hace ${min} min`
  const horas = Math.round(min / 60)
  if (horas < 24) return `hace ${horas} h`
  const dias = Math.round(horas / 24)
  return `hace ${dias} ${dias === 1 ? 'día' : 'días'}`
}

// "15 de octubre, 14:30"
export function fechaLarga(iso) {
  return new Date(iso).toLocaleString('es-AR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
}

// Quita tildes y pasa a minúsculas para buscar sin importar acentos
export function normalizar(texto) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

export const textoVecinos = (n) => (n === 1 ? '1 vecino lo vio' : `${n} vecinos lo vieron`)
export const textoConfirmaciones = (n) => (n === 1 ? '1 vecino lo confirmó' : `${n} vecinos lo confirmaron`)
export const textoDistancia = (m) => (m < 1000 ? `a ${m} m` : `a ${(m / 1000).toFixed(1)} km`)
