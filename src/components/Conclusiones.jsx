import { AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import Card from './Card'

const ICONOS = {
  alerta: [AlertTriangle, 'text-alerta-texto bg-alerta/10'],
  ok: [CheckCircle2, 'text-exito-texto bg-exito/10'],
  info: [Info, 'text-primario bg-primario-suave'],
}

export default function Conclusiones({ items }) {
  return (
    <Card id="h-conclusiones" titulo="Conclusiones y alertas" sub="Tendencias automáticas del mes simulado">
      <ul className="space-y-3">
        {items.map((c, i) => {
          const [Icono, color] = ICONOS[c.tipo] || ICONOS.info
          return (
            <li key={i} className="flex items-start gap-3 text-sm">
              <span className={`grid size-7 shrink-0 place-items-center rounded-lg ${color}`}>
                <Icono size={15} aria-hidden="true" />
              </span>
              <span className="pt-1 text-texto">{c.texto}</span>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
