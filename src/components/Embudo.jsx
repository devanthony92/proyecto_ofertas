import Card, { Vacio } from './Card'

const ETAPAS = [
  ['creadas', 'Creadas', 'bg-primario'],
  ['En negociación', 'En negociación', 'bg-primario/60'],
  ['Enviada', 'Enviadas (sin respuesta)', 'bg-texto-3'],
  ['Aprobada', 'Aprobadas', 'bg-exito'],
  ['Rechazada', 'Rechazadas', 'bg-critico'],
]

// Funnel comercial. Enviada = enviada hoy, sin respuesta; En negociación = enviada hace 1 día o más, aún sin decidir.
export default function Embudo({ datos }) {
  const total = datos.creadas
  return (
    <Card id="h-embudo" titulo="Funnel comercial" sub="Etapa actual de las ofertas del período">
      {total ? (
        <ol className="space-y-3.5">
          {ETAPAS.map(([k, t, color], i) => {
            const v = datos[k]
            const pct = total ? v / total : 0
            return (
              <li key={k}>
                <div className="mb-1.5 flex items-baseline justify-between gap-2 text-sm">
                  <span className={i ? 'text-texto-2' : 'font-medium text-texto'}>{t}</span>
                  <span className="tabular-nums">
                    <span className="font-semibold text-texto">{v}</span>
                    {i > 0 && <span className="ml-1.5 inline-block w-9 text-right text-xs text-texto-2">{Math.round(pct * 100)} %</span>}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-sutil">
                  <div className={`h-full rounded-full ${color} transition-[width] duration-500 ease-out`} style={{ width: `${Math.max(pct * 100, v ? 2 : 0)}%` }} />
                </div>
              </li>
            )
          })}
        </ol>
      ) : (
        <Vacio />
      )}
      <p className="mt-4 text-xs leading-relaxed text-texto-2">
        Regla de la simulación: la oferta queda enviada el día en que sale, pasa a negociación al día siguiente y se aprueba o rechaza a los 2 días.
      </p>
    </Card>
  )
}
