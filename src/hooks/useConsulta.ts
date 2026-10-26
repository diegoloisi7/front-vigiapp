import { useEffect, useRef, useState } from 'react'
import { mensajeDeError } from '../api/cliente'

// Ejecuta una consulta async y devuelve { datos, cargando, error, recargar }.
// Vuelve a consultar cuando cambian las dependencias. Al recargar mantiene los datos anteriores.
export function useConsulta<T>(consulta: () => Promise<T>, dependencias: unknown[] = []) {
  const [datos, setDatos] = useState<T | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [version, setVersion] = useState(0)
  const esRecarga = useRef(false)

  useEffect(() => {
    let vigente = true // evita actualizar el estado si el componente ya cambió o se desmontó
    if (!esRecarga.current) setCargando(true)
    esRecarga.current = false
    setError(null)

    consulta()
      .then((resultado) => {
        if (!vigente) return
        setDatos(resultado)
        setCargando(false)
      })
      .catch((e: unknown) => {
        if (!vigente) return
        setError(mensajeDeError(e))
        setCargando(false)
      })

    return () => { vigente = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencias, version])

  function recargar() {
    esRecarga.current = true
    setVersion((v) => v + 1)
  }

  useEffect(() => {
    const onUpdate = () => recargar()
    window.addEventListener('vigiapp:refrescar', onUpdate)
    return () => window.removeEventListener('vigiapp:refrescar', onUpdate)
  }, [])

  return { datos, cargando, error, recargar }
}
