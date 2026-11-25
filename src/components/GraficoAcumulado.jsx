import { useRef, useState } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip } from 'chart.js'
import zoomPlugin from 'chartjs-plugin-zoom'
import { Line } from 'react-chartjs-2'
import { ZoomOut } from 'lucide-react'
import Card, { Vacio } from './Card'
import { paleta, tooltipBase, compacto } from './chartTema'
import { formatoCOP } from '../lib/calculos'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, zoomPlugin)

const SERIES = [
  ['ofertado', 'Ofertado'],
  ['ganado', 'Ganado'],
  ['proyeccion', 'Proyección lineal'],
  ['anterior', 'Mes anterior'],
]

// serie: [{dia, ofertado, ganado}] hasta el día actual; anterior: idem del mes anterior guardado (o []).
export default function GraficoAcumulado({ serie, anterior, metaMin, metaMax, pronostico, dia, diaMax, desde, tema }) {
  const ref = useRef(null)
  const [visibles, setVisibles] = useState({ ofertado: true, ganado: true, proyeccion: true, anterior: true })
  // Rango de días acercado con el ratón. Se guarda en estado porque cada actualización de la
  // simulación vuelve a aplicar las opciones y borraría el zoom interno del plugin.
  // Va atado al período: al cambiar de período el zoom manual deja de aplicar.
  const [zoomGuardado, setRangoZoom] = useState(null)
  const rangoZoom = zoomGuardado?.desde === desde ? zoomGuardado : null
  const p = paleta(tema)
  const hayAnterior = anterior.length > 0

  // Al cambiar de período se descarta el zoom manual; el rango del período va en las opciones del eje.
  const guardarZoom = ({ chart }) => setRangoZoom({ desde, min: chart.scales.x.min + 1, max: chart.scales.x.max + 1 })

  // Las etiquetas son el número de día: el rango del eje x se da en días (min/max), no en índices.
  const labels = Array.from({ length: diaMax }, (_, i) => i + 1)
  const porDia = (arr, k) => labels.map((d) => arr.find((s) => s.dia === d)?.[k] ?? null)
  const ultimo = serie[serie.length - 1]
  const proy = labels.map((d) =>
    ultimo && pronostico.fiable && dia < diaMax && d >= dia ? ultimo.ganado + pronostico.ritmo * (d - dia) : null,
  )
  const meta = (v) => labels.map(() => v * 1e6)

  const datasets = [
    { label: 'Meta mínima', data: meta(metaMin), borderColor: p.critico, borderWidth: 1.25, borderDash: [5, 4], pointRadius: 0, pointHoverRadius: 0, fill: false, order: 5 },
    { label: 'Meta máxima', data: meta(metaMax), borderColor: 'transparent', pointRadius: 0, pointHoverRadius: 0, fill: { target: 0 }, backgroundColor: tema === 'oscuro' ? 'rgb(52 211 153 / 0.08)' : 'rgb(16 185 129 / 0.08)', order: 6 },
    { key: 'ofertado', label: 'Ofertado', data: porDia(serie, 'ofertado'), borderColor: p.secundario, backgroundColor: p.secundario, borderWidth: 2, order: 2 },
    {
      key: 'ganado', label: 'Ganado', data: porDia(serie, 'ganado'), borderColor: p.primario, borderWidth: 2.5, order: 1, fill: 'origin',
      backgroundColor: (ctx) => {
        const { chart } = ctx
        if (!chart.chartArea) return 'transparent'
        const g = chart.ctx.createLinearGradient(0, chart.chartArea.top, 0, chart.chartArea.bottom)
        g.addColorStop(0, tema === 'oscuro' ? 'rgb(77 155 240 / 0.28)' : 'rgb(0 87 184 / 0.16)')
        g.addColorStop(1, 'rgb(0 87 184 / 0)')
        return g
      },
    },
    { key: 'proyeccion', label: 'Proyección lineal', data: proy, borderColor: p.primario, borderDash: [2, 4], borderWidth: 2, pointRadius: 0, order: 3 },
    { key: 'anterior', label: 'Ganado mes anterior', data: porDia(anterior, 'ganado'), borderColor: p.neutro, borderWidth: 1.5, borderDash: [6, 3], pointRadius: 0, order: 4 },
  ]
    .filter((d) => !d.key || (visibles[d.key] && (d.key !== 'anterior' || hayAnterior)))
    .map((d) => ({ tension: 0.35, cubicInterpolationMode: 'monotone', pointRadius: 0, pointHoverRadius: 4, pointHoverBorderWidth: 2, pointHoverBackgroundColor: p.superficie, spanGaps: false, ...d }))

  const opciones = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        ...tooltipBase(p),
        filter: (i) => i.parsed.y != null && i.dataset.label !== 'Meta máxima' && i.dataset.label !== 'Meta mínima',
        callbacks: {
          title: (items) => `Día ${items[0].label} de ${diaMax}`,
          label: (c) => ` ${c.dataset.label}: ${formatoCOP(c.parsed.y)}`,
          footer: (items) => {
            const d = Number(items[0].label)
            const s = serie.find((x) => x.dia === d)
            const out = [`Banda de meta: $ ${metaMin}–${metaMax} M`]
            if (s) {
              out.push(`Conversión: ${s.ofertado ? Math.round((s.ganado / s.ofertado) * 100) : 0} % del ofertado`)
              const brecha = metaMin * 1e6 - s.ganado
              out.push(brecha > 0 ? `Faltan ${formatoCOP(brecha)} para la meta mínima` : 'Meta mínima alcanzada')
            }
            return out
          },
        },
      },
      zoom: {
        limits: { x: { minRange: 4 } },
        pan: { enabled: true, mode: 'x', modifierKey: 'shift', onPanComplete: guardarZoom },
        zoom: {
          mode: 'x',
          wheel: { enabled: true, modifierKey: 'ctrl' },
          pinch: { enabled: true },
          drag: { enabled: true, backgroundColor: 'rgb(0 87 184 / 0.08)', borderColor: p.primario, borderWidth: 1 },
          onZoomComplete: guardarZoom,
        },
      },
    },
    scales: {
      x: { ...(rangoZoom ? { min: rangoZoom.min, max: rangoZoom.max } : (desde > 1 ? { min: desde, max: Math.max(desde, dia) } : {})), grid: { display: false }, border: { color: p.rejilla }, ticks: { color: p.texto, maxRotation: 0, autoSkipPadding: 12 }, title: { display: true, text: 'Día del mes', color: p.texto } },
      y: { grid: { color: p.rejilla }, border: { display: false }, beginAtZero: true, ticks: { color: p.texto, callback: compacto, maxTicksLimit: 6 } },
    },
  }

  const restablecer = () => {
    ref.current?.resetZoom('none')
    setRangoZoom(null)
  }

  return (
    <Card
      id="h-acumulado"
      titulo="Ofertado vs ganado acumulado"
      sub={`Mes simulado · banda verde = meta $ ${metaMin}–${metaMax} M · arrastra sobre la gráfica para acercar`}
      accion={
        <button type="button" className="btn btn-sm" onClick={restablecer} disabled={!rangoZoom}>
          <ZoomOut size={15} aria-hidden="true" /> Restablecer
        </button>
      }
    >
      <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="Series visibles">
        {SERIES.filter(([k]) => k !== 'anterior' || hayAnterior).map(([k, t]) => {
          const color = { ofertado: p.secundario, ganado: p.primario, proyeccion: p.primario, anterior: p.neutro }[k]
          return (
            <button
              key={k}
              type="button"
              aria-pressed={visibles[k]}
              onClick={() => setVisibles((v) => ({ ...v, [k]: !v[k] }))}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${visibles[k] ? 'border-borde-fuerte bg-superficie text-texto' : 'border-borde bg-sutil text-texto-3 line-through'}`}
            >
              <span className="h-0.5 w-3.5 rounded" style={{ background: color, opacity: k === 'proyeccion' || k === 'anterior' ? 0.6 : 1 }} aria-hidden="true" />
              {t}
            </button>
          )
        })}
        {!hayAnterior && <span className="self-center text-xs text-texto-3">Al reiniciar se guarda este mes como “mes anterior” para comparar.</span>}
      </div>
      <div className="relative h-72 sm:h-80" onDoubleClick={restablecer}>
        {serie.length ? (
          <Line ref={ref} data={{ labels, datasets }} options={opciones} aria-label="Gráfica de línea del valor ofertado y ganado acumulado por día, con banda de meta mensual" />
        ) : (
          <Vacio />
        )}
      </div>
    </Card>
  )
}
