import { jsPDF } from 'jspdf'
import { autoTable } from 'jspdf-autotable'
import { formatoCOP, totalesOferta } from './calculos.js'
import { etiquetaEstado } from './simulacion.js'
import portada from '../assets/portada-oferta.jpg?inline' // data URL; el chunk de exportes ya es diferido

// Paleta de marca (DESIGN.md): primario #0057B8, texto #111827, bordes #E5E7EB, fondo sutil #F1F5F9
const PRIMARIO = [0, 87, 184]
const TEXTO = [17, 24, 39]
const REGLA = [229, 231, 235]
const CABECERA = [241, 245, 249]
const PRIMARIO_OSCURO = [0, 64, 138]
const GRIS = [107, 114, 128]
const FONDO = [248, 250, 252]

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

// ---------- PDF de oferta: portada + oferta + orden de pedido ----------

const M = 18 // margen lateral (mm)

// Fecha de la oferta = fecha de visita (yyyy-mm-dd) leída como fecha local.
function fechaBase(oferta) {
  const f = oferta.fechaVisita
  return f ? new Date(`${f}T12:00:00`) : new Date()
}
const corta = (d) => d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })
const larga = (d) => d.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

// Logo de la marca ficticia (mismo dibujo del header): cabina con flechas de subida y bajada.
function logo(doc, x, y, s = 12) {
  const k = s / 32
  doc.setFillColor(...PRIMARIO)
  doc.roundedRect(x, y, s, s, 8 * k, 8 * k, 'F')
  doc.setDrawColor(255, 255, 255)
  doc.setLineWidth(1.8 * k)
  doc.roundedRect(x + 9 * k, y + 7 * k, 14 * k, 18 * k, 2 * k, 2 * k, 'S')
  doc.setLineWidth(1.5 * k)
  doc.line(x + 12.5 * k, y + 13.5 * k, x + 14 * k, y + 12 * k)
  doc.line(x + 14 * k, y + 12 * k, x + 15.5 * k, y + 13.5 * k)
  doc.line(x + 16.5 * k, y + 18.5 * k, x + 18 * k, y + 20 * k)
  doc.line(x + 18 * k, y + 20 * k, x + 19.5 * k, y + 18.5 * k)
  doc.setTextColor(...TEXTO)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(s * 1.4)
  doc.text('Elevia', x + s + 2.5, y + s * 0.5)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(s * 0.8)
  doc.setTextColor(...GRIS)
  doc.text('Ofertas', x + s + 2.5, y + s * 0.92)
  doc.setTextColor(...TEXTO)
}

// Encabezado de cada página: número y fecha a la izquierda, logo a la derecha.
function encabezado(doc, oferta) {
  const w = doc.internal.pageSize.getWidth()
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...GRIS)
  doc.text(`Oferta ${oferta.numero}`, M, 16)
  doc.text(corta(fechaBase(oferta)), M, 20.5)
  logo(doc, w - M - 32, 10, 11)
}

function piePaginas(doc) {
  const n = doc.getNumberOfPages()
  const w = doc.internal.pageSize.getWidth()
  const h = doc.internal.pageSize.getHeight()
  for (let i = 1; i <= n; i++) {
    doc.setPage(i)
    doc.setDrawColor(...REGLA)
    doc.setLineWidth(0.3)
    doc.line(M, h - 16, w - M, h - 16)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...GRIS)
    doc.text('Elevia Ofertas S.A.S. (empresa ficticia) · Datos simulados con fines académicos', M, h - 11)
    doc.text(`Página ${i} / ${n}`, w - M, h - 11, { align: 'right' })
  }
  doc.setTextColor(...TEXTO)
}

