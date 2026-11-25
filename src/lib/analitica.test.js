import { describe, it, expect } from 'vitest'
import {
  rangoPeriodo, filtrarOfertas, serieKpi, variacion, embudo, mapaCalor, rankingTecnicos, topClientes, pronostico, alertas,
} from './analitica'
import { VARIABLES_DEFECTO } from './calculos'

// MO 10 h × 100.000 = 1.000.000 → total con 25 % y IVA 19 % = 1.487.500
const of = (extra) => ({
  items: [], horas: 10, tarifaHora: 100000, margen: 25, iva: 19, dia: 1, tipo: 'Reparación',
  estado: 'Enviada', tecnico: 'Ana', cliente: { nombre: 'Edificio A' }, ...extra,
})
const T = 1487500

describe('rangoPeriodo', () => {
  it('mes: del día 0 (manuales antes de iniciar) al actual, sin ventana anterior interna', () => {
    expect(rangoPeriodo('mes', 12)).toEqual({ desde: 0, hasta: 12, anterior: null })
  })
  it('7 días: ventana anterior solo si cabe completa', () => {
    expect(rangoPeriodo('7', 20)).toEqual({ desde: 14, hasta: 20, anterior: { desde: 7, hasta: 13 } })
    expect(rangoPeriodo('7', 10).anterior).toBeNull()
    expect(rangoPeriodo('7', 0)).toEqual({ desde: 1, hasta: 0, anterior: null })
  })
})

describe('filtros, series y variación', () => {
  const ofs = [of({ dia: 1 }), of({ dia: 3, tipo: 'Instalación', tecnico: 'Luis' }), of({ dia: 5, tecnico: '' })]
  it('filtra por día, tipo y técnico (vacío = Sin asignar)', () => {
    expect(filtrarOfertas(ofs, { desde: 2, hasta: 5 })).toHaveLength(2)
    expect(filtrarOfertas(ofs, { tipo: 'Instalación' })).toHaveLength(1)
    expect(filtrarOfertas(ofs, { tecnico: 'Sin asignar' })).toHaveLength(1)
  })
  it('serieKpi acumula día a día', () => {
    expect(serieKpi(ofs, 1, 5, 'ofertas')).toEqual([1, 1, 2, 2, 3])
  })
  it('variación null sin base', () => {
    expect(variacion(10, 0)).toBeNull()
    expect(variacion(10, null)).toBeNull()
    expect(variacion(15, 10)).toBeCloseTo(0.5)
  })
})

describe('embudo, mapa de calor, rankings', () => {
  const ofs = [
    of({ dia: 5 }), // Pendiente en día 5
    of({ dia: 4 }), // En negociación
    of({ dia: 1, estado: 'Aceptada', cliente: { nombre: 'Torre B' } }),
    of({ dia: 1, estado: 'Aceptada', tecnico: 'Luis' }),
    of({ dia: 2, estado: 'Rechazada', tecnico: 'Luis' }),
  ]
  it('embudo cuenta cada etapa', () => {
    expect(embudo(ofs, 5)).toEqual({ creadas: 5, 'Pendiente': 1, 'En negociación': 1, 'Ganada': 2, 'Perdida': 1 })
  })
  it('mapa de calor por técnico y día', () => {
    const m = mapaCalor(ofs, 5, ['Ana', 'Luis', 'Sin ofertas'])
    expect(m.filas.map((f) => f.tecnico)).toEqual(['Ana', 'Luis', 'Sin ofertas'])
    expect(m.filas[0].dias).toEqual([1, 0, 0, 1, 1])
    expect(m.filas[2].total).toBe(0)
    expect(m.max).toBe(1)
  })
  it('ranking de técnicos por valor ganado con tasa de cierre', () => {
    const r = rankingTecnicos(ofs)
    expect(r[0]).toMatchObject({ nombre: 'Ana', ganado: T, ofertas: 3, tasa: 1 })
    expect(r[1]).toMatchObject({ nombre: 'Luis', ganado: T, ofertas: 2, tasa: 0.5 })
  })
  it('top clientes solo con valor ganado', () => {
    const c = topClientes(ofs)
    expect(c.map((x) => x.nombre).sort()).toEqual(['Edificio A', 'Torre B'])
    expect(topClientes([of({})])).toEqual([])
  })
})

describe('pronostico', () => {
  it('proyección lineal y valor esperado de lo abierto', () => {
    const ofs = [of({ estado: 'Aceptada' }), of({ estado: 'Rechazada' }), of({})]
    const p = pronostico(ofs, 10)
    expect(p.ritmo).toBeCloseTo(T / 10)
    expect(p.proyectado).toBeCloseTo(T * 3)
    expect(p.abierto).toBeCloseTo(T)
    expect(p.esperadoAbierto).toBeCloseTo(T * 0.5)
    expect(p.fiable).toBe(true)
    expect(pronostico(ofs, 30).proyectado).toBeCloseTo(T)
  })
  it('sin datos no da NaN', () => {
    const p = pronostico([], 0)
    expect(Object.values(p).filter((v) => typeof v === 'number').every(Number.isFinite)).toBe(true)
  })
})

describe('alertas', () => {
  it('detecta caída del ritmo de ofertas', () => {
    const ofs = [...Array.from({ length: 8 }, (_, i) => of({ dia: 1 + (i % 7) })), of({ dia: 10 })]
    const a = alertas(ofs, VARIABLES_DEFECTO, 14)
    expect(a.some((x) => x.texto.startsWith('Ritmo de ofertas a la baja'))).toBe(true)
  })
  it('compara contra el mes anterior al mismo día', () => {
    const mesAnterior = { dia: 30, ofertas: [of({ estado: 'Aceptada' }), of({ estado: 'Aceptada' })] }
    const a = alertas([of({ estado: 'Aceptada' })], VARIABLES_DEFECTO, 6, mesAnterior)
    expect(a.some((x) => x.texto.includes('50 % por debajo del mes anterior'))).toBe(true)
  })
  it('sin ofertas devuelve el mensaje de inicio', () => {
    expect(alertas([], VARIABLES_DEFECTO, 0)).toHaveLength(1)
  })
})
