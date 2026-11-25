import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line, Doughnut, Bar } from 'react-chartjs-2'
import { formatoCOP } from '../lib/calculos'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend)
ChartJS.defaults.font.family = 'Barlow, system-ui, sans-serif'
ChartJS.defaults.color = '#4a545e'
ChartJS.defaults.animation.duration = 300 // modificar, no reemplazar: reemplazar el objeto rompe las actualizaciones

const GRID = '#d6dce1'
const compacto = (v) =>
  v >= 1e9 ? `$ ${+(v / 1e9).toFixed(1)} MM` : v >= 1e6 ? `$ ${Math.round(v / 1e6)} M` : `$ ${Math.round(v / 1e3)} k`

function Panel({ titulo, vacio, className = '', children }) {
  return (
    <section className={`placa min-w-0 p-4 ${className}`}>
      <h2 className="font-display text-lg font-semibold">{titulo}</h2>
      <div className="relative mt-3 h-56">
        {vacio ? (
          <p className="grid h-full place-items-center text-center text-sm text-acero-600">
            Sin datos todavía. Inicia la simulación o crea una oferta.
          </p>
        ) : (
          children
        )}
      </div>
    </section>
  )
}

export default function Graficas({ serie, porTipo, top }) {
  const opcionesLinea = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'bottom' },
      tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ${formatoCOP(c.parsed.y)}` } },
    },
    scales: {
      x: { grid: { color: GRID }, title: { display: true, text: 'Día' } },
      y: { grid: { color: GRID }, beginAtZero: true, ticks: { callback: compacto } },
    },
  }
  const linea = {
    labels: serie.map((s) => s.dia),
    datasets: [
      { label: 'Ofertado', data: serie.map((s) => s.ofertado), borderColor: '#2f6496', backgroundColor: '#2f6496', tension: 0.25, pointRadius: 2 },
      { label: 'Ganado', data: serie.map((s) => s.ganado), borderColor: '#1d7448', backgroundColor: '#1d7448', tension: 0.25, pointRadius: 2 },
    ],
  }
  const totalTipo = porTipo['Instalación'] + porTipo['Reparación']
  const dona = {
    labels: ['Instalación', 'Reparación'],
    datasets: [
      {
        data: [porTipo['Instalación'], porTipo['Reparación']],
        backgroundColor: ['#252b31', '#8f9aa4'],
        borderColor: '#f4f6f7',
        borderWidth: 2,
      },
    ],
  }
  const barras = {
    labels: top.map((t) => (t.descripcion.length > 28 ? t.descripcion.slice(0, 27) + '…' : t.descripcion)),
    datasets: [{ label: 'Cantidad', data: top.map((t) => t.cantidad), backgroundColor: '#2f6496' }],
  }
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Panel titulo="Ofertado vs ganado acumulado" vacio={!serie.length} className="lg:col-span-3">
        <Line data={linea} options={opcionesLinea} aria-label="Gráfica de línea de valor ofertado y ganado por día" />
      </Panel>
      <Panel titulo="Valor por tipo de trabajo" vacio={totalTipo <= 0} className="lg:col-span-1">
        <Doughnut
          data={dona}
          aria-label="Gráfica de dona por tipo de trabajo"
          options={{
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: {
              legend: { position: 'bottom' },
              tooltip: { callbacks: { label: (c) => `${c.label}: ${formatoCOP(c.parsed)}` } },
            },
          }}
        />
      </Panel>
      <Panel titulo="Top 5 ítems más ofertados" vacio={!top.length} className="lg:col-span-2">
        <Bar
          data={barras}
          aria-label="Gráfica de barras de los ítems más ofertados"
          options={{
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: { grid: { color: GRID }, beginAtZero: true, ticks: { precision: 0 } },
              y: { grid: { display: false } },
            },
          }}
        />
      </Panel>
    </div>
  )
}