// Ilustración genérica dibujada en vectores: hueco de ascensor visto desde abajo.
function ilustracion(doc, x, y, w, h) {
  const pasos = 40
  for (let i = 0; i < pasos; i++) {
    const t = i / (pasos - 1)
    doc.setFillColor(8 + 10 * t, 28 + 60 * t, 70 + 110 * t)
    doc.rect(x, y + (h * i) / pasos, w, h / pasos + 0.3, 'F')
  }
  const cx = x + w / 2
  const cy = y + h * 0.42
  // pisos: rectángulos que se alejan hacia el punto de fuga
  doc.setLineWidth(0.25)
  for (let i = 1; i <= 7; i++) {
    const f = Math.pow(0.68, i)
    const rw = w * 0.9 * f
    const rh = 2 * (cy - y) * f
    const c = 90 + i * 18
    doc.setDrawColor(c, Math.min(255, c + 20), 255)
    doc.rect(cx - rw / 2, cy - rh / 2, rw, rh, 'S')
  }
  // guías y cables hacia el punto de fuga
  const fuga = (px, py, ancho, color) => {
    doc.setLineWidth(ancho)
    doc.setDrawColor(...color)
    doc.line(px, py, cx + (px - cx) * 0.04, cy + (py - cy) * 0.04)
  }
  ;[
    [x + w * 0.18, y + h],
    [x + w * 0.82, y + h],
    [x, y + h * 0.75],
    [x + w, y + h * 0.75],
  ].forEach(([px, py]) => fuga(px, py, 1.6, [150, 190, 235]))
  for (let i = 0; i < 6; i++) fuga(cx - 9 + i * 3.6, y + h, 0.35, [210, 225, 245])
  doc.setFillColor(225, 238, 255)
  doc.circle(cx, cy, 1.6, 'F')
  doc.setFillColor(...PRIMARIO)
  doc.rect(x, y + h - 1.2, w, 1.2, 'F')
}

function titulo(doc, texto, y) {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(24)
  doc.setTextColor(...PRIMARIO)
  doc.text(texto, M, y)
  doc.setFillColor(...PRIMARIO)
  doc.rect(M, y + 3, 14, 1.1, 'F')
  doc.setTextColor(...TEXTO)
}

function parrafo(doc, texto, y, ancho, size = 10) {
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(size)
  const l = doc.splitTextToSize(texto, ancho)
  doc.text(l, M, y)
  return y + l.length * size * 0.42 + 3
}

// Tabla etiqueta / valor sin bordes verticales (datos del cliente, condiciones).
function ficha(doc, startY, filas, lineas = false) {
  const w = doc.internal.pageSize.getWidth()
  autoTable(doc, {
    startY,
    body: filas,
    theme: 'plain',
    margin: { left: M, right: M, bottom: 22 },
    styles: { font: 'helvetica', fontSize: 9, textColor: TEXTO, cellPadding: { top: 1.8, bottom: 1.8, left: 2, right: 2 } },
    columnStyles: { 0: { cellWidth: 38, textColor: GRIS, fontSize: 8 } },
    didDrawCell: (d) => {
      if (lineas && d.section === 'body' && d.column.index === 1) {
        doc.setDrawColor(...REGLA)
        doc.setLineWidth(0.2)
        doc.line(M, d.cell.y + d.cell.height, w - M, d.cell.y + d.cell.height)
      }
    },
  })
  return doc.lastAutoTable.finalY
}

