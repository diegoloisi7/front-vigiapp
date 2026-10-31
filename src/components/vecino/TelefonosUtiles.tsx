import Icono from './Icono'

const TELEFONOS = [
  { numero: '911', nombre: 'Policía' },
  { numero: '107', nombre: 'Emergencias médicas' },
  { numero: '100', nombre: 'Bomberos' },
]

// Teléfonos de emergencia, para llamar con un toque.
export default function TelefonosUtiles({ id = 't-telefonos' }: { id?: string }) {
  return (
    <section className="vg-panel vg-telefonos" aria-labelledby={id}>
      <div className="vg-panel__cabecera"><h2 id={id}>Teléfonos útiles</h2></div>
      <ul>
        {TELEFONOS.map((t) => (
          <li key={t.numero}>
            <a href={`tel:${t.numero}`} aria-label={`Llamar al ${t.numero}, ${t.nombre}`}>
              <span className="vg-telefonos__numero">{t.numero}</span>
              <span className="vg-telefonos__nombre">{t.nombre}</span>
              <Icono nombre="telefono" tamano={18} />
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
