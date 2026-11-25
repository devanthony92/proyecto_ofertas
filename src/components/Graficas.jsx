import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip } from 'chart.js'
import { Doughnut, Bar } from 'react-chartjs-2'
import Card, { Vacio } from './Card'
import { paleta, tooltipBase } from './chartTema'
import { formatoCOP } from '../lib/calculos'
import { formatoCompacto, formatoPct } from '../lib/formato'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip)

// Mezcla por tipo de trabajo y top 5 de ítems más ofertados.
export default function Graficas({ porTipo, top, tema }) {
  const p = paleta(tema)
  const inst = porTipo['Instalación']
  const rep = porTipo['Reparación']
  const total = inst + rep
  const dona = {
    labels: ['Instalación', 'Reparación'],
    datasets: [{ data: [inst, rep], backgroundColor: [p.primario, p.secundario], borderColor: p.superficie, borderWidth: 3, hoverOffset: 4 }],
  }
  const barras = {
    labels: top.map((t) => (t.descripcion.length > 30 ? t.descripcion.slice(0, 29) + '…' : t.descripcion)),
    datasets: [{ label: 'Cantidad', data: top.map((t) => t.cantidad), backgroundColor: p.primario, borderRadius: 4, barThickness: 14 }],
  }
  return (
    <>
      <Card id="h-tipo" titulo="Valor por tipo de trabajo" sub="Valor ofertado del período">
        {total > 0 ? (
          <div className="flex items-center gap-5">
            <div className="relative size-40 shrink-0">
              <Doughnut
                data={dona}
                aria-label="Gráfica de dona del valor ofertado por tipo de trabajo"
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  cutout: '72%',
                  plugins: { legend: { display: false }, tooltip: { ...tooltipBase(p), callbacks: { label: (c) => ` ${c.label}: ${formatoCOP(c.parsed)}` } } },
                }}
              />
              <div className="pointer-events-none absolute inset-0 grid place-content-center text-center">
                <span className="text-xs text-texto-2">Total</span>
                <span className="text-sm font-semibold text-texto tabular-nums">{formatoCompacto(total)}</span>
              </div>
            </div>
            <ul className="min-w-0 flex-1 space-y-3 text-sm">
              {[['Instalación', inst, p.primario], ['Reparación', rep, p.secundario]].map(([t, v, c]) => (
                <li key={t}>
                  <span className="flex items-center gap-2 text-texto-2">
                    <span className="size-2.5 rounded-sm" style={{ background: c }} aria-hidden="true" />
                    {t}
                  </span>
                  <span className="mt-0.5 block font-semibold text-texto tabular-nums">
                    {formatoCompacto(v)} <span className="font-normal text-texto-2">· {formatoPct(v / total)}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <Vacio />
        )}
      </Card>
      <Card id="h-items" titulo="Top 5 ítems más ofertados" sub="Unidades en las ofertas del período">
        {top.length ? (
          <div className="relative h-48">
            <Bar
              data={barras}
              aria-label="Gráfica de barras de los ítems más ofertados"
              options={{
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { ...tooltipBase(p), callbacks: { title: (i) => top[i[0].dataIndex].descripcion, label: (c) => ` ${c.parsed.x} unidades` } } },
                scales: {
                  x: { grid: { color: p.rejilla }, border: { display: false }, beginAtZero: true, ticks: { precision: 0, color: p.texto } },
                  y: { grid: { display: false }, border: { display: false }, ticks: { color: p.texto } },
                },
              }}
            />
          </div>
        ) : (
          <Vacio />
        )}
      </Card>
    </>
  )
}
