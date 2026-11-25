import Card, { Vacio } from './Card'
import { formatoCOP } from '../lib/calculos'
import { formatoCompacto, formatoPct } from '../lib/formato'

function Lista({ filas, detalle }) {
  const max = Math.max(...filas.map((f) => f.ganado), 1)
  return (
    <ol className="space-y-3.5">
      {filas.map((f, i) => (
        <li key={f.nombre} className="flex items-center gap-3">
          <span className={`grid size-6 shrink-0 place-items-center rounded-md text-xs font-semibold tabular-nums ${i === 0 ? 'bg-primario text-white dark:text-fondo' : 'bg-sutil text-texto-2'}`}>
            {i + 1}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="truncate text-sm font-medium text-texto">{f.nombre}</span>
              <span className="shrink-0 text-sm font-semibold text-texto tabular-nums" title={formatoCOP(f.ganado)}>{formatoCompacto(f.ganado)}</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-sutil">
              <div className="h-full rounded-full bg-primario transition-[width] duration-500 ease-out" style={{ width: `${(f.ganado / max) * 100}%` }} />
            </div>
            <p className="mt-1 text-xs text-texto-2 tabular-nums">{detalle(f)}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

export function RankingTecnicos({ filas }) {
  return (
    <Card id="h-ranking" titulo="Ranking de técnicos" sub="Valor ganado de las ofertas que salen de sus requerimientos">
      {filas.length ? (
        <Lista filas={filas.slice(0, 5)} detalle={(f) => `${f.ofertas} requerimientos · cierre ${formatoPct(f.tasa)}`} />
      ) : (
        <Vacio />
      )}
    </Card>
  )
}

export function TopClientes({ filas }) {
  return (
    <Card id="h-clientes" titulo="Top clientes por facturación" sub="Valor ganado en el período · clientes ficticios">
      {filas.length ? (
        <Lista filas={filas} detalle={(f) => `${f.aceptadas} de ${f.ofertas} ofertas aprobadas`} />
      ) : (
        <Vacio>Aún no hay ofertas aprobadas en el período.</Vacio>
      )}
    </Card>
  )
}
