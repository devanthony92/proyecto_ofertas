import { Play, Pause, RotateCcw } from 'lucide-react'

export default function Controles({ dia, diaMax, corriendo, onIniciar, onPausa, onReinicio }) {
  const terminada = dia >= diaMax
  const pausada = !corriendo && dia > 0 && !terminada
  const estado = corriendo ? 'En curso' : terminada ? 'Finalizada' : pausada ? 'En pausa' : 'Detenida'
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
      <div className="flex items-center gap-3">
        <div
          className="rounded bg-acero-900 px-3 py-1.5 font-display text-3xl font-semibold leading-none tabular-nums shadow-[inset_0_2px_4px_rgb(0_0_0/0.6)]"
          style={{ color: corriendo ? 'var(--color-ambar-400)' : 'var(--color-acero-300)' }}
          aria-live="polite"
          aria-label={`Día ${dia} de ${diaMax}, ${estado}`}
        >
          <span aria-hidden="true">
            DÍA {String(dia).padStart(2, '0')} / {diaMax}
          </span>
        </div>
        <span className="w-20 text-sm text-acero-200">{estado}</span>
      </div>
      <div className="flex gap-4">
        <button type="button" className="pulsador" onClick={onIniciar} disabled={terminada} aria-pressed={corriendo}>
          <span>
            <Play size={20} aria-hidden="true" />
          </span>
          Iniciar
        </button>
        <button type="button" className="pulsador" onClick={onPausa} disabled={!corriendo} aria-pressed={pausada}>
          <span>
            <Pause size={20} aria-hidden="true" />
          </span>
          Pausa
        </button>
        <button type="button" className="pulsador" onClick={onReinicio}>
          <span>
            <RotateCcw size={20} aria-hidden="true" />
          </span>
          Reinicio
        </button>
      </div>
    </div>
  )
}
