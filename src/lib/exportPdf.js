import { jsPDF } from 'jspdf'
import { autoTable } from 'jspdf-autotable'
import { formatoCOP, totalesOferta } from './calculos.js'

// Paleta de marca (DESIGN.md): primario #0057B8, texto #111827, bordes #E5E7EB, fondo sutil #F1F5F9
const PRIMARIO = [0, 87, 184]
const TEXTO = [17, 24, 39]
const REGLA = [229, 231, 235]
const CABECERA = [241, 245, 249]
const PRIMARIO_OSCURO = [0, 64, 138]

function descargar(doc, nombre) {
  doc.save(nombre)
}

function hoy() {
  return new Date().toISOString().slice(0, 10)
}

function banda(doc, titulo, subtitulo) {
  const w = doc.internal.pageSize.getWidth()
  doc.setFillColor(...PRIMARIO)
  doc.rect(0, 0, w, 26, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text(titulo, 14, 12)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(subtitulo, 14, 20)
  doc.setFillColor(...PRIMARIO_OSCURO)
  doc.rect(0, 26, w, 0.8, 'F')
  doc.setTextColor(...TEXTO)
}

function pie(doc) {
  const w = doc.internal.pageSize.getWidth()
  const h = doc.internal.pageSize.getHeight()
  doc.setDrawColor(...REGLA)
  doc.setLineWidth(0.2)
  doc.line(14, h - 14, w - 14, h - 14)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(90, 100, 108)
  doc.text('Documento generado con Elevia Ofertas — datos simulados con fines académicos.', 14, h - 9)
  doc.setTextColor(...TEXTO)
}

const estiloTabla = {
  styles: { font: 'helvetica', fontSize: 9, textColor: TEXTO, lineColor: REGLA, lineWidth: 0.1, cellPadding: 2 },
  headStyles: { fillColor: CABECERA, textColor: TEXTO, fontStyle: 'bold' },
}

function fechaES(d) {
  return new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })
}

export function construirPdfOferta(oferta) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const w = doc.internal.pageSize.getWidth()
  const t = totalesOferta(oferta)
  const f = 1 + (oferta.margen || 0) / 100
  banda(doc, 'ELEVIA OFERTAS', 'Oferta comercial')

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text(`N° ${oferta.numero}`, w - 14, 36, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.text(`Fecha: ${fechaES(oferta.fechaVisita || new Date())}`, w - 14, 42, { align: 'right' })

  const c = oferta.cliente || {}
  let y = 38
  doc.setFont('helvetica', 'bold')
  doc.text('Cliente', 14, y)
  doc.setFont('helvetica', 'normal')
  const lineas = [
    c.nombre || '',
    `NIT: ${c.nit || ''}`,
    `Dirección: ${c.direccion || ''}`,
    `Contacto: ${c.contacto || ''}`,
    `Tipo de trabajo: ${oferta.tipo || ''}`,
    `Técnico: ${oferta.tecnico || ''}`,
  ]
  lineas.forEach((l, i) => doc.text(l, 14, y + 6 + i * 5.5))
  y += 6 + lineas.length * 5.5 + 2

  const filas = (oferta.items || []).map((i) => [
    i.descripcion,
    String(i.cantidad),
    formatoCOP(i.precio * f),
    formatoCOP(i.cantidad * i.precio * f),
  ])
  filas.push([
    `Mano de obra (${oferta.horas || 0} h × ${formatoCOP((oferta.tarifaHora || 0) * f)})`,
    '',
    '',
    formatoCOP(t.manoObra * f),
  ])
  autoTable(doc, {
    ...estiloTabla,
    startY: y,
    head: [['Descripción', 'Cant.', 'Precio unit.', 'Total']],
    body: filas,
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' } },
    margin: { left: 14, right: 14, bottom: 18 },
    didDrawPage: () => pie(doc),
  })

  y = doc.lastAutoTable.finalY + 6
  const negrita = { fontStyle: 'bold', fillColor: CABECERA }
  autoTable(doc, {
    ...estiloTabla,
    startY: y,
    margin: { left: w - 14 - 80, right: 14, bottom: 18 },
    tableWidth: 80,
    body: [
      ['Subtotal', formatoCOP(t.subtotal)],
      [`IVA (${oferta.iva || 0}%)`, formatoCOP(t.ivaValor)],
      [{ content: 'Total', styles: negrita }, { content: formatoCOP(t.total), styles: negrita }],
    ],
    columnStyles: { 1: { halign: 'right' } },
  })

  y = doc.lastAutoTable.finalY + 10
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('Condiciones', 14, y)
  doc.setFont('helvetica', 'normal')
  doc.text('Validez de la oferta: 30 días', 14, y + 6)
  doc.text('Forma de pago: 50% anticipo, 50% contra entrega', 14, y + 11.5)
  doc.text('Valores en pesos colombianos (COP)', 14, y + 17)
  return doc
}

export function pdfOferta(oferta) {
  descargar(construirPdfOferta(oferta), `oferta-${oferta.numero}.pdf`)
}

export function construirPdfReporte(ofertas, k, conclusiones = []) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' })
  banda(doc, 'ELEVIA OFERTAS', 'Reporte del mes')
  const kp = [
    ['Ofertas', String(k.ofertas)],
    ['Valor ofertado', formatoCOP(k.valorOfertado)],
    ['Valor ganado', formatoCOP(k.valorGanado)],
    ['Tasa de cierre', `${Math.round((k.tasaCierre || 0) * 100)}%`],
    ['C1 promedio', `${k.c1Promedio.toLocaleString('es-CO', { maximumFractionDigits: 1 })} %`],
    ['Margen ganado', formatoCOP(k.margenGanado)],
    ['Horas vendidas', String(k.horasVendidas)],
  ]
  autoTable(doc, {
    ...estiloTabla,
    startY: 34,
    head: [['Indicador', 'Valor']],
    body: kp,
    tableWidth: 90,
    margin: { left: 14 },
    columnStyles: { 1: { halign: 'right' } },
  })
  let y = doc.lastAutoTable.finalY + 8
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('Conclusiones', 14, y)
  doc.setFont('helvetica', 'normal')
  conclusiones.forEach((c, i) => doc.text(`- ${c.texto}`, 14, y + 6 + i * 5.5))
  y += 6 + conclusiones.length * 5.5 + 4

  autoTable(doc, {
    ...estiloTabla,
    startY: y,
    head: [['N°', 'Día', 'Cliente', 'Tipo', 'Total', 'Estado']],
    body: ofertas.map((o) => [
      o.numero, String(o.dia), o.cliente?.nombre || '', o.tipo, formatoCOP(totalesOferta(o).total), o.estado,
    ]),
    columnStyles: { 4: { halign: 'right' } },
    margin: { left: 14, right: 14, bottom: 18 },
    didDrawPage: () => pie(doc),
  })
  return doc
}

export function pdfReporte(ofertas, k, conclusiones) {
  descargar(construirPdfReporte(ofertas, k, conclusiones), `reporte-ofertas-${hoy()}.pdf`)
}
