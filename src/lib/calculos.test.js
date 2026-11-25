import { describe, it, expect } from 'vitest'
import {
  formatoCOP, totalesOferta, kpis, conclusiones, serieDiaria, valorPorTipo, topItems, VARIABLES_DEFECTO,
} from './calculos'

const base = { items: [], horas: 0, tarifaHora: 100000, margen: 25, iva: 19, dia: 1, tipo: 'Reparación', estado: 'Enviada' }
const of = (extra) => ({ ...base, ...extra })

describe('formatoCOP', () => {
  it('formatea con puntos y sin decimales', () => {
    expect(formatoCOP(1234567)).toBe('$ 1.234.567')
    expect(formatoCOP(0)).toBe('$ 0')
  })
  it('no finito -> $ 0', () => {
    expect(formatoCOP(NaN)).toBe('$ 0')
    expect(formatoCOP(Infinity)).toBe('$ 0')
  })
})

describe('totalesOferta', () => {
  it('calcula ejemplo a mano', () => {
    // items 2*500000 + 1*200000 = 1.200.000; MO 10h*100000 = 1.000.000; costo 2.200.000
    // subtotal 2.750.000; iva 522.500; total 3.272.500; margen 550.000
    const t = totalesOferta(of({ items: [{ cantidad: 2, precio: 500000 }, { cantidad: 1, precio: 200000 }], horas: 10 }))
    expect(t).toEqual({
      costoItems: 1200000, manoObra: 1000000, costo: 2200000,
      subtotal: 2750000, ivaValor: 522500, total: 3272500, margenValor: 550000,
    })
  })
})

describe('kpis', () => {
  it('0 ofertas sin NaN', () => {
    const k = kpis([])
    expect(Object.values(k).every((v) => v === 0)).toBe(true)
  })
  it('conjunto mixto', () => {
    // cada oferta: MO 1.000.000 -> subtotal 1.250.000, total 1.487.500, margen 250.000
    const k = kpis([
      of({ horas: 10, estado: 'Aceptada' }),
      of({ horas: 10, estado: 'Rechazada' }),
      of({ horas: 10, estado: 'Enviada' }),
    ])
    expect(k.ofertas).toBe(3)
    expect(k.valorOfertado).toBeCloseTo(3 * 1487500)
    expect(k.valorGanado).toBeCloseTo(1487500)
    expect(k.tasaCierre).toBe(0.5)
    expect(k.ticketPromedio).toBeCloseTo(1487500)
    expect(k.margenGanado).toBeCloseTo(250000)
    expect(k.horasVendidas).toBe(10)
    expect([k.aceptadas, k.rechazadas, k.enviadas]).toEqual([1, 1, 1])
    expect(k.costoManoObra).toBe(3000000)
  })
})

describe('conclusiones', () => {
  const textos = (o) => conclusiones(o, VARIABLES_DEFECTO).map((c) => c.texto)
  it('sin ofertas', () => {
    expect(textos([])).toEqual(['Inicia la simulación o crea una oferta para ver el análisis.'])
  })
  it('tasa baja', () => {
    const o = [of({ estado: 'Aceptada' }), ...Array.from({ length: 4 }, () => of({ estado: 'Rechazada' }))]
    expect(textos(o)).toContain('Tasa de cierre baja: revisar precios o seguimiento comercial.')
  })
  it('tasa buena', () => {
    expect(textos([of({ estado: 'Aceptada' }), of({ estado: 'Rechazada' })]))
      .toContain('Buena tasa de cierre: hay espacio para subir margen.')
  })
  describe('meta de facturación', () => {
    // una oferta aceptada de exactamente `m` millones (sin margen ni IVA)
    const ganada = (m) => of({ estado: 'Aceptada', items: [{ cantidad: 1, precio: m * 1e6 }], horas: 0, margen: 0, iva: 0 })
    const meta = (o, dia) => conclusiones(o, VARIABLES_DEFECTO, dia).find((c) => c.texto.startsWith('Facturación'))
    it('no aparece antes del día 5', () => {
      expect(meta([ganada(10)], 4)).toBeUndefined()
    })
    it('día 30: dentro, debajo y encima', () => {
      expect(meta([ganada(250)], 30)).toEqual({ tipo: 'ok', texto: 'Facturación del mes: $ 250.000.000, dentro de la meta ($ 200–300 M).' })
      expect(meta([ganada(150)], 30).tipo).toBe('alerta')
      expect(meta([ganada(150)], 30).texto).toContain('por debajo')
      expect(meta([ganada(350)], 30).texto).toContain('por encima')
    })
    it('proyecta antes del día 30', () => {
      expect(meta([ganada(125)], 15).texto).toBe('Facturación proyectada: $ 250.000.000, dentro de la meta ($ 200–300 M).')
    })
  })
  it('mano de obra > 40%', () => {
    expect(textos([of({ horas: 10 })]))
      .toContain('Alta carga de mano de obra: revisar capacidad del equipo técnico.')
  })
  it('sin reglas -> mensaje por defecto', () => {
    const o = [of({ tipo: 'Instalación', items: [{ cantidad: 1, precio: 1000000 }], horas: 1 })]
    expect(conclusiones(o, VARIABLES_DEFECTO)).toEqual([{ tipo: 'info', texto: 'Indicadores dentro de rangos normales.' }])
  })
})

describe('serieDiaria / valorPorTipo / topItems', () => {
  it('serie acumulada', () => {
    const s = serieDiaria([of({ dia: 1, horas: 10, estado: 'Aceptada' }), of({ dia: 3, horas: 10 })], 3)
    expect(s.map((x) => x.dia)).toEqual([1, 2, 3])
    expect(s[0].ofertado).toBeCloseTo(1487500)
    expect(s[1].ofertado).toBeCloseTo(1487500)
    expect(s[2].ofertado).toBeCloseTo(2975000)
    expect(s[2].ganado).toBeCloseTo(1487500)
  })
  it('valorPorTipo', () => {
    const r = valorPorTipo([of({ tipo: 'Instalación', horas: 10 }), of({ horas: 10 })])
    expect(r['Instalación']).toBeCloseTo(1487500)
    expect(r['Reparación']).toBeCloseTo(1487500)
  })
  it('topItems suma y ordena', () => {
    const o = [
      of({ items: [{ descripcion: 'A', cantidad: 1, precio: 1 }, { descripcion: 'B', cantidad: 5, precio: 1 }] }),
      of({ items: [{ descripcion: 'A', cantidad: 2, precio: 1 }] }),
    ]
    expect(topItems(o, 1)).toEqual([{ descripcion: 'B', cantidad: 5 }])
    expect(topItems(o)[1]).toEqual({ descripcion: 'A', cantidad: 3 })
  })
})
