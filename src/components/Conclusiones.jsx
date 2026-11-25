import { AlertTriangle, CheckCircle2, Info } from 'lucide-react'

const ICONOS = {
  alerta: [AlertTriangle, 'text-rechazada'],
  ok: [CheckCircle2, 'text-aceptada'],
  info: [Info, 'text-acero-500'],
}

export default function Conclusiones({ items }) {
  return (
    <section className="placa p-4" aria-labelledby="h-conclusiones">
      <h2 id="h-conclusiones" className="font-display text-lg font-semibold">
        Conclusiones
      </h2>
      <ul className="mt-3 space-y-3">
        {items.map((c, i) => {
          const [Icono, color] = ICONOS[c.tipo] || ICONOS.info
          return (
            <li key={i} className="flex items-start gap-2.5 text-sm">
              <Icono size={18} className={`mt-0.5 shrink-0 ${color}`} aria-hidden="true" />
              <span>{c.texto}</span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
