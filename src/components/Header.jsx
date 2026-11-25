import { useEffect, useMemo, useRef, useState } from 'react'
import { Bell, Moon, Search, Settings, Sun, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import { formatoCOP, totalesOferta } from '../lib/calculos'

const ICONOS = {
  alerta: [AlertTriangle, 'text-alerta-texto'],
  ok: [CheckCircle2, 'text-exito-texto'],
  info: [Info, 'text-primario'],
}

// Marca ficticia: cabina con flechas de subida y bajada. No corresponde a ninguna empresa real.
function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <svg viewBox="0 0 32 32" className="size-8 shrink-0" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill="var(--primario)" />
        <rect x="9" y="7" width="14" height="18" rx="2" fill="none" stroke="#fff" strokeWidth="1.8" />
        <path d="M16 7v18" stroke="#fff" strokeWidth="1.8" opacity=".45" />
        <path d="M12.5 13.5 14 12l1.5 1.5M16.5 18.5 18 20l1.5-1.5" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="leading-tight">
        <p className="text-[0.9375rem] font-semibold tracking-tight text-texto">Elevia</p>
        <p className="text-xs text-texto-2">Ofertas</p>
      </div>
    </div>
  )
}

function useReloj() {
  const [ahora, setAhora] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setAhora(new Date()), 15000)
    return () => clearInterval(id)
  }, [])
  return ahora
}

// Cierra un popover al hacer clic fuera o con Escape.
function usePopover() {
  const [abierto, setAbierto] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!abierto) return undefined
    const fuera = (e) => ref.current && !ref.current.contains(e.target) && setAbierto(false)
    const esc = (e) => e.key === 'Escape' && setAbierto(false)
    document.addEventListener('mousedown', fuera)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', fuera)
      document.removeEventListener('keydown', esc)
    }
  }, [abierto])
  return { abierto, setAbierto, ref }
}

