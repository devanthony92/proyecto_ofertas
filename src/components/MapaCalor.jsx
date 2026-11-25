import Card from './Card'

const tono = (x) => `color-mix(in srgb, var(--primario) ${Math.round(22 + x * 78)}%, transparent)`

// Requerimientos levantados por técnico y día del mes (cada uno da origen a una oferta).
// Intensidad = cantidad relativa al máximo.
export default function MapaCalor({ datos, dia, diaMax, desde }) {
  const { filas, max } = datos
  const dias = Array.from({ length: diaMax }, (_, i) => i + 1)
  return (
    <Card id="h-calor" titulo="Actividad comercial" sub="Requerimientos levantados por técnico y día del mes simulado">
      <div className="relative overflow-x-auto">
        <table className="w-full min-w-[640px] table-fixed border-separate border-spacing-[3px] text-xs">
          <caption className="sr-only">Cantidad de requerimientos por técnico (filas) y día (columnas)</caption>
          <thead>
            <tr>
              <th scope="col" className="w-28 text-left font-medium text-texto-2"><span className="sr-only">Técnico</span></th>
              {dias.map((d) => (
                <th key={d} scope="col" className={`h-5 p-0 text-center tabular-nums ${d === dia ? 'font-semibold text-primario' : 'font-normal text-texto-3'}`}>
                  {d === 1 || d % 5 === 0 || d === dia ? d : ''}
                </th>
              ))}
              <th scope="col" className="w-12 pl-2 text-right font-medium text-texto-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((f) => (
              <tr key={f.tecnico}>
                <th scope="row" className="max-w-32 truncate pr-2 text-left font-medium text-texto">{f.tecnico}</th>
                {f.dias.map((n, i) => {
                  const d = i + 1
                  const futuro = d > dia
                  return (
                    <td
                      key={d}
                      title={futuro ? `Día ${d}: aún no simulado` : `${f.tecnico}, día ${d}: ${n} ${n === 1 ? 'requerimiento' : 'requerimientos'}`}
                      className={`h-6 rounded-[4px] p-0 ${futuro || !n ? 'bg-sutil' : ''} ${futuro ? 'opacity-50' : ''} ${d < desde ? 'opacity-35' : ''}`}
                      style={!futuro && n ? { background: tono(n / (max || 1)) } : undefined}
                    >
                      <span className="sr-only">{futuro ? 'sin simular' : n}</span>
                    </td>
                  )
                })}
                <td className="pl-2 text-right font-semibold text-texto tabular-nums">{f.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex items-center justify-end gap-1.5 text-xs text-texto-2" aria-hidden="true">
        Menos
        {[0, 0.25, 0.5, 0.75, 1].map((x) => (
          <span key={x} className="size-3 rounded-[3px]" style={{ background: x ? tono(x) : 'var(--sutil)' }} />
        ))}
        Más
      </div>
    </Card>
  )
}
