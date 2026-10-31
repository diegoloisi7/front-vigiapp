import { useEffect, useRef, type ReactNode } from 'react'

// Modal accesible con <dialog>: el navegador ya maneja el foco, Escape y el fondo.
// En celular se muestra como hoja desde abajo; en escritorio, centrado.
interface Props {
  abierto: boolean
  onCerrar: () => void
  titulo: string
  children: ReactNode
}

export default function Modal({ abierto, onCerrar, titulo, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialogo = ref.current
    if (!dialogo) return
    if (abierto && !dialogo.open) {
      dialogo.showModal()
      document.body.style.overflow = 'hidden' // evita scroll de la página de fondo
    }
    if (!abierto && dialogo.open) dialogo.close()
    return () => { document.body.style.overflow = '' }
  }, [abierto])

  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby="modal-titulo"
      onClose={onCerrar}
      onClick={(e) => e.target === ref.current && onCerrar()} // clic en el fondo
    >
      {abierto && (
        <div className="modal__contenido">
          <div className="modal__header">
            <h2 id="modal-titulo">{titulo}</h2>
            <button type="button" className="modal__cerrar" aria-label="Cerrar" onClick={onCerrar}>✕</button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  )
}
