// Analítica del dashboard. Todo se calcula a partir de las ofertas del estado
// (simuladas o creadas a mano); nada se inventa.
import { kpis, totalesOferta, conclusiones } from './calculos.js'
import { etapaOferta } from './simulacion.js'

export const PERIODOS = [
  ['mes', 'Mes en curso'],
  ['14', 'Últimos 14 días'],
  ['7', 'Últimos 7 días'],
]

export const ETAPAS = ['Enviada', 'En negociación', 'Aprobada', 'Rechazada']

// Ventana de días del período elegido y la ventana anterior del mismo largo.
// "mes" no tiene ventana anterior dentro del mes: se compara contra el mes anterior guardado.
// Para 7 / 14 días la ventana anterior solo existe si cabe completa (comparar 7 días contra 3 engaña).
export function rangoPeriodo(periodo, dia) {
  const hasta = Math.max(0, dia)
  if (periodo === 'mes') return { desde: 0, hasta, anterior: null } // día 0: ofertas manuales antes de iniciar
  const n = Number(periodo) || 7
  const desde = Math.max(1, hasta - n + 1)
  const prevDesde = desde - n
  const anterior = hasta >= n && prevDesde >= 1 ? { desde: prevDesde, hasta: desde - 1 } : null
  return { desde, hasta, anterior }
}

export function filtrarOfertas(ofertas, { desde = -Infinity, hasta = Infinity, tipo = '', tecnico = '' } = {}) {
  return ofertas.filter(
    (o) =>
      o.dia >= desde &&
      o.dia <= hasta &&
      (!tipo || o.tipo === tipo) &&
      (!tecnico || (o.tecnico || 'Sin asignar') === tecnico),
  )
}

// KPIs acumulados día a día dentro de [desde, hasta]: alimenta los sparklines.
// Con `clave` devuelve solo ese indicador; sin ella, el objeto de kpis de cada día.
export function serieKpi(ofertas, desde, hasta, clave) {
  const out = []
  for (let d = desde; d <= hasta; d++) {
    const k = kpis(filtrarOfertas(ofertas, { desde, hasta: d }))
    out.push(clave ? k[clave] : k)
  }
  return out
}

// Variación relativa; null si no hay base con qué comparar.
export function variacion(actual, anterior) {
  if (anterior == null || !Number.isFinite(anterior) || anterior === 0) return null
  return (actual - anterior) / Math.abs(anterior)
}

export function embudo(ofertas, dia) {
  const r = { creadas: ofertas.length, 'Enviada': 0, 'En negociación': 0, 'Aprobada': 0, 'Rechazada': 0 }
  for (const o of ofertas) r[etapaOferta(o, dia)]++
  return r
}

// Requerimientos levantados por técnico y día (1 requerimiento = 1 oferta): mapa de calor.
export function mapaCalor(ofertas, diaMax = 30, base = []) {
  const nombres = [...base]
  for (const o of ofertas) {
    const n = o.tecnico || 'Sin asignar'
    if (!nombres.includes(n)) nombres.push(n)
  }
  let max = 0
  const filas = nombres.map((tecnico) => {
    const dias = Array(diaMax).fill(0)
    for (const o of ofertas) {
      if ((o.tecnico || 'Sin asignar') === tecnico && o.dia >= 1 && o.dia <= diaMax) dias[o.dia - 1]++
    }
    max = Math.max(max, ...dias)
    return { tecnico, dias, total: dias.reduce((s, x) => s + x, 0) }
  })
  return { filas, max }
}

function agrupar(ofertas, clave) {
  const mapa = new Map()
  for (const o of ofertas) {
    const k = clave(o)
    const g = mapa.get(k) || { nombre: k, ofertas: 0, aceptadas: 0, decididas: 0, ganado: 0, ofertado: 0 }
    const total = totalesOferta(o).total
    g.ofertas++
    g.ofertado += total
    if (o.estado === 'Aceptada') {
      g.aceptadas++
      g.ganado += total
    }
    if (o.estado === 'Aceptada' || o.estado === 'Rechazada') g.decididas++
    mapa.set(k, g)
  }
  return [...mapa.values()].map((g) => ({ ...g, tasa: g.decididas ? g.aceptadas / g.decididas : 0 }))
}

