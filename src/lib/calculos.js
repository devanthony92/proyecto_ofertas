export const VARIABLES_DEFECTO = {
  tarifaHora: 95000,
  margen: 25,
  iva: 19,
  visitasDia: 2,
  probCierre: 35,
  pctInstalacion: 1,
  velocidad: 1,
  metaMin: 200, // meta de facturación mensual, millones COP
  metaMax: 300,
}

const fmt = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 })

export function formatoCOP(n) {
  if (!Number.isFinite(n)) return '$ 0'
  return '$ ' + fmt.format(Math.round(n))
}

export function totalesOferta(oferta) {
  const costoItems = (oferta.items || []).reduce((s, i) => s + i.cantidad * i.precio, 0)
  const manoObra = (oferta.horas || 0) * (oferta.tarifaHora || 0)
  const costo = costoItems + manoObra
  const subtotal = costo * (1 + (oferta.margen || 0) / 100)
  const ivaValor = (subtotal * (oferta.iva || 0)) / 100
  const total = subtotal + ivaValor
  const margenValor = subtotal - costo
  return { costoItems, manoObra, costo, subtotal, ivaValor, total, margenValor }
}

export function kpis(ofertas) {
  const r = {
    ofertas: ofertas.length,
    valorOfertado: 0,
    valorGanado: 0,
    tasaCierre: 0,
    ticketPromedio: 0,
    margenGanado: 0,
    horasVendidas: 0,
    aceptadas: 0,
    rechazadas: 0,
    enviadas: 0,
    costoManoObra: 0,
    costoTotal: 0,
  }
  for (const o of ofertas) {
    const t = totalesOferta(o)
    r.valorOfertado += t.total
    r.costoManoObra += t.manoObra
    r.costoTotal += t.costo
    if (o.estado === 'Aceptada') {
      r.aceptadas++
      r.valorGanado += t.total
      r.margenGanado += t.margenValor
      r.horasVendidas += o.horas || 0
    } else if (o.estado === 'Rechazada') {
      r.rechazadas++
    } else {
      r.enviadas++
    }
  }
  const decididas = r.aceptadas + r.rechazadas
  r.tasaCierre = decididas ? r.aceptadas / decididas : 0
  r.ticketPromedio = r.ofertas ? r.valorOfertado / r.ofertas : 0
  return r
}

export function valorPorTipo(ofertas) {
  const r = { 'Instalación': 0, 'Reparación': 0 }
  for (const o of ofertas) if (o.tipo in r) r[o.tipo] += totalesOferta(o).total
  return r
}

export function topItems(ofertas, n = 5) {
  const mapa = new Map()
  for (const o of ofertas) {
    for (const i of o.items || []) {
      mapa.set(i.descripcion, (mapa.get(i.descripcion) || 0) + i.cantidad)
    }
  }
  return [...mapa]
    .map(([descripcion, cantidad]) => ({ descripcion, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, n)
}

export function serieDiaria(ofertas, diaActual) {
  const serie = []
  let ofertado = 0
  let ganado = 0
  for (let dia = 1; dia <= diaActual; dia++) {
    for (const o of ofertas) {
      if (o.dia !== dia) continue
      const t = totalesOferta(o).total
      ofertado += t
      if (o.estado === 'Aceptada') ganado += t
    }
    serie.push({ dia, ofertado, ganado })
  }
  return serie
}

// Facturación = valor ganado. Antes del día 30 se proyecta al mes completo; desde el día 5.
function reglaMeta(k, variables, dia) {
  if (!(dia >= 5)) return null
  const { metaMin = 200, metaMax = 300 } = variables || {}
  const fin = dia >= 30
  const valor = fin ? k.valorGanado : (k.valorGanado * 30) / dia
  const meta = `la meta ($ ${metaMin}–${metaMax} M)`
  const base = `Facturación ${fin ? 'del mes' : 'proyectada'}: ${formatoCOP(valor)}`
  if (valor < metaMin * 1e6) return { tipo: 'alerta', texto: `${base}, por debajo de ${meta}.` }
  if (valor > metaMax * 1e6) return { tipo: 'ok', texto: `${base}, por encima de ${meta}.` }
  return { tipo: 'ok', texto: `${base}, dentro de ${meta}.` }
}

export function conclusiones(ofertas, variables, dia = 0) {
  if (!ofertas.length) {
    return [{ tipo: 'info', texto: 'Inicia la simulación o crea una oferta para ver el análisis.' }]
  }
  const k = kpis(ofertas)
  const out = []
  if (k.aceptadas + k.rechazadas > 0) {
    if (k.tasaCierre < 0.3) {
      out.push({ tipo: 'alerta', texto: 'Tasa de cierre baja: revisar precios o seguimiento comercial.' })
    } else if (k.tasaCierre >= 0.5) {
      out.push({ tipo: 'ok', texto: 'Buena tasa de cierre: hay espacio para subir margen.' })
    }
  }
  const meta = reglaMeta(k, variables, dia)
  if (meta) out.push(meta)
  if (k.costoTotal > 0 && k.costoManoObra / k.costoTotal > 0.4) {
    out.push({ tipo: 'alerta', texto: 'Alta carga de mano de obra: revisar capacidad del equipo técnico.' })
  }
  if (!out.length) out.push({ tipo: 'info', texto: 'Indicadores dentro de rangos normales.' })
  return out
}
