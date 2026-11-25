import { Play, Pause, RotateCcw, StepForward, FastForward, Plus, CalendarRange, Filter } from 'lucide-react'
import { PERIODOS } from '../lib/analitica'

// Barra de mando bajo el encabezado: período, filtros globales, progreso del mes y simulación.
export default function Controles({
  dia, diaMax, corriendo, onIniciar, onPausa, onReinicio, onAvanzar, onNueva,
  periodo, onPeriodo, tipo, onTipo, tecnico, onTecnico, tecnicos,
}) {
  const terminada = dia >= diaMax
  const pausada = !corriendo && dia > 0 && !terminada
  const estado = corriendo ? 'En curso' : terminada ? 'Mes cerrado' : pausada ? 'En pausa' : 'Detenida'
  const color = corriendo ? 'bg-exito' : terminada ? 'bg-primario' : pausada ? 'bg-alerta' : 'bg-texto-3'
  const pct = Math.round((dia / diaMax) * 100)

  return (
    <div className="border-t border-borde">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-x-4 gap-y-3 px-4 py-2.5 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative">
            <span className="sr-only">Período</span>
            <CalendarRange size={15} className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-texto-2" aria-hidden="true" />
            <select className="campo !w-auto !py-1 !pl-8 font-medium" value={periodo} onChange={(e) => onPeriodo(e.target.value)}>
              {PERIODOS.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
            </select>
          </label>
          <label className="relative">
            <span className="sr-only">Tipo de trabajo</span>
            <Filter size={15} className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-texto-2" aria-hidden="true" />
            <select className="campo !w-auto !py-1 !pl-8" value={tipo} onChange={(e) => onTipo(e.target.value)}>
              <option value="">Todos los tipos</option>
              <option value="Instalación">Instalación</option>
              <option value="Reparación">Reparación</option>
            </select>
          </label>
          <label>
            <span className="sr-only">Técnico</span>
            <select className="campo !w-auto !py-1" value={tecnico} onChange={(e) => onTecnico(e.target.value)}>
              <option value="">Todos los técnicos</option>
              {tecnicos.map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
        </div>

        <div className="flex min-w-[13rem] flex-1 items-center gap-3 lg:max-w-sm">
          <div className="leading-tight" aria-live="polite" aria-label={`Día ${dia} de ${diaMax}, ${estado}`}>
            <p className="text-sm font-semibold whitespace-nowrap text-texto tabular-nums" aria-hidden="true">
              DÍA {dia} / {diaMax}
            </p>
            <p className="flex items-center gap-1.5 text-xs whitespace-nowrap text-texto-2" aria-hidden="true">
              <span className={`size-1.5 rounded-full ${color} ${corriendo ? 'animate-pulse' : ''}`} />
              {estado}
            </p>
          </div>
          <div
            className="h-1.5 flex-1 overflow-hidden rounded-full bg-sutil"
            role="progressbar"
            aria-label="Progreso del mes simulado"
            aria-valuemin={0}
            aria-valuemax={diaMax}
            aria-valuenow={dia}
          >
            <div className="h-full rounded-full bg-primario transition-[width] duration-500 ease-out" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
          <div className="flex items-center rounded-[var(--radius-control)] border border-borde-fuerte bg-superficie p-0.5" role="group" aria-label="Simulación">
            {corriendo ? (
              <button type="button" className="btn btn-sm !border-0" onClick={onPausa}>
                <Pause size={15} aria-hidden="true" /> Pausa
              </button>
            ) : (
              <button type="button" className="btn btn-sm !border-0 !text-primario" onClick={onIniciar} disabled={terminada}>
                <Play size={15} aria-hidden="true" /> {pausada ? 'Reanudar' : 'Iniciar'}
              </button>
            )}
            <span className="mx-0.5 h-5 w-px bg-borde" aria-hidden="true" />
            <button type="button" className="btn btn-sm !border-0" onClick={() => onAvanzar(1)} disabled={corriendo || terminada} title="Avanzar un día (con la simulación detenida)">
              <StepForward size={15} aria-hidden="true" /> +1 día
            </button>
            <button type="button" className="btn btn-sm !border-0" onClick={() => onAvanzar(7)} disabled={corriendo || terminada} title="Avanzar siete días (con la simulación detenida)">
              <FastForward size={15} aria-hidden="true" /> +7 días
            </button>
            <span className="mx-0.5 h-5 w-px bg-borde" aria-hidden="true" />
            <button type="button" className="btn btn-sm !border-0" onClick={onReinicio} title="Reiniciar el mes (guarda el mes actual como mes anterior)">
              <RotateCcw size={15} aria-hidden="true" /> <span className="max-sm:sr-only">Reinicio</span>
            </button>
          </div>
          <button type="button" className="btn btn-primario" onClick={onNueva}>
            <Plus size={16} aria-hidden="true" /> Nuevo requerimiento
          </button>
        </div>
      </div>
    </div>
  )
}