// Ranking de técnicos por el valor ganado de las ofertas que salen de sus requerimientos.
export function rankingTecnicos(ofertas) {
  return agrupar(ofertas, (o) => o.tecnico || 'Sin asignar').sort((a, b) => b.ganado - a.ganado || b.ofertas - a.ofertas)
}

// Top clientes por facturación (valor ganado). Solo clientes con algo ganado.
export function topClientes(ofertas, n = 5) {
  return agrupar(ofertas, (o) => o.cliente?.nombre || 'Sin nombre')
    .filter((c) => c.ganado > 0)
    .sort((a, b) => b.ganado - a.ganado)
    .slice(0, n)
}

// Pronóstico de cierre del mes por proyección lineal: (ganado ÷ días transcurridos) × 30.
// Además, valor esperado de las ofertas abiertas = valor abierto × tasa de cierre observada.
export function pronostico(ofertas, dia, diaMax = 30) {
  const k = kpis(ofertas)
  const abierto = ofertas.filter((o) => o.estado === 'Enviada').reduce((s, o) => s + totalesOferta(o).total, 0)
  const ritmo = dia > 0 ? k.valorGanado / dia : 0
  return {
    ganado: k.valorGanado,
    ritmo,
    proyectado: dia >= diaMax ? k.valorGanado : ritmo * diaMax,
    abierto,
    esperadoAbierto: abierto * k.tasaCierre,
    fiable: dia >= 5, // con menos de 5 días la proyección es muy inestable
  }
}

// Conclusiones automáticas + tendencias calculadas sobre las mismas ofertas.
export function alertas(ofertas, variables, dia, mesAnterior = null) {
  const out = conclusiones(ofertas, variables, dia).filter((c) => c.texto !== 'Indicadores dentro de rangos normales.')
  if (!ofertas.length) return out

  if (dia >= 14) {
    const ult = filtrarOfertas(ofertas, { desde: dia - 6, hasta: dia }).length
    const prev = filtrarOfertas(ofertas, { desde: dia - 13, hasta: dia - 7 }).length
    const v = variacion(ult, prev)
    if (v != null && v <= -0.25) {
      out.push({ tipo: 'alerta', texto: `Ritmo de ofertas a la baja: ${ult} en los últimos 7 días frente a ${prev} en los 7 previos.` })
    } else if (v != null && v >= 0.25) {
      out.push({ tipo: 'ok', texto: `Ritmo de ofertas al alza: ${ult} en los últimos 7 días frente a ${prev} en los 7 previos.` })
    }
  }

  const k = kpis(ofertas)
  const [top] = topClientes(ofertas, 1)
  if (top && k.aceptadas >= 3 && top.ganado / k.valorGanado > 0.35) {
    out.push({
      tipo: 'info',
      texto: `Concentración: ${top.nombre} aporta el ${Math.round((top.ganado / k.valorGanado) * 100)} % del valor ganado.`,
    })
  }

  if (mesAnterior?.ofertas?.length && dia >= 5) {
    const antes = kpis(filtrarOfertas(mesAnterior.ofertas, { hasta: dia })).valorGanado
    const v = variacion(k.valorGanado, antes)
    if (v != null) {
      const pct = Math.round(Math.abs(v) * 100)
      out.push({
        tipo: v < -0.1 ? 'alerta' : v > 0.1 ? 'ok' : 'info',
        texto: `Valor ganado al día ${dia}: ${v >= 0 ? `${pct} % por encima` : `${pct} % por debajo`} del mes anterior simulado.`,
      })
    }
  }

  if (!out.length) out.push({ tipo: 'info', texto: 'Indicadores dentro de rangos normales.' })
  return out
}
