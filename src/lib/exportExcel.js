import ExcelJS from 'exceljs'
import { totalesOferta } from './calculos.js'

const COP = '"$" #,##0'

function hoy() {
  return new Date().toISOString().slice(0, 10)
}

function descargar(buffer, nombre) {
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nombre
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function hoja(wb, nombre, columnas, filas, formatos = {}) {
  const ws = wb.addWorksheet(nombre, { views: [{ state: 'frozen', ySplit: 1 }] })
  ws.columns = columnas.map(([header, width]) => ({ header, width }))
  ws.addRows(filas)
  for (const [col, fmt] of Object.entries(formatos)) {
    ws.getColumn(Number(col)).eachCell({ includeEmpty: false }, (cell, fila) => {
      if (fila > 1) cell.numFmt = fmt
    })
  }
  const cab = ws.getRow(1)
  cab.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  cab.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF252B31' } }
  return ws
}

export function construirExcel(ofertas, k) {
  const wb = new ExcelJS.Workbook()
  const wsO = hoja(
    wb,
    'Ofertas',
    [['Número', 12], ['Día', 6], ['Fecha visita', 14], ['Cliente', 28], ['NIT', 14], ['Tipo', 14], ['Técnico', 20],
      ['Horas', 8], ['Costo', 14], ['Subtotal', 14], ['IVA', 14], ['Total', 14], ['Estado', 12], ['Origen', 12]],
    ofertas.map((o) => {
      const t = totalesOferta(o)
      return [o.numero, o.dia, o.fechaVisita ? String(o.fechaVisita).slice(0, 10) : '', o.cliente?.nombre || '',
        o.cliente?.nit || '', o.tipo, o.tecnico, o.horas || 0, t.costo, t.subtotal, t.ivaValor, t.total, o.estado, o.origen]
    }),
    { 9: COP, 10: COP, 11: COP, 12: COP },
  )
  wsO.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: 14 } }

  hoja(
    wb,
    'Ítems',
    [['Número oferta', 14], ['Descripción', 40], ['Cantidad', 10], ['Precio unit.', 14], ['Total línea', 14]],
    ofertas.flatMap((o) =>
      (o.items || []).map((i) => [o.numero, i.descripcion, i.cantidad, i.precio, i.cantidad * i.precio]),
    ),
    { 4: COP, 5: COP },
  )

  const ws = hoja(
    wb,
    'KPIs',
    [['Indicador', 26], ['Valor', 18]],
    [
      ['Ofertas', k.ofertas],
      ['Valor ofertado', k.valorOfertado],
      ['Valor ganado', k.valorGanado],
      ['Tasa de cierre', k.tasaCierre],
      ['C1 promedio (%)', Math.round(k.c1Promedio * 10) / 10],
      ['Margen ganado', k.margenGanado],
      ['Horas vendidas', k.horasVendidas],
    ],
  )
  for (const r of [3, 4, 6, 7]) ws.getCell(`B${r}`).numFmt = COP
  ws.getCell('B5').numFmt = '0%'
  return wb
}

export async function excelReporte(ofertas, k) {
  const wb = construirExcel(ofertas, k)
  const buffer = await wb.xlsx.writeBuffer()
  descargar(buffer, `reporte-ofertas-${hoy()}.xlsx`)
}
