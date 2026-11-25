// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { construirPdfOferta, construirPdfReporte } from './exportPdf.js'
import { construirExcel } from './exportExcel.js'
import { kpis, conclusiones } from './calculos.js'

const oferta = {
  id: 1, numero: 'OF-0012', dia: 3, origen: 'manual',
  cliente: { nombre: 'Taller Demo SAS', nit: '900.000.000-1', direccion: 'Cra 1 # 2-3', contacto: '300 000 0000' },
  tipo: 'Mantenimiento correctivo', tecnico: 'Técnico Uno', fechaVisita: '2026-11-10',
  items: [{ descripcion: 'Motor 5 HP', cantidad: 2, precio: 1500000 }, { descripcion: 'Cable', cantidad: 10, precio: 12000 }],
  horas: 4, tarifaHora: 95000, margen: 25, iva: 19, estado: 'Aceptada',
}

describe('exportes', () => {
  it('construye el PDF de oferta', () => {
    expect(construirPdfOferta(oferta).getNumberOfPages()).toBeGreaterThanOrEqual(1)
  })
  it('construye el PDF de reporte', () => {
    const doc = construirPdfReporte([oferta], kpis([oferta]), conclusiones([oferta]))
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(1)
  })
  it('construye el Excel con 3 hojas', () => {
    const wb = construirExcel([oferta], kpis([oferta]))
    expect(wb.worksheets.map((w) => w.name)).toEqual(['Ofertas', 'Ítems', 'KPIs'])
  })
})
