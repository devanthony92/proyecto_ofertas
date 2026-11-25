import Card from './Card'
import { formatoCOP } from '../lib/calculos'
import { formatoCompacto } from '../lib/formato'

// Pronóstico estadístico (proyección lineal), no un modelo de IA.
export default function Pronostico({ p, metaMin, metaMax, dia, diaMax, filtrado }) {
  const min = metaMin * 1e6
  const max = metaMax * 1e6
  const escala = Math.max(max * 1.25, p.proyectado * 1.05, 1)
  const x = (v) => `${Math.min(100, (v / escala) * 100)}%`
  const estado = !p.fiable ? null
    : p.proyectado >= min ? { t: p.proyectado > max ? 'Sobre la meta' : 'Dentro de la meta', c: 'text-exito-texto bg-exito/10' }
    : p.proyectado >= min * 0.85 ? { t: 'Cerca de la meta', c: 'text-alerta-texto bg-alerta/10' }
    : { t: 'Bajo la meta', c: 'text-critico-texto bg-critico/10' }
  const filas = [
    ['Ganado a la fecha', p.ganado],
    ['Ritmo diario', p.ritmo],
    ['Valor abierto (sin decidir)', p.abierto],
    ['Esperado de lo abierto', p.esperadoAbierto],
  ]
  return (
    <Card
      id="h-pronostico"
      titulo="Pronóstico de cierre"
      sub="Proyección lineal del valor ganado al día 30"
      accion={estado && <span className={`rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${estado.c}`}>{estado.t}</span>}
    >
      <p className="text-3xl font-semibold tracking-tight text-texto tabular-nums" title={formatoCOP(p.proyectado)}>
        {p.fiable ? formatoCompacto(p.proyectado) : '—'}
      </p>
      <p className="mt-1 text-sm text-texto-2">
        {p.fiable
          ? dia >= diaMax ? 'Mes cerrado: valor ganado final.' : `Proyectado al cierre con ${dia} de ${diaMax} días.`
          : 'Disponible desde el día 5: antes la proyección es muy inestable.'}
      </p>

      <div className="relative mt-5 mb-8 h-2 rounded-full bg-sutil" aria-hidden="true">
        <div className="absolute inset-y-0 rounded-full bg-exito/30" style={{ left: x(min), width: `calc(${x(max)} - ${x(min)})` }} />
        <div className="absolute inset-y-0 left-0 rounded-full bg-primario" style={{ width: x(p.ganado) }} />
        {p.fiable && <div className="absolute -top-1.5 h-5 w-0.5 -translate-x-1/2 rounded bg-texto" style={{ left: x(p.proyectado) }} />}
        <span className="absolute top-4 -translate-x-1/2 text-[0.6875rem] whitespace-nowrap text-texto-2 tabular-nums" style={{ left: x(min) }}>$ {metaMin} M</span>
        <span className="absolute top-4 -translate-x-1/2 text-[0.6875rem] whitespace-nowrap text-texto-2 tabular-nums" style={{ left: x(max) }}>$ {metaMax} M</span>
      </div>

      <dl className="space-y-2 text-sm">
        {filas.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3">
            <dt className="text-texto-2">{k}</dt>
            <dd className="font-medium text-texto tabular-nums" title={formatoCOP(v)}>{formatoCompacto(v)}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 border-t border-borde pt-3 text-xs leading-relaxed text-texto-2">
        Método: ganado ÷ días transcurridos × 30. Lo esperado de lo abierto = valor abierto × tasa de cierre observada. Es una proyección estadística sobre datos simulados, no un modelo de IA.
        {filtrado && ' Con filtros activos se proyecta solo ese subconjunto.'}
      </p>
    </Card>
  )
}
