import { describe, it, expect } from 'vitest'
import { simularDia, etapaOferta, etiquetaEstado, migrarOfertas } from './simulacion'
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
      expect(r.length).toBeGreaterThanOrEqual(VARIABLES_DEFECTO.visitasDia - 1)
      expect(r.length).toBeLessThanOrEqual(VARIABLES_DEFECTO.visitasDia + 1)
    }
  })
  it('campos y reglas por tipo', () => {
    const todas = simularDia([], 1, { ...VARIABLES_DEFECTO, visitasDia: 30 }, mulberry32(7))
    for (const o of todas) {
      expect(o.origen).toBe('simulada')
      expect(o.estado).toBe('Enviada')
      expect(o.numero).toMatch(/^OF-\d{4}$/)
      expect(o.tarifaHora).toBe(95000)
      expect(['Mantenimiento correctivo', 'Mantenimiento preventivo']).toContain(o.tipo)
      expect(o.items.every((i) => i.cantidad >= 1 && i.cantidad <= 2)).toBe(true)
      if (o.tipo === 'Mantenimiento preventivo') {
        expect(o.items.length).toBeLessThanOrEqual(3)
        expect(o.horas).toBeGreaterThanOrEqual(2)
        expect(o.horas).toBeLessThanOrEqual(8)
      } else {
        expect(o.items.length).toBeGreaterThanOrEqual(1)
        expect(o.items.length).toBeLessThanOrEqual(3)
        expect(o.horas).toBeGreaterThanOrEqual(4)
        expect(o.horas).toBeLessThanOrEqual(24)
      }
    }
    expect(new Set(todas.map((o) => o.id)).size).toBe(todas.length)
  })
  it('% preventivo: 0 → todo correctivo con repuestos; 100 → todo preventivo con consumibles', () => {
    const corr = simularDia([], 1, { ...VARIABLES_DEFECTO, visitasDia: 20, pctPreventivo: 0 }, mulberry32(4))
    expect(corr.every((o) => o.tipo === 'Mantenimiento correctivo')).toBe(true)
    const prev = simularDia([], 1, { ...VARIABLES_DEFECTO, visitasDia: 20, pctPreventivo: 100 }, mulberry32(4))
    expect(prev.every((o) => o.tipo === 'Mantenimiento preventivo')).toBe(true)
    const consumibles = new Set(['Lubricante para guías (galón)', 'Aceite para máquina reductora (galón)', 'Kit de limpieza de foso y cabina',
      'Escobillas de contacto (juego)', 'Filtro de aceite de unidad hidráulica', 'Grasa para rodamientos (kg)', 'Aceiteras de guías (par)', 'Bombillos LED de cabina (juego)'])
    expect(prev.flatMap((o) => o.items).every((i) => consumibles.has(i.descripcion))).toBe(true)
    expect(corr.flatMap((o) => o.items).some((i) => consumibles.has(i.descripcion))).toBe(false)
  })
  it('migra tipos viejos a Mantenimiento correctivo', () => {
    const r = migrarOfertas([{ tipo: 'Reparación' }, { tipo: 'Instalación' }, { tipo: 'Mantenimiento preventivo' }])
    expect(r.map((o) => o.tipo)).toEqual(['Mantenimiento correctivo', 'Mantenimiento correctivo', 'Mantenimiento preventivo'])
    expect(migrarOfertas(null)).toEqual([])
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
  it('Enviada el día de envío, En negociación después, Aprobada / Rechazada al decidirse', () => {
    const o = { dia: 4, estado: 'Enviada' }
    expect(etapaOferta(o, 4)).toBe('Enviada')
    expect(etapaOferta(o, 5)).toBe('En negociación')
    expect(etapaOferta({ ...o, estado: 'Aceptada' }, 6)).toBe('Aprobada')
    expect(etapaOferta({ ...o, estado: 'Rechazada' }, 6)).toBe('Rechazada')
    expect(etiquetaEstado('Aceptada')).toBe('Aprobada')
  })
  it('una oferta creada en la simulación pasa por Enviada y En negociación antes de decidirse', () => {
    const v = { ...VARIABLES_DEFECTO, visitasDia: 1, probCierre: 50 }
    let ofs = simularDia([], 1, v, mulberry32(2))
    const id = ofs[0].id
    expect(etapaOferta(ofs[0], 1)).toBe('Enviada')
    ofs = simularDia(ofs, 2, v, mulberry32(2))
    expect(etapaOferta(ofs.find((o) => o.id === id), 2)).toBe('En negociación')
    ofs = simularDia(ofs, 3, v, mulberry32(2))
    expect(['Aprobada', 'Rechazada']).toContain(etapaOferta(ofs.find((o) => o.id === id), 3))
  })
})