// imagen: data URL JPG de la portada; con null se dibuja la ilustración vectorial.
export function construirPdfOferta(oferta, imagen = portada) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const w = doc.internal.pageSize.getWidth()
  const ancho = w - 2 * M
  const t = totalesOferta(oferta)
  const f = 1 + (oferta.margen || 0) / 100
  const c = oferta.cliente || {}
  const tipo = oferta.tipo || 'Mantenimiento'
  const tipoMin = tipo.toLowerCase()
  const preventivo = /preventivo/i.test(tipo)
  const fecha = fechaBase(oferta)
  const validez = new Date(fecha.getTime() + 30 * 864e5)
  const tecnico = oferta.tecnico || 'Asesor comercial'

  // ---- Página 1: portada y carta ----
  encabezado(doc, oferta)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  const tl = doc.splitTextToSize(
    `Propuesta de ${tipoMin} de equipos de transporte vertical para ${(c.nombre || 'el cliente').toUpperCase()}`,
    ancho,
  )
  doc.text(tl, M, 40)
  let y = 40 + tl.length * 6.5 + 2
  if (imagen) {
    doc.addImage(imagen, 'JPEG', M, y, ancho, 62)
    doc.setFillColor(...PRIMARIO)
    doc.rect(M, y + 62 - 1.2, ancho, 1.2, 'F')
  } else ilustracion(doc, M, y, ancho, 62)
  y += 74
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(17)
  doc.text(doc.splitTextToSize(c.nombre || '', ancho), M, y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(...GRIS)
  doc.text([c.direccion || '', c.nit ? `NIT ${c.nit}` : ''].filter(Boolean), M, y + 7)
  doc.setTextColor(...TEXTO)
  y += 22
  y = parrafo(doc, 'Estimado cliente,', y, ancho)
  y = parrafo(doc, `Oferta de ${tipoMin} ${oferta.numero}, preparada a partir de la visita técnica del ${larga(fecha)}.`, y + 2, ancho)
  y = parrafo(
    doc,
    preventivo
      ? 'Esta propuesta cubre las actividades de mantenimiento preventivo recomendadas para conservar la seguridad, la disponibilidad y la vida útil del equipo.'
      : 'Esta propuesta corresponde a un trabajo adicional, no cubierto por su contrato de mantenimiento, para corregir las fallas encontradas durante la visita.',
    y + 2,
    ancho,
  )
  y = parrafo(
    doc,
    'Le recomendamos realizar este trabajo para garantizar la seguridad de los usuarios. Si desea llevarlo a cabo, envíenos la orden de pedido adjunta firmada junto con el 50 % de anticipo.',
    y + 2,
    ancho,
  )
  y = parrafo(doc, 'Ante cualquier duda o consulta, no dude en contactarnos.', y + 2, ancho)
  y = parrafo(doc, 'Saludos cordiales,', y + 4, ancho)
  doc.setFont('helvetica', 'bold')
  doc.text(tecnico, M, y + 8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...GRIS)
  doc.text('Elevia Ofertas S.A.S.', M, y + 13)
  doc.setFontSize(8)
  doc.text(`Adjuntos: oferta de ${tipoMin} · orden de pedido`, M, y + 20)
  doc.setTextColor(...TEXTO)

  // ---- Página 2: oferta ----
  doc.addPage()
  encabezado(doc, oferta)
  titulo(doc, `Oferta de ${tipoMin}`, 40)
  y = ficha(doc, 50, [
    ['Cliente', c.nombre || ''],
    ['NIT', c.nit || ''],
    ['Dirección', c.direccion || ''],
    ['Contacto', c.contacto || ''],
    ['Oferta', `${oferta.numero} · ${larga(fecha)}`],
    ['Técnico', tecnico],
    ['Trabajo', tipo],
  ])

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
    startY: y + 6,
    head: [['Componentes / actividades', 'Cant.', 'Precio unit.', 'Importe']],
    body: filas,
    theme: 'plain',
    margin: { top: 30, left: M, right: M, bottom: 22 },
    styles: { font: 'helvetica', fontSize: 9, textColor: TEXTO, cellPadding: 2.4 },
    headStyles: { fillColor: PRIMARIO, textColor: [255, 255, 255], fontStyle: 'bold' },
    didParseCell: (d) => {
      if (d.section === 'head' && d.column.index > 0) d.cell.styles.halign = 'right'
    },
    alternateRowStyles: { fillColor: FONDO },
    columnStyles: {
      1: { halign: 'right', cellWidth: 16 },
      2: { halign: 'right', cellWidth: 32 },
      3: { halign: 'right', cellWidth: 34 },
    },
    didDrawPage: (d) => d.pageNumber > 1 && encabezado(doc, oferta),
  })

  const destacado = { fontStyle: 'bold', fillColor: PRIMARIO, textColor: [255, 255, 255], fontSize: 11 }
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 4,
    theme: 'plain',
    margin: { top: 30, left: w - M - 86, right: M, bottom: 22 },
    tableWidth: 86,
    styles: { font: 'helvetica', fontSize: 9.5, textColor: TEXTO, cellPadding: 2.2 },
    columnStyles: { 1: { halign: 'right' } },
    body: [
      ['Precio neto', formatoCOP(t.subtotal)],
      [`IVA (${oferta.iva || 0} %)`, formatoCOP(t.ivaValor)],
      [
        { content: 'Total incl. IVA', styles: destacado },
        { content: formatoCOP(t.total), styles: destacado },
      ],
    ],
  })

  y = doc.lastAutoTable.finalY + 10
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('Condiciones', M, y)
  ficha(
    doc,
    y + 3,
    [
      ['Tipo de trabajo', tipo],
      [
        'Plazo de ejecución',
        preventivo
          ? 'Según la programación acordada con el cliente, una vez aprobada la oferta.'
          : 'Hasta 6 semanas desde la orden de pedido y el pago del anticipo, sujeto a la disponibilidad de repuestos.',
      ],
      [
        'Garantía',
        preventivo
          ? 'Tres (3) meses sobre la mano de obra.'
          : 'Un (1) año, incluye material y mano de obra; excluye elementos de decoración.',
      ],
      ['Términos de pago', '50 % de anticipo y 50 % contra entrega del trabajo.'],
      ['Validez de la oferta', `${corta(validez)} (30 días). Precio no garantizado después de esta fecha.`],
      ['Impuestos', 'Se aplica el IVA vigente en la fecha de facturación.'],
      ['Trabajo extra', 'Estimación basada en la visita técnica. Cualquier pieza o servicio adicional se cotiza por separado.'],
    ],
    true,
  )

  // ---- Página 3: orden de pedido ----
  doc.addPage()
  encabezado(doc, oferta)
  titulo(doc, 'Orden de pedido', 40)
  y = ficha(doc, 50, [
    ['Cliente', c.nombre || ''],
    ['Oferta', `${oferta.numero} · ${larga(fecha)}`],
    ['Trabajo', tipo],
  ])
  doc.setFillColor(...FONDO)
  doc.setDrawColor(...REGLA)
  doc.setLineWidth(0.3)
  doc.roundedRect(M, y + 6, ancho, 24, 3, 3, 'FD')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10.5)
  doc.text('Autorización para realizar el trabajo', M + 5, y + 14)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  doc.text(
    doc.splitTextToSize(
      `Al firmar este documento acepto las condiciones de la oferta ${oferta.numero}, autorizo a Elevia Ofertas S.A.S. a realizar los trabajos descritos y acepto pagar ${formatoCOP(t.subtotal)} COP + IVA (total ${formatoCOP(t.total)}).`,
      ancho - 10,
    ),
    M + 5,
    y + 20,
  )
  y += 42
  const mitad = ancho / 2 - 6
  const campo = (etq, x, yy) => {
    doc.setFontSize(9)
    doc.setTextColor(...GRIS)
    doc.text(etq, x, yy)
    doc.setDrawColor(...GRIS)
    doc.setLineWidth(0.3)
    doc.line(x, yy + 8, x + mitad, yy + 8)
    doc.setTextColor(...TEXTO)
  }
  const x2 = M + ancho / 2 + 6
  ;[
    ['Firma', 'Fecha'],
    ['Nombre y apellido', 'Cédula'],
    ['Cargo', 'Teléfono de contacto'],
    ['Correo electrónico', 'Orden de compra (si aplica)'],
  ].forEach(([a, b], i) => {
    campo(a, M, y + i * 16)
    campo(b, x2, y + i * 16)
  })
  y += 4 * 16 + 6
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('Contacto en sitio para coordinar los trabajos', M, y)
  doc.setFont('helvetica', 'normal')
  campo('Nombre', M, y + 7)
  campo('Celular', x2, y + 7)
  doc.setFontSize(9)
  doc.setTextColor(...GRIS)
  doc.text('Comentarios adicionales', M, y + 30)
  doc.setDrawColor(...REGLA)
  doc.roundedRect(M, y + 33, mitad, 26, 3, 3, 'S')
  doc.setLineDashPattern([1.5, 1.5], 0)
  doc.roundedRect(x2, y + 33, mitad, 26, 3, 3, 'S')
  doc.setLineDashPattern([], 0)
  doc.setFontSize(8)
  doc.text('Sello de la compañía (si aplica)', x2 + mitad / 2, y + 47, { align: 'center' })
  doc.setTextColor(...TEXTO)

  piePaginas(doc)
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
      o.numero, String(o.dia), o.cliente?.nombre || '', o.tipo, formatoCOP(totalesOferta(o).total), etiquetaEstado(o.estado),
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
