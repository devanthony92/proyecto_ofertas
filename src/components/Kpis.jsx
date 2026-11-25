import { formatoCOP } from '../lib/calculos'

export default function Kpis({ k }) {
  const num = (n) => (Number.isFinite(n) ? n : 0)
  const celdas = [
    ['Ofertas generadas', String(num(k.ofertas))],
    ['Valor ofertado', formatoCOP(k.valorOfertado)],
    ['Valor ganado', formatoCOP(k.valorGanado)],
    ['Tasa de cierre', `${Math.round(num(k.tasaCierre) * 100)} %`],
    ['C1 promedio', `${num(k.c1Promedio).toLocaleString('es-CO', { maximumFractionDigits: 1 })} %`],
    ['Margen bruto ganado', formatoCOP(k.margenGanado)],
    ['Horas vendidas', `${num(k.horasVendidas)} h`],
  ]
  return (
    <section aria-label="Indicadores" className="placa overflow-hidden">
      <dl className="flex flex-wrap">
        {celdas.map(([label, valor]) => (
          <div key={label} className="-mb-px -mr-px grow basis-40 border-b border-r border-acero-300 px-4 py-3">
            <dt className="font-display text-xs font-medium uppercase tracking-wide text-acero-600">{label}</dt>
            <dd className="mt-1 break-words font-display text-xl font-semibold tabular-nums text-acero-900">{valor}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
