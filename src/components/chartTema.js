import { Chart as ChartJS } from 'chart.js'

ChartJS.defaults.font.family = 'Inter, system-ui, sans-serif'
ChartJS.defaults.font.size = 12
ChartJS.defaults.animation.duration = 450 // modificar, no reemplazar: reemplazar el objeto rompe las actualizaciones
ChartJS.defaults.animation.easing = 'easeOutQuart'

// Colores de gráficas por tema (Chart.js dibuja en canvas: no lee variables CSS solo).
export function paleta(tema) {
  const o = tema === 'oscuro'
  return {
    texto: o ? '#9aa6b8' : '#6b7280',
    rejilla: o ? '#1f2a40' : '#eef1f5',
    primario: o ? '#4d9bf0' : '#0057b8',
    exito: o ? '#34d399' : '#10b981',
    alerta: o ? '#fbbf24' : '#f59e0b',
    critico: o ? '#f87171' : '#dc2626',
    neutro: o ? '#64748b' : '#9ca3af',
    secundario: o ? '#93c5fd' : '#7fb0e8',
    superficie: o ? '#111a2c' : '#ffffff',
    tooltipFondo: o ? '#e5e7eb' : '#111827',
    tooltipTexto: o ? '#111827' : '#f9fafb',
  }
}

export function tooltipBase(p) {
  return {
    backgroundColor: p.tooltipFondo,
    titleColor: p.tooltipTexto,
    bodyColor: p.tooltipTexto,
    footerColor: p.tooltipTexto,
    padding: 10,
    cornerRadius: 8,
    boxPadding: 4,
    usePointStyle: true,
    titleFont: { weight: '600' },
    footerFont: { weight: '400', size: 11 },
  }
}

export const compacto = (v) =>
  Math.abs(v) >= 1e9 ? `$ ${+(v / 1e9).toFixed(1)} MM` : Math.abs(v) >= 1e6 ? `$ ${Math.round(v / 1e6)} M` : `$ ${Math.round(v / 1e3)} k`
