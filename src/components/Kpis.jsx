import { useId } from 'react'
import { FileText, Briefcase, Trophy, Target, Percent, Coins, Clock, Info, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'
import { formatoCOP } from '../lib/calculos'
import { formatoCompacto, formatoPct } from '../lib/formato'

const NIVEL = {
  ok: ['bg-exito', 'text-exito-texto'],
  alerta: ['bg-alerta', 'text-alerta-texto'],
  critico: ['bg-critico', 'text-critico-texto'],
}

function Sparkline({ datos }) {
  const vals = datos.filter(Number.isFinite)
  if (vals.length < 2) return <span className="block h-8 w-full" aria-hidden="true" />
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const w = 160
  const h = 32
  const pts = vals.map((v, i) => [(i / (vals.length - 1)) * w, h - 3 - ((v - min) / (max - min || 1)) * (h - 6)])
  const linea = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join('')
  const [ux, uy] = pts[pts.length - 1]
  return (
    <span className="relative block h-8 w-full">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible" aria-hidden="true">
        <path d={`${linea}L${w},${h}L0,${h}Z`} fill="var(--primario)" opacity="0.08" />
        <path d={linea} fill="none" stroke="var(--primario)" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
      <span className="absolute size-1.5 -translate-1/2 rounded-full bg-primario" style={{ left: `${(ux / w) * 100}%`, top: `${(uy / h) * 100}%` }} aria-hidden="true" />
    </span>
  )
}

function Variacion({ v, comparado }) {
  if (!v) return <p className="text-xs text-texto-3">Sin período anterior</p>
  const Icono = v.signo > 0 ? ArrowUpRight : v.signo < 0 ? ArrowDownRight : Minus
  const color = v.signo > 0 ? 'text-exito-texto bg-exito/10' : v.signo < 0 ? 'text-critico-texto bg-critico/10' : 'text-texto-2 bg-sutil'
  return (
    <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs">
      <span className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-semibold tabular-nums ${color}`}>
        <Icono size={12} aria-hidden="true" />
        {v.texto}
      </span>
      <span className="text-texto-2">{comparado}</span>
    </p>
  )
}

function Tarjeta({ c, comparado }) {
  const tipId = useId()
  const nivel = c.desempeno && NIVEL[c.desempeno.nivel]
  const Icono = c.icono
  return (
    <div className="card relative flex min-w-0 flex-col gap-3 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="grid size-8 place-items-center rounded-lg bg-primario-suave text-primario">
          <Icono size={16} aria-hidden="true" />
        </span>
        <span className="tip tip-card">
          <button type="button" className="btn-icono !size-7 !text-texto-3 hover:!text-texto" aria-describedby={tipId} aria-label={`Qué mide ${c.label}`}>
            <Info size={14} aria-hidden="true" />
          </button>
          <span role="tooltip" id={tipId}>{c.ayuda}</span>
        </span>
      </div>
      <dl className="min-w-0">
        <dt className="truncate text-[0.8125rem] font-medium text-texto-2">{c.label}</dt>
        <dd className="mt-1 text-2xl font-semibold tracking-tight text-texto tabular-nums" title={c.completo}>
          {c.valor}
        </dd>
      </dl>
      <Sparkline datos={c.serie} />
      <div className="mt-auto">
        <Variacion v={c.variacion} comparado={comparado} />
      </div>
      {nivel && (
        <p className={`flex items-center gap-1.5 border-t border-borde pt-2.5 text-xs font-medium ${nivel[1]}`}>
          <span className={`size-1.5 rounded-full ${nivel[0]}`} aria-hidden="true" />
          {c.desempeno.texto}
        </p>
      )}
    </div>
  )
}

const pp = (a, b) => (b == null ? null : (a - b) * 100) // diferencia en puntos porcentuales

function delta(actual, anterior, enPuntos = false) {
  if (anterior == null) return null
  if (enPuntos) {
    const d = pp(actual, anterior)
    return { signo: Math.sign(Math.round(d * 10)), texto: `${d >= 0 ? '+' : ''}${d.toLocaleString('es-CO', { maximumFractionDigits: 1 })} pp` }
  }
  if (!anterior) return null
  const v = (actual - anterior) / Math.abs(anterior)
  return { signo: Math.sign(Math.round(v * 1000)), texto: `${v >= 0 ? '+' : ''}${formatoPct(v)}` }
}

// k: KPIs del período; prev: KPIs del período anterior (o null); serie: kpis acumulados por día.
export default function Kpis({ k, prev, serie, comparado, variables, dias }) {
  const s = (clave) => serie.map((x) => x[clave])
  const n = (v) => (Number.isFinite(v) ? v : 0)
  const decididas = k.aceptadas + k.rechazadas

  // Meta de valor ganado prorrateada a los días del período.
  const metaPeriodo = (variables.metaMin * 1e6 * dias) / 30
  const ganadoNivel = !dias ? null
    : k.valorGanado >= metaPeriodo ? { nivel: 'ok', texto: 'En meta del período' }
    : k.valorGanado >= metaPeriodo * 0.8 ? { nivel: 'alerta', texto: 'En riesgo frente a la meta' }
    : { nivel: 'critico', texto: 'Por debajo de la meta' }
  const esperadas = variables.visitasDia * dias
  const ofertasNivel = !dias || !esperadas ? null
    : k.ofertas >= esperadas * 0.9 ? { nivel: 'ok', texto: 'Ritmo de visitas esperado' }
    : k.ofertas >= esperadas * 0.7 ? { nivel: 'alerta', texto: 'Ritmo de visitas bajo' }
    : { nivel: 'critico', texto: 'Ritmo de visitas muy bajo' }
  const tasaNivel = !decididas ? null
    : k.tasaCierre >= 0.5 ? { nivel: 'ok', texto: 'Cierre saludable' }
    : k.tasaCierre >= 0.3 ? { nivel: 'alerta', texto: 'Cierre por vigilar' }
    : { nivel: 'critico', texto: 'Cierre bajo' }
  const c1Nivel = !k.ofertas ? null
    : k.c1Promedio >= variables.margen ? { nivel: 'ok', texto: `Sobre el C1 objetivo (${variables.margen} %)` }
    : k.c1Promedio >= variables.margen - 5 ? { nivel: 'alerta', texto: `Bajo el C1 objetivo (${variables.margen} %)` }
    : { nivel: 'critico', texto: `Muy bajo el C1 objetivo (${variables.margen} %)` }

  const celdas = [
    { label: 'Ofertas generadas', icono: FileText, valor: String(n(k.ofertas)), serie: s('ofertas'), variacion: delta(k.ofertas, prev?.ofertas), desempeno: ofertasNivel,
      ayuda: `Ofertas creadas en el período (simuladas y manuales). Ritmo esperado: ${variables.visitasDia} visitas por día.` },
    { label: 'Valor ofertado', icono: Briefcase, valor: formatoCompacto(k.valorOfertado), completo: formatoCOP(k.valorOfertado), serie: s('valorOfertado'), variacion: delta(k.valorOfertado, prev?.valorOfertado),
      ayuda: 'Suma del total con IVA de todas las ofertas del período, sin importar su estado.' },
    { label: 'Valor ganado', icono: Trophy, valor: formatoCompacto(k.valorGanado), completo: formatoCOP(k.valorGanado), serie: s('valorGanado'), variacion: delta(k.valorGanado, prev?.valorGanado), desempeno: ganadoNivel,
      ayuda: `Total con IVA de las ofertas aceptadas. Es la facturación. Meta mínima del mes: $ ${variables.metaMin} M, prorrateada a los días del período.` },
    { label: 'Tasa de cierre', icono: Target, valor: formatoPct(k.tasaCierre), serie: s('tasaCierre'), variacion: delta(k.tasaCierre, prev?.tasaCierre, true), desempeno: tasaNivel,
      ayuda: 'Aceptadas ÷ (aceptadas + rechazadas). Las ofertas aún abiertas no cuentan. Variación en puntos porcentuales (pp).' },
    { label: 'C1 promedio', icono: Percent, valor: `${n(k.c1Promedio).toLocaleString('es-CO', { maximumFractionDigits: 1 })} %`, serie: s('c1Promedio'), variacion: delta(k.c1Promedio / 100, prev ? prev.c1Promedio / 100 : null, true), desempeno: c1Nivel,
      ayuda: 'Promedio simple del margen de ganancia C1 (%) de las ofertas del período.' },
    { label: 'Margen bruto ganado', icono: Coins, valor: formatoCompacto(k.margenGanado), completo: formatoCOP(k.margenGanado), serie: s('margenGanado'), variacion: delta(k.margenGanado, prev?.margenGanado),
      ayuda: 'Margen C1 en pesos (subtotal − costo) de las ofertas aceptadas, antes de IVA.' },
    { label: 'Horas vendidas', icono: Clock, valor: `${n(k.horasVendidas).toLocaleString('es-CO')} h`, serie: s('horasVendidas'), variacion: delta(k.horasVendidas, prev?.horasVendidas),
      ayuda: 'Horas de mano de obra de las ofertas aceptadas.' },
  ]
  return (
    <section aria-label="Indicadores clave">
      <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {celdas.map((c) => <Tarjeta key={c.label} c={c} comparado={comparado} />)}
      </div>
    </section>
  )
}
