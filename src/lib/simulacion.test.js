import { describe, it, expect } from 'vitest'
import { simularDia, etapaOferta } from './simulacion'
import { VARIABLES_DEFECTO } from './calculos'

function mulberry32(a) {
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

describe('simularDia', () => {
  it('cantidad de ofertas nuevas dentro de visitasDia ± 1', () => {
    const rng = mulberry32(1)
    for (let d = 1; d <= 50; d++) {
      const r = simularDia([], d, VARIABLES_DEFECTO, rng)
      expect(r.length).toBeGreaterThanOrEqual(1)
      expect(r.length).toBeLessThanOrEqual(3)
    }
  })
  it('campos y reglas por tipo', () => {
    const todas = simularDia([], 1, { ...VARIABLES_DEFECTO, visitasDia: 30 }, mulberry32(7))
    for (const o of todas) {
      expect(o.origen).toBe('simulada')
      expect(o.estado).toBe('Enviada')
      expect(o.numero).toMatch(/^OF-\d{4}$/)
      expect(o.tarifaHora).toBe(95000)
      if (o.tipo === 'Instalación') {
        expect(o.items.length).toBeGreaterThanOrEqual(4)
        expect(o.items.length).toBeLessThanOrEqual(6)
        expect(o.horas).toBeGreaterThanOrEqual(40)
        expect(o.horas).toBeLessThanOrEqual(120)
      } else {
        expect(o.items.length).toBeGreaterThanOrEqual(1)
        expect(o.items.length).toBeLessThanOrEqual(3)
        expect(o.horas).toBeGreaterThanOrEqual(4)
        expect(o.horas).toBeLessThanOrEqual(24)
      }
    }
    expect(new Set(todas.map((o) => o.id)).size).toBe(todas.length)
  })
  it('resuelve Enviadas tras 2 días, no antes', () => {
    const v = { ...VARIABLES_DEFECTO, visitasDia: 0, probCierre: 100 }
    const vieja = { id: 1, dia: 1, estado: 'Enviada', items: [], horas: 0 }
    const reciente = { id: 2, dia: 2, estado: 'Enviada', items: [], horas: 0 }
    const r = simularDia([vieja, reciente], 3, v, mulberry32(3)).filter((o) => o.id <= 2)
    expect(r[0].estado).toBe('Aceptada')
    expect(r[1].estado).toBe('Enviada')
    const r0 = simularDia([vieja], 3, { ...v, probCierre: 0 }, mulberry32(3))
    expect(r0[0].estado).toBe('Rechazada')
  })
  it('C1 por oferta: defecto ± 10, entre 1 y 100', () => {
    const r = simularDia([], 1, { ...VARIABLES_DEFECTO, visitasDia: 30 }, mulberry32(11))
    for (const o of r) {
      expect(o.margen).toBeGreaterThanOrEqual(Math.max(1, VARIABLES_DEFECTO.margen - 10))
      expect(o.margen).toBeLessThanOrEqual(Math.min(100, VARIABLES_DEFECTO.margen + 10))
    }
    const bajo = simularDia([], 1, { ...VARIABLES_DEFECTO, visitasDia: 30, margen: 1 }, mulberry32(5))
    expect(bajo.every((o) => o.margen >= 1)).toBe(true)
  })
  it('es inmutable', () => {
    const entrada = [{ id: 1, dia: 1, estado: 'Enviada', items: [], horas: 0 }]
    const copia = JSON.parse(JSON.stringify(entrada))
    const r = simularDia(entrada, 5, VARIABLES_DEFECTO, mulberry32(9))
    expect(entrada).toEqual(copia)
    expect(r).not.toBe(entrada)
  })
})

describe('etapaOferta', () => {
  it('Pendiente el día de envío, En negociación después, Ganada / Perdida al decidirse', () => {
    const o = { dia: 4, estado: 'Enviada' }
    expect(etapaOferta(o, 4)).toBe('Pendiente')
    expect(etapaOferta(o, 5)).toBe('En negociación')
    expect(etapaOferta({ ...o, estado: 'Aceptada' }, 6)).toBe('Ganada')
    expect(etapaOferta({ ...o, estado: 'Rechazada' }, 6)).toBe('Perdida')
  })
  it('una oferta creada en la simulación pasa por Pendiente y En negociación antes de decidirse', () => {
    const v = { ...VARIABLES_DEFECTO, visitasDia: 1, probCierre: 50 }
    let ofs = simularDia([], 1, v, mulberry32(2))
    const id = ofs[0].id
    expect(etapaOferta(ofs[0], 1)).toBe('Pendiente')
    ofs = simularDia(ofs, 2, v, mulberry32(2))
    expect(etapaOferta(ofs.find((o) => o.id === id), 2)).toBe('En negociación')
    ofs = simularDia(ofs, 3, v, mulberry32(2))
    expect(['Ganada', 'Perdida']).toContain(etapaOferta(ofs.find((o) => o.id === id), 3))
  })
})
