import { useMemo, useState } from 'react'
import { FileDown, FileSpreadsheet, FileText, Search, X } from 'lucide-react'
import { formatoCOP, totalesOferta } from '../lib/calculos'
import { etapaOferta } from '../lib/simulacion'
import { ETAPAS } from '../lib/analitica'

const BADGE = {
  'Pendiente': 'bg-sutil text-texto-2',
  'En negociación': 'bg-primario-suave text-primario',
  'Ganada': 'bg-exito/10 text-exito-texto',
  'Perdida': 'bg-critico/10 text-critico-texto',
}

export default function TablaOfertas({ ofertas, total, dia, busqueda, onBusqueda, onPdf, onExcel, onReporte }) {
  const [etapa, setEtapa] = useState('')
  const filas = useMemo(() => {
    const t = busqueda.trim().toLowerCase()
    return ofertas
      .filter((o) => !etapa || etapaOferta(o, dia) === etapa)
      .filter((o) => !t || [o.numero, o.cliente?.nombre, o.tecnico, o.tipo].some((x) => x?.toLowerCase().includes(t)))
      .sort((a, b) => b.id - a.id)
  }, [ofertas, etapa, busqueda, dia])

  return (
    <section id="tabla-ofertas" className="card min-w-0 scroll-mt-32" aria-labelledby="h-tabla">
      <div className="flex flex-wrap items-end justify-between gap-3 px-5 pt-5 pb-4">
        <div>
          <h2 id="h-tabla" className="card-titulo">Ofertas</h2>
          <p className="card-sub mt-0.5" aria-live="polite">
            {filas.length} de {total} ofertas{ofertas.length !== total ? ' · filtros globales activos' : ''}
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <div className="relative">
            <label htmlFor="f-texto" className="sr-only">Buscar en la tabla</label>
            <Search size={15} className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-texto-3" aria-hidden="true" />
            <input id="f-texto" type="search" className="campo !w-48 !pl-8" placeholder="Buscar en la tabla" value={busqueda} onChange={(e) => onBusqueda(e.target.value)} />
          </div>
          <div>
            <label htmlFor="f-etapa" className="sr-only">Etapa</label>
            <select id="f-etapa" className="campo !w-auto" value={etapa} onChange={(e) => setEtapa(e.target.value)}>
              <option value="">Todas las etapas</option>
              {ETAPAS.map((e) => <option key={e}>{e}</option>)}
            </select>
          </div>
          <button type="button" className="btn" onClick={onExcel}>
            <FileSpreadsheet size={16} aria-hidden="true" /> Excel
          </button>
          <button type="button" className="btn" onClick={onReporte}>
            <FileText size={16} aria-hidden="true" /> Reporte PDF
          </button>
        </div>
      </div>
      {busqueda && (
        <div className="px-5 pb-3">
          <button type="button" onClick={() => onBusqueda('')} className="inline-flex items-center gap-1.5 rounded-full bg-primario-suave px-3 py-1 text-xs font-medium text-primario">
            Búsqueda: “{busqueda}” <X size={13} aria-label="Quitar búsqueda" />
          </button>
        </div>
      )}
      <div className="relative max-h-[28rem] overflow-auto border-t border-borde">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="sticky top-0 z-10 bg-sutil text-xs font-medium text-texto-2">
            <tr>
              <th className="px-5 py-2.5 font-medium">N°</th>
              <th className="px-3 py-2.5 font-medium">Día</th>
              <th className="px-3 py-2.5 font-medium">Cliente</th>
              <th className="px-3 py-2.5 font-medium">Técnico</th>
              <th className="px-3 py-2.5 font-medium">Tipo</th>
              <th className="px-3 py-2.5 text-right font-medium">Total</th>
              <th className="px-3 py-2.5 font-medium">Etapa</th>
              <th className="px-5 py-2.5 text-right font-medium">PDF</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((o) => {
              const e = etapaOferta(o, dia)
              return (
                <tr key={o.id} className="border-t border-borde transition-colors hover:bg-sutil/60">
                  <td className="px-5 py-2.5 font-medium text-texto">
                    {o.numero}
                    {o.origen === 'manual' && <span className="ml-2 rounded bg-sutil px-1.5 py-0.5 text-[0.6875rem] font-normal text-texto-2">manual</span>}
                  </td>
                  <td className="px-3 py-2.5 text-texto-2">{o.dia}</td>
                  <td className="max-w-56 truncate px-3 py-2.5 text-texto">{o.cliente.nombre}</td>
                  <td className="px-3 py-2.5 text-texto-2">{o.tecnico || 'Sin asignar'}</td>
                  <td className="px-3 py-2.5 text-texto-2">{o.tipo}</td>
                  <td className="px-3 py-2.5 text-right font-medium text-texto">{formatoCOP(totalesOferta(o).total)}</td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${BADGE[e]}`}>{e}</span>
                  </td>
                  <td className="px-5 py-2 text-right">
                    <button type="button" className="btn-icono !size-8" onClick={() => onPdf(o)} aria-label={`Descargar PDF de ${o.numero}`}>
                      <FileDown size={16} aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {!filas.length && (
          <p className="p-8 text-center text-sm text-texto-2">
            {total ? 'Ninguna oferta coincide con los filtros o la búsqueda.' : 'Aún no hay ofertas. Inicia la simulación o crea un requerimiento.'}
          </p>
        )}
      </div>
    </section>
  )
}
