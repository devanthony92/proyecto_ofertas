// Formatos cortos para tarjetas y ejes. M = millones, MM = miles de millones (uso colombiano).
const dec1 = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 })

export function formatoCompacto(n) {
  if (!Number.isFinite(n)) return '$ 0'
  const a = Math.abs(n)
  if (a >= 1e9) return `$ ${dec1.format(n / 1e9)} MM`
  if (a >= 1e6) return `$ ${dec1.format(n / 1e6)} M`
  if (a >= 1e3) return `$ ${Math.round(n / 1e3)} k`
  return `$ ${Math.round(n)}`
}

export function formatoPct(fraccion, decimales = 0) {
  if (!Number.isFinite(fraccion)) return '0 %'
  return `${(fraccion * 100).toLocaleString('es-CO', { maximumFractionDigits: decimales })} %`
}
