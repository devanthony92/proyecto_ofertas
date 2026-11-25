import { useEffect, useMemo, useState } from 'react'
import { Trash2, X, Plus } from 'lucide-react'
import catalogo from '../data/catalogo.json'
import { formatoCOP, totalesOferta } from '../lib/calculos'

const CATEGORIAS = [...new Set(catalogo.map((c) => c.categoria))]
const hoy = () => new Date().toISOString().slice(0, 10)
const vacio = () => ({
  nombre: '', nit: '', direccion: '', contacto: '',
  tipo: 'Instalación', tecnico: '', fechaVisita: hoy(), items: [], horas: 0,
})

function Campo({ id, label, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-texto-2">{label}</label>
      {children}
      {error && <p className="mt-1 text-sm text-critico-texto" role="alert">{error}</p>}
    </div>
  )
}

export default function FormOferta({ variables, dia, siguienteId, onGuardar, onClose }) {
  const [f, setF] = useState(() => ({ ...vacio(), c1: variables.margen }))
  const [errores, setErrores] = useState({})
  const [sel, setSel] = useState('')

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    // bloquea el scroll del dashboard detrás del modal
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))
  const setItem = (i, k, v) => setF((p) => ({ ...p, items: p.items.map((it, j) => (j === i ? { ...it, [k]: v } : it)) }))

  const agregarCatalogo = () => {
    const c = catalogo.find((x) => x.id === sel)
    if (!c) return
    setF((p) => ({ ...p, items: [...p.items, { descripcion: c.descripcion, cantidad: 1, precio: c.precio, libre: false }] }))
    setSel('')
  }
  const agregarLibre = () =>
    setF((p) => ({ ...p, items: [...p.items, { descripcion: '', cantidad: 1, precio: 0, libre: true }] }))

  const oferta = useMemo(
    () => ({
      cliente: { nombre: f.nombre.trim(), nit: f.nit.trim(), direccion: f.direccion.trim(), contacto: f.contacto.trim() },
      tipo: f.tipo,
      tecnico: f.tecnico.trim(),
      fechaVisita: f.fechaVisita,
      items: f.items.map(({ descripcion, cantidad, precio }) => ({ descripcion: descripcion.trim(), cantidad: Number(cantidad) || 0, precio: Number(precio) || 0 })),
      horas: Number(f.horas) || 0,
      tarifaHora: variables.tarifaHora,
      margen: Number(f.c1) || 0,
      iva: variables.iva,
    }),
    [f, variables],
  )
  const t = totalesOferta(oferta)

  const [intentado, setIntentado] = useState(false)
  const validar = () => {
    const e = {}
    if (!f.nombre.trim()) e.nombre = 'Escribe el nombre del cliente.'
    if (!f.items.length && !(Number(f.horas) > 0)) e.items = 'Agrega al menos un ítem o indica horas de mano de obra.'
    if (f.items.some((i) => !i.descripcion.trim())) e.items = 'Todos los ítems necesitan descripción.'
    else if (f.items.some((i) => !(Number(i.cantidad) > 0) || Number(i.precio) < 0)) e.items = 'Revisa cantidades (mayores a 0) y precios (no negativos).'
    if (Number(f.horas) < 0) e.horas = 'Las horas no pueden ser negativas.'
    if (!(Number(f.c1) >= 1 && Number(f.c1) <= 100)) e.c1 = 'C1 debe estar entre 1 y 100 %.'
    setErrores(e)
    return Object.keys(e).length === 0
  }
  // Tras el primer intento de guardar, los errores se recalculan al corregir.
  useEffect(() => {
    if (intentado) validar()
  }, [f]) // eslint-disable-line react-hooks/exhaustive-deps

  const guardar = (descargar) => {
    setIntentado(true)
    if (!validar()) return
    const id = siguienteId
    onGuardar(
      { ...oferta, id, numero: 'OF-' + String(id).padStart(4, '0'), dia, origen: 'manual', estado: 'Enviada' },
      descargar,
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-6">
      <div className="absolute inset-0 bg-[#0b1120]/55" onClick={onClose} aria-hidden="true" />
      <aside role="dialog" aria-modal="true" aria-labelledby="h-form" className="relative flex h-full w-full flex-col bg-superficie shadow-2xl sm:h-auto sm:max-h-[90vh] sm:max-w-3xl sm:rounded-[var(--radius-card)] sm:border sm:border-borde">
        <div className="flex items-center justify-between border-b border-borde px-5 py-4">
          <h2 id="h-form" className="text-lg font-semibold tracking-tight">Nuevo requerimiento</h2>
          <button type="button" className="btn-icono" onClick={onClose} aria-label="Cerrar formulario"><X size={18} aria-hidden="true" /></button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          <fieldset className="grid gap-3 sm:grid-cols-2">
            <legend className="mb-2 text-sm font-semibold text-texto">Cliente</legend>
            <div className="sm:col-span-2">
              <Campo id="o-nombre" label="Nombre del cliente" error={errores.nombre}>
                <input id="o-nombre" className="campo" aria-invalid={!!errores.nombre} value={f.nombre} onChange={(e) => set('nombre', e.target.value)} />
              </Campo>
            </div>
            <Campo id="o-nit" label="NIT"><input id="o-nit" className="campo" value={f.nit} onChange={(e) => set('nit', e.target.value)} /></Campo>
            <Campo id="o-contacto" label="Contacto"><input id="o-contacto" className="campo" value={f.contacto} onChange={(e) => set('contacto', e.target.value)} /></Campo>
            <div className="sm:col-span-2">
              <Campo id="o-dir" label="Dirección"><input id="o-dir" className="campo" value={f.direccion} onChange={(e) => set('direccion', e.target.value)} /></Campo>
            </div>
          </fieldset>

          <fieldset className="grid gap-3 sm:grid-cols-2">
            <legend className="mb-2 text-sm font-semibold text-texto">Visita</legend>
            <div className="sm:col-span-2" role="group" aria-label="Tipo de trabajo">
              <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-borde-fuerte">
                {['Instalación', 'Reparación'].map((tp) => (
                  <button
                    key={tp}
                    type="button"
                    aria-pressed={f.tipo === tp}
                    onClick={() => set('tipo', tp)}
                    className={`min-h-9 px-3 text-sm font-medium ${f.tipo === tp ? 'bg-primario text-white dark:text-fondo' : 'bg-superficie text-texto hover:bg-sutil'}`}
                  >
                    {tp === 'Instalación' ? 'Instalación nueva' : 'Reparación'}
                  </button>
                ))}
              </div>
            </div>
            <Campo id="o-tec" label="Técnico"><input id="o-tec" className="campo" value={f.tecnico} onChange={(e) => set('tecnico', e.target.value)} /></Campo>
            <Campo id="o-fecha" label="Fecha de visita"><input id="o-fecha" type="date" className="campo" value={f.fechaVisita} onChange={(e) => set('fechaVisita', e.target.value)} /></Campo>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-texto">Ítems</legend>
            <div className="flex flex-wrap items-end gap-2">
              <div className="min-w-0 flex-1">
                <label htmlFor="o-cat" className="mb-1 block text-sm font-medium text-texto-2">Ítem del catálogo</label>
                <select id="o-cat" className="campo" value={sel} onChange={(e) => setSel(e.target.value)}>
                  <option value="">Selecciona un ítem</option>
                  {CATEGORIAS.map((c) => (
                    <optgroup key={c} label={c}>
                      {catalogo.filter((x) => x.categoria === c).map((x) => (
                        <option key={x.id} value={x.id}>{x.descripcion} ({formatoCOP(x.precio)})</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <button type="button" className="btn" onClick={agregarCatalogo} disabled={!sel}><Plus size={16} aria-hidden="true" />Agregar</button>
              <button type="button" className="btn" onClick={agregarLibre}>Ítem libre</button>
            </div>
            {errores.items && <p className="mt-2 text-sm text-critico-texto" role="alert">{errores.items}</p>}

            {f.items.length > 0 && (
              <ul className="mt-3 space-y-3">
                {f.items.map((it, i) => (
                  <li key={i} className="rounded-lg border border-borde bg-superficie p-3">
                    <div className="flex items-end gap-2">
                      <div className="min-w-0 flex-1">
                        <label htmlFor={`i-d-${i}`} className="mb-1 block text-xs font-medium text-texto-2">Descripción</label>
                        <input id={`i-d-${i}`} className="campo" readOnly={!it.libre} value={it.descripcion} onChange={(e) => setItem(i, 'descripcion', e.target.value)} />
                      </div>
                      <button type="button" className="btn btn-sm" aria-label={`Eliminar ítem ${i + 1}`} onClick={() => setF((p) => ({ ...p, items: p.items.filter((_, j) => j !== i) }))}>
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      <div>
                        <label htmlFor={`i-c-${i}`} className="mb-1 block text-xs font-medium text-texto-2">Cantidad</label>
                        <input id={`i-c-${i}`} type="number" min="1" className="campo tabular-nums" value={it.cantidad} onChange={(e) => setItem(i, 'cantidad', e.target.value)} />
                      </div>
                      <div>
                        <label htmlFor={`i-p-${i}`} className="mb-1 block text-xs font-medium text-texto-2">Precio (COP)</label>
                        <input id={`i-p-${i}`} type="number" min="0" className="campo tabular-nums" value={it.precio} onChange={(e) => setItem(i, 'precio', e.target.value)} />
                      </div>
                      <div>
                        <span className="mb-1 block text-xs font-medium text-texto-2">Total</span>
                        <p className="flex min-h-9 items-center text-sm font-medium tabular-nums">{formatoCOP((Number(it.cantidad) || 0) * (Number(it.precio) || 0))}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </fieldset>

          <div className="grid gap-3 sm:grid-cols-2">
            <Campo id="o-horas" label={`Horas de mano de obra (tarifa ${formatoCOP(variables.tarifaHora)} por hora)`} error={errores.horas}>
              <input id="o-horas" type="number" min="0" className="campo tabular-nums" aria-invalid={!!errores.horas} value={f.horas} onChange={(e) => set('horas', e.target.value)} />
            </Campo>
            <Campo id="o-c1" label="C1: margen de ganancia (%)" error={errores.c1}>
              <input id="o-c1" type="number" min="1" max="100" className="campo tabular-nums" aria-invalid={!!errores.c1} value={f.c1} onChange={(e) => set('c1', e.target.value)} />
            </Campo>
          </div>

          <dl className="card space-y-1.5 p-4 text-sm tabular-nums" aria-live="polite">
            {[
              ['Ítems', t.costoItems],
              ['Mano de obra', t.manoObra],
              [`Margen C1 (${Number(f.c1) || 0} %)`, t.margenValor],
              ['Subtotal', t.subtotal],
              [`IVA (${variables.iva} %)`, t.ivaValor],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between"><dt className="text-texto-2">{k}</dt><dd>{formatoCOP(v)}</dd></div>
            ))}
            <div className="flex items-baseline justify-between border-t border-borde pt-2">
              <dt className="text-base font-semibold">Total</dt>
              <dd className="text-2xl font-semibold">{formatoCOP(t.total)}</dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-borde px-5 py-4">
          <button type="button" className="btn" onClick={() => guardar(true)}>Guardar y descargar PDF</button>
          <button type="button" className="btn btn-primario" onClick={() => guardar(false)}>Guardar oferta</button>
        </div>
      </aside>
    </div>
  )
}
