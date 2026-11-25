import { useMemo, useState } from 'react'
import { FileDown, FileSpreadsheet, FileText } from 'lucide-react'
import { formatoCOP, totalesOferta } from '../lib/calculos'

const BADGE = {
  Enviada: 'bg-enviada/10 text-enviada border-enviada/30',
  Aceptada: 'bg-aceptada/10 text-aceptada border-aceptada/30',
  Rechazada: 'bg-rechazada/10 text-rechazada border-rechazada/30',
}

export default function TablaOfertas({ ofertas, onPdf, onExcel, onReporte }) {
  const [estado, setEstado] = useState('')
  const [tipo, setTipo] = useState('')
  const filas = useMemo(
    () =>
      ofertas
        .filter((o) => (!estado || o.estado === estado) && (!tipo || o.tipo === tipo))
        .sort((a, b) => b.id - a.id),
    [ofertas, estado, tipo],
  )
  return (
    <section className="placa" aria-labelledby="h-tabla">
      <div className="flex flex-wrap items-end justify-between gap-3 p-4">
        <div>
          <h2 id="h-tabla" className="font-display text-lg font-semibold">
            Ofertas
          </h2>
          <p className="text-sm text-acero-600" aria-live="polite">
            {filas.length} de {ofertas.length} ofertas
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="f-estado" className="mb-1 block text-xs font-medium text-acero-700">
              Estado
            </label>
            <select id="f-estado" className="campo" value={estado} onChange={(e) => setEstado(e.target.value)}>
              <option value="">Todos</option>
              <option>Enviada</option>
              <option>Aceptada</option>
              <option>Rechazada</option>
            </select>
          </div>
          <div>
            <label htmlFor="f-tipo" className="mb-1 block text-xs font-medium text-acero-700">
              Tipo
            </label>
            <select id="f-tipo" className="campo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="">Todos</option>
              <option>Instalación</option>
              <option>Reparación</option>
            </select>
          </div>
          <button type="button" className="btn" onClick={onExcel}>
            <FileSpreadsheet size={18} aria-hidden="true" />
            Exportar Excel
          </button>
          <button type="button" className="btn" onClick={onReporte}>
            <FileText size={18} aria-hidden="true" />
            Reporte PDF
          </button>
        </div>
      </div>
      <div className="max-h-96 overflow-auto border-t border-acero-300">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="sticky top-0 bg-acero-100 font-display text-xs uppercase tracking-wide text-acero-600">
            <tr>
              <th className="px-4 py-2">N°</th>
              <th className="px-4 py-2">Día</th>
              <th className="px-4 py-2">Cliente</th>
              <th className="px-4 py-2">Tipo</th>
              <th className="px-4 py-2 text-right">Total</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2 text-right">PDF</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((o) => (
              <tr key={o.id} className="border-t border-acero-200">
                <td className="px-4 py-2 font-medium">{o.numero}</td>
                <td className="px-4 py-2">{o.dia}</td>
                <td className="px-4 py-2">{o.cliente.nombre}</td>
                <td className="px-4 py-2">{o.tipo}</td>
                <td className="px-4 py-2 text-right">{formatoCOP(totalesOferta(o).total)}</td>
                <td className="px-4 py-2">
                  <span className={`inline-block rounded border px-2 py-0.5 text-xs font-medium ${BADGE[o.estado]}`}>
                    {o.estado}
                  </span>
                </td>
                <td className="px-4 py-2 text-right">
                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={() => onPdf(o)}
                    aria-label={`Descargar PDF de ${o.numero}`}
                  >
                    <FileDown size={16} aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filas.length && (
          <p className="p-6 text-center text-sm text-acero-600">
            {ofertas.length
              ? 'Ninguna oferta coincide con los filtros.'
              : 'Aún no hay ofertas. Inicia la simulación o crea una con "Nuevo requerimiento".'}
          </p>
        )}
      </div>
    </section>
  )
}
