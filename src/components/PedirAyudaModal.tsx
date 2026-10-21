import { useState } from 'react'
import Modal from './Modal'
import HoldButton from './HoldButton'
import { TIPOS_AYUDA } from '../data/mock'

// Modal "Pedir ayuda". Pensado para evitar activaciones accidentales:
// 1) elegir el tipo, 2) mantener presionado 3 s, 3) confirmación. Todavía no envía nada (sin backend).
export default function PedirAyudaModal({ abierto, onCerrar }: { abierto: boolean; onCerrar: () => void }) {
  const [tipo, setTipo] = useState('')
  const [enviada, setEnviada] = useState(false)

  function cerrar() {
    setTipo('')
    setEnviada(false)
    onCerrar()
  }

  return (
    <Modal abierto={abierto} onCerrar={cerrar} titulo="Pedir ayuda">
      {enviada ? (
        <div className="ayuda-ok" role="status">
          <span aria-hidden="true" className="ayuda-ok__icon">✅</span>
          <h3>Alerta enviada a tu comunidad</h3>
          <p>Tus vecinos recibieron el aviso de «{tipo}». Si estás en peligro, llamá al 911.</p>
          <button type="button" className="btn btn-primary" onClick={cerrar}>Cerrar</button>
        </div>
      ) : (
        <>
          <fieldset className="ayuda-tipos">
            <legend>1. ¿Qué está pasando?</legend>
            {TIPOS_AYUDA.map((t) => (
              <label key={t} className="opcion-radio">
                <input type="radio" name="tipo-ayuda" value={t} checked={tipo === t} onChange={() => setTipo(t)} />
                {t}
              </label>
            ))}
          </fieldset>

          <p className="ayuda-paso">2. {tipo ? 'Mantené presionado para enviar la alerta.' : 'Elegí un tipo para habilitar el botón.'}</p>
          <HoldButton deshabilitado={!tipo} onCompletado={() => setEnviada(true)} />
        </>
      )}

      {/* Aviso permanente: visible en todos los pasos */}
      <div className="aviso-911">
        <p>Esta app no reemplaza al 911, bomberos ni servicios médicos.</p>
        <a className="btn btn-outline" href="tel:911">Llamar al 911</a>
      </div>
    </Modal>
  )
}
