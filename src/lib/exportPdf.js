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
const GRIS = [107, 114, 128]
const FONDO = [248, 250, 252]

function descargar(doc, nombre) {
  doc.save(nombre)
}

function hoy() {
  return new Date().toISOString().slice(0, 10)
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

// Encabezado de cada página: dos líneas de referencia a la izquierda, logo a la derecha.
function cabecera(doc, linea1, linea2) {
  const w = doc.internal.pageSize.getWidth()
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...GRIS)
  doc.text(linea1, M, 16)
  doc.text(linea2, M, 20.5)
  logo(doc, w - M - 32, 10, 11)
}
const encabezado = (doc, oferta) => cabecera(doc, `Oferta ${oferta.numero}`, corta(fechaBase(oferta)))

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

// ---------- PDF de reporte del mes (horizontal) ----------

const VERDE = [16, 185, 129]
const ROJO = [220, 38, 38]
const COLOR_CONCLUSION = { alerta: ROJO, ok: VERDE, info: PRIMARIO }
const millones = (v) =>
  v >= 1e9 ? `$ ${(v / 1e9).toLocaleString('es-CO', { maximumFractionDigits: 2 })} MM` : `$ ${(v / 1e6).toLocaleString('es-CO', { maximumFractionDigits: 1 })} M`

// Banda con la foto (sin deformar) y el título encima, sobre un velo oscuro.
// La foto es más alta que la banda: lo que sobra se tapa con blanco; dibujar antes del encabezado.
function bandaFoto(doc, x, y, w, h, titulo, subtitulo) {
  const alto = w / (174 / 62) // proporción de portada-oferta.jpg
  const sobra = (alto - h) / 2
  if (portada) {
    doc.addImage(portada, 'JPEG', x, y - sobra, w, alto)
    doc.setFillColor(255, 255, 255)
    doc.rect(0, y - sobra - 1, doc.internal.pageSize.getWidth(), sobra + 1, 'F')
    doc.rect(0, y + h, doc.internal.pageSize.getWidth(), sobra + 1, 'F')
  }
  doc.saveGraphicsState()
  doc.setGState(new doc.GState({ opacity: portada ? 0.6 : 1 }))
  doc.setFillColor(8, 28, 70)
  doc.rect(x, y, w, h, 'F')
  doc.restoreGraphicsState()
  doc.setFillColor(...PRIMARIO)
  doc.rect(x, y + h - 1.2, w, 1.2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.text(titulo, x + 8, y + h / 2)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(subtitulo, x + 8, y + h / 2 + 7)
  doc.setTextColor(...TEXTO)
}

function seccion(doc, texto, y) {
  doc.setFillColor(...PRIMARIO)
  doc.rect(M, y - 3.6, 1.2, 4.6, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...TEXTO)
  doc.text(texto, M + 3.5, y)
}

export function construirPdfReporte(ofertas, k, conclusiones = []) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' })
  const w = doc.internal.pageSize.getWidth()
  const ancho = w - 2 * M
  const generado = new Date()
  const cab = () => cabecera(doc, 'Reporte comercial del mes', `Generado el ${corta(generado)}`)

  bandaFoto(doc, M, 28, ancho, 34, 'Reporte comercial del mes', `Mantenimiento correctivo y preventivo · ${ofertas.length} ofertas · generado el ${larga(generado)}`)
  cab()

  // Tarjetas KPI
  const tarjetas = [
    ['Ofertas', String(k.ofertas)],
    ['Valor ofertado', millones(k.valorOfertado)],
    ['Valor ganado', millones(k.valorGanado)],
    ['Tasa de cierre', `${Math.round((k.tasaCierre || 0) * 100)} %`],
    ['C1 promedio', `${(k.c1Promedio || 0).toLocaleString('es-CO', { maximumFractionDigits: 1 })} %`],
    ['Margen ganado', millones(k.margenGanado)],
    ['Horas vendidas', `${(k.horasVendidas || 0).toLocaleString('es-CO')} h`],
  ]
  let y = 70
  const gap = 4
  const tw = (ancho - gap * (tarjetas.length - 1)) / tarjetas.length
  tarjetas.forEach(([etq, valor], i) => {
    const x = M + i * (tw + gap)
    doc.setFillColor(...FONDO)
    doc.setDrawColor(...REGLA)
    doc.setLineWidth(0.3)
    doc.roundedRect(x, y, tw, 22, 3, 3, 'FD')
    doc.setFillColor(...PRIMARIO)
    doc.rect(x + 4, y + 4, 6, 0.9, 'F')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...GRIS)
    doc.text(etq, x + 4, y + 10)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.setTextColor(...TEXTO)
    doc.text(valor, x + 4, y + 17.5)
  })

  // Conclusiones con marcador de color por tipo
  y += 34
  seccion(doc, 'Conclusiones y alertas', y)
  y += 7
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  conclusiones.forEach((c) => {
    const l = doc.splitTextToSize(c.texto, ancho - 8)
    doc.setFillColor(...(COLOR_CONCLUSION[c.tipo] || PRIMARIO))
    doc.circle(M + 1.5, y - 1.2, 1.2, 'F')
    doc.setTextColor(...TEXTO)
    doc.text(l, M + 6, y)
    y += l.length * 4.2 + 2.2
  })
  if (!conclusiones.length) {
    doc.setTextColor(...GRIS)
    doc.text('Sin conclusiones por ahora.', M, y)
    y += 6
  }

  // Tabla de ofertas
  y += 6
  seccion(doc, 'Detalle de ofertas', y)
  const totalOfertado = ofertas.reduce((s, o) => s + totalesOferta(o).total, 0)
  autoTable(doc, {
    startY: y + 4,
    head: [['N°', 'Día', 'Cliente', 'Tipo', 'Técnico', 'Total', 'Estado']],
    body: ofertas.map((o) => [
      o.numero, String(o.dia ?? ''), o.cliente?.nombre || '', o.tipo || '', o.tecnico || '', formatoCOP(totalesOferta(o).total), etiquetaEstado(o.estado),
    ]),
    foot: ofertas.length ? [['', '', '', '', 'Total ofertado', formatoCOP(totalOfertado), '']] : undefined,
    showFoot: 'lastPage',
    theme: 'plain',
    margin: { top: 30, left: M, right: M, bottom: 22 },
    styles: { font: 'helvetica', fontSize: 8.5, textColor: TEXTO, cellPadding: 2 },
    headStyles: { fillColor: PRIMARIO, textColor: [255, 255, 255], fontStyle: 'bold' },
    footStyles: { fillColor: CABECERA, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: FONDO },
    columnStyles: { 1: { halign: 'right', cellWidth: 12 }, 5: { halign: 'right' } },
    didParseCell: (d) => {
      if (d.column.index === 1 || d.column.index === 5) d.cell.styles.halign = 'right'
      if (d.section === 'body' && d.column.index === 6) {
        const e = ofertas[d.row.index]?.estado
        if (e === 'Aceptada') d.cell.styles.textColor = [4, 120, 87]
        if (e === 'Rechazada') d.cell.styles.textColor = ROJO
        d.cell.styles.fontStyle = 'bold'
      }
    },
    didDrawPage: (d) => d.pageNumber > 1 && cab(),
  })

  piePaginas(doc)
  return doc
}

export function pdfReporte(ofertas, k, conclusiones) {
  descargar(construirPdfReporte(ofertas, k, conclusiones), `reporte-ofertas-${hoy()}.pdf`)
}
