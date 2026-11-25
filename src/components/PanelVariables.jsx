import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { VARIABLES_DEFECTO } from '../lib/calculos'

const CAMPOS = [
  ['tarifaHora', 'Tarifa hora técnico', 'COP', false],
  ['margen', 'C1 por defecto (margen)', '%', true],
  ['iva', 'IVA', '%', true],
  ['visitasDia', 'Visitas por día', 'visitas', false],
  ['probCierre', 'Probabilidad de cierre', '%', true],
  ['pctInstalacion', 'Instalaciones nuevas', '%', true],
  ['velocidad', 'Velocidad', 's por día', false],
  ['metaMin', 'Meta mensual mínima', 'millones COP', false],
  ['metaMax', 'Meta mensual máxima', 'millones COP', false],
]

// Modal de configuración: usa <dialog> nativo (Esc y foco atrapado sin código extra).
export default function PanelVariables({ abierto, variables, onChange, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (abierto && !d.open) d.showModal()
    if (!abierto && d.open) d.close()
  }, [abierto])

  const set = (k, pct, raw) => {
    let v = raw === '' ? 0 : Number(raw)
    if (!Number.isFinite(v)) return
    v = Math.max(0, v)
    if (pct) v = Math.min(100, v)
    if (k === 'margen') v = Math.max(1, v)
    if (k === 'velocidad') v = Math.max(0.1, v)
    onChange({ ...variables, [k]: v })
  }

  return (
    <dialog
      ref={ref}
      aria-labelledby="config-titulo"
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="card m-auto w-[min(32rem,calc(100%-2rem))] p-0 text-texto backdrop:bg-[#0b1120]/55"
    >
      <div className="flex items-center justify-between border-b border-borde px-5 py-4">
        <h2 id="config-titulo" className="text-lg font-semibold tracking-tight">Configuración</h2>
        <button type="button" className="btn-icono" aria-label="Cerrar configuración" onClick={onClose}>
          <X size={18} aria-hidden="true" />
        </button>
      </div>
      <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
        <p className="mb-4 text-sm text-texto-2">
          Los valores por defecto dejan la facturación simulada del mes (valor ganado) alrededor de
          $ 200 a 300 millones, el promedio de una sede de servicio.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {CAMPOS.map(([k, label, unidad, pct]) => (
            <div key={k}>
              <label htmlFor={`v-${k}`} className="mb-1 block text-sm font-medium text-texto-2">
                {label} <span className="font-normal text-texto-3">({unidad})</span>
              </label>
              <input
                id={`v-${k}`}
                type="number"
                inputMode="decimal"
                min={k === 'velocidad' ? 0.1 : 0}
                max={pct ? 100 : undefined}
                step={k === 'velocidad' ? 0.1 : 1}
                className="campo tabular-nums"
                value={variables[k]}
                onChange={(e) => set(k, pct, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-between gap-3 border-t border-borde px-5 py-4">
        <button type="button" className="btn" onClick={() => onChange({ ...VARIABLES_DEFECTO })}>
          Restaurar valores
        </button>
        <button type="button" className="btn btn-primario" onClick={onClose}>
          Listo
        </button>
      </div>
    </dialog>
  )
}