function Busqueda({ id, ofertas, onElegir }) {
  const [q, setQ] = useState('')
  const { abierto, setAbierto, ref } = usePopover()
  const input = useRef(null)

  useEffect(() => {
    const atajo = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        input.current?.focus()
      }
    }
    window.addEventListener('keydown', atajo)
    return () => window.removeEventListener('keydown', atajo)
  }, [])

  const resultados = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (!t) return []
    return ofertas
      .filter((o) => [o.numero, o.cliente?.nombre, o.tecnico, o.tipo].some((x) => x?.toLowerCase().includes(t)))
      .sort((a, b) => b.id - a.id)
      .slice(0, 6)
  }, [q, ofertas])

  const elegir = (texto) => {
    onElegir(texto)
    setAbierto(false)
    input.current?.blur()
  }

  return (
    <div ref={ref} className="relative w-full max-w-md">
      <label htmlFor={id} className="sr-only">Buscar ofertas, clientes o técnicos</label>
      <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-texto-3" aria-hidden="true" />
      <input
        ref={input}
        id={id}
        type="search"
        autoComplete="off"
        placeholder="Buscar oferta, cliente o técnico"
        className="campo !rounded-full !bg-sutil !pl-9 !pr-14 hover:!bg-superficie focus:!bg-superficie"
        value={q}
        onChange={(e) => {
          setQ(e.target.value)
          setAbierto(true)
        }}
        onFocus={() => setAbierto(true)}
        onKeyDown={(e) => e.key === 'Enter' && q.trim() && elegir(q.trim())}
        role="combobox"
        aria-expanded={abierto && !!q.trim()}
        aria-controls={`${id}-resultados`}
      />
      {!q && (
        <kbd className="pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 rounded border border-borde px-1.5 text-[0.6875rem] text-texto-3 sm:block">
          Ctrl K
        </kbd>
      )}
      {abierto && q.trim() && (
        <div id={`${id}-resultados`} className="popover left-0 w-full overflow-hidden p-1.5" role="listbox">
          {resultados.length ? (
            resultados.map((o) => (
              <button
                key={o.id}
                type="button"
                role="option"
                aria-selected="false"
                onClick={() => elegir(o.numero)}
                className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-sutil"
              >
                <span className="min-w-0">
                  <span className="font-medium text-texto">{o.numero}</span>
                  <span className="block truncate text-xs text-texto-2">{o.cliente?.nombre} · {o.tecnico || 'Sin asignar'}</span>
                </span>
                <span className="shrink-0 text-xs text-texto-2 tabular-nums">{formatoCOP(totalesOferta(o).total)}</span>
              </button>
            ))
          ) : (
            <p className="px-3 py-3 text-sm text-texto-2">Sin coincidencias en las ofertas.</p>
          )}
          {resultados.length > 0 && (
            <button type="button" onClick={() => elegir(q.trim())} className="w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-primario hover:bg-sutil">
              Ver todas las coincidencias en la tabla
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function Notificaciones({ items }) {
  const { abierto, setAbierto, ref } = usePopover()
  const n = items.filter((i) => i.tipo === 'alerta').length
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className="btn-icono relative"
        aria-label={`Notificaciones${n ? `, ${n} alertas` : ''}`}
        aria-expanded={abierto}
        onClick={() => setAbierto((v) => !v)}
      >
        <Bell size={18} aria-hidden="true" />
        {n > 0 && (
          <span className="absolute top-1 right-1 grid h-4 min-w-4 place-items-center rounded-full bg-critico px-1 text-[0.625rem] font-semibold text-white tabular-nums dark:text-fondo">
            {n}
          </span>
        )}
      </button>
      {abierto && (
        <div className="popover w-[min(22rem,calc(100vw-2rem))]">
          <div className="flex items-center justify-between border-b border-borde px-4 py-3">
            <p className="text-sm font-semibold">Alertas automáticas</p>
            <button type="button" className="btn-icono !size-7" aria-label="Cerrar notificaciones" onClick={() => setAbierto(false)}>
              <X size={16} aria-hidden="true" />
            </button>
          </div>
          <ul className="max-h-80 space-y-1 overflow-y-auto p-2">
            {items.map((c, i) => {
              const [Icono, color] = ICONOS[c.tipo] || ICONOS.info
              return (
                <li key={i} className="flex gap-2.5 rounded-lg px-2.5 py-2 text-sm">
                  <Icono size={16} className={`mt-0.5 shrink-0 ${color}`} aria-hidden="true" />
                  <span className="text-texto">{c.texto}</span>
                </li>
              )
            })}
          </ul>
          <p className="border-t border-borde px-4 py-2.5 text-xs text-texto-2">Calculadas sobre las ofertas simuladas del mes.</p>
        </div>
      )}
    </div>
  )
}

export default function Header({ ofertas, alertas, tema, onTema, onConfig, onBuscar, children }) {
  const ahora = useReloj()
  const fecha = ahora.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
  const hora = ahora.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
  const oscuro = tema === 'oscuro'

  return (
    <header className="border-b border-borde bg-superficie lg:sticky lg:top-0 lg:z-20">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-3 px-4 sm:gap-6 sm:px-6">
        <Logo />
        <div className="hidden flex-1 justify-center md:flex">
          <Busqueda id="busqueda" ofertas={ofertas} onElegir={onBuscar} />
        </div>
        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <p className="mr-3 hidden text-right leading-tight xl:block">
            <span className="block text-sm font-medium text-texto first-letter:uppercase">{fecha}</span>
            <span className="block text-xs text-texto-2 tabular-nums">{hora} · hora local</span>
          </p>
          <button
            type="button"
            className="btn-icono"
            onClick={onTema}
            aria-label={oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            title={oscuro ? 'Modo claro' : 'Modo oscuro'}
          >
            {oscuro ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
          </button>
          <Notificaciones items={alertas} />
          <button type="button" className="btn-icono" onClick={onConfig} aria-label="Configuración" title="Configuración">
            <Settings size={18} aria-hidden="true" />
          </button>
          <div className="ml-2 flex items-center gap-2.5 border-l border-borde pl-3" title="Sesión de demostración, sin inicio de sesión">
            <span className="grid size-8 place-items-center rounded-full bg-primario-suave text-xs font-semibold text-primario" aria-hidden="true">
              JC
            </span>
            <span className="hidden leading-tight lg:block">
              <span className="block text-sm font-medium text-texto">Usuario demo</span>
              <span className="block text-xs text-texto-2">Jefe comercial</span>
            </span>
            <span className="sr-only lg:hidden">Usuario demo, jefe comercial</span>
          </div>
        </div>
      </div>
      <div className="px-4 pb-3 md:hidden">
        <Busqueda id="busqueda-movil" ofertas={ofertas} onElegir={onBuscar} />
      </div>
      {children}
    </header>
  )
}
