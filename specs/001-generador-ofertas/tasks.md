# Tareas 001 — Generador de Ofertas

Marcar `[x]` al terminar. Una tarea = un commit pequeño.

## Fase 0 — Base
- [x] T01 `git init`, remote, `.gitignore`
- [x] T02 `spec.md`, `plan.md`, `tasks.md`
- [x] T03 `DESIGN.md` con skill `impeccable` (estilo industrial moderno)
- [x] T04 Scaffold Vite + React + Tailwind v4; instalar chart.js, react-chartjs-2, jspdf, jspdf-autotable, exceljs, vitest

## Fase 1 — Lógica (con tests)
- [x] T05 `data/catalogo.json` (~20 ítems: equipos, materiales, repuestos)
- [x] T06 `calculos.js`: `totalesOferta`, `formatoCOP` + tests
- [x] T07 `calculos.js`: `kpis`, `conclusiones` + tests (incluye caso 0 ofertas)
- [x] T08 `simulacion.js`: `simularDia` + tests con rng fijo
- [x] T09 `useSimulacion.js`: iniciar / pausar / reiniciar, para en día 30

## Fase 2 — Dashboard
- [x] T10 `App.jsx` layout + estado + localStorage
- [x] T11 `Header` + `Controles` (HU-3)
- [x] T12 `PanelVariables` + restaurar defectos + validación (HU-4)
- [x] T13 `Kpis` (HU-5)
- [x] T14 `Graficas` (HU-6)
- [x] T15 `TablaOfertas` con filtros (HU-7)
- [x] T16 `Conclusiones` (HU-9)

## Fase 3 — Ofertas y exportes
- [x] T17 `FormOferta` con catálogo, ítems libres, totales en vivo, validación (HU-1)
- [x] T18 `pdfOferta` (HU-2)
- [x] T19 `excelReporte` + `pdfReporte` (HU-8)

## Fase 4 — Cierre
- [x] T20 Pulido visual y responsive con `impeccable` (HU-10)
- [x] T21 README de portafolio (qué es, capturas, cómo correr, uso de IA)
- [x] T22 Verificación final: `npm test`, `npm run build`, prueba manual (oferta manual → PDF; iniciar/pausa/reinicio; Excel + PDF reporte; vista 375 px)

## Fase 5 — Ajustes tras revisión
- [x] T23 Calibrar defectos a facturación de sede ($ 200–300 M/mes)
- [x] T24 Variables en modal **Configuración** (fuera del dashboard)
- [x] T25 Conclusión de meta de facturación (reemplaza la de reparaciones)
- [x] T26 Formulario de nueva oferta en modal centrado (antes panel lateral)
- [x] T27 Línea roja punteada de meta mensual en la gráfica acumulada
- [x] T28 KPI C1 promedio (reemplaza ticket promedio) y C1 editable por oferta
- [x] T29 Formulario renombrado a "Nuevo requerimiento"
- [x] T30 Botones +1 día y +7 días para avance manual

## Fase 6 — Rediseño Enterprise SaaS
- [x] T31 Tokens semánticos claro/oscuro, Inter autohospedada, radios de 12 px (`index.css`, `index.html`)
- [x] T32 `etapaOferta` (Pendiente / En negociación / Ganada / Perdida) + tests
- [x] T33 `analitica.js` (período y período anterior, filtros, sparklines, funnel, mapa de calor, rankings, pronóstico, alertas) + tests
- [x] T34 Mes anterior guardado al reiniciar (`elevia.mesAnterior`)
- [x] T35 Encabezado ejecutivo: búsqueda universal, fecha/hora, notificaciones, tema, configuración, perfil demo
- [x] T36 Barra de mando: período, filtros globales, DÍA n/30, simulación, Nuevo requerimiento
- [x] T37 Tarjetas KPI con icono, sparkline, variación, desempeño y tooltip
- [x] T38 Gráfica acumulada: banda de meta, proyección, mes anterior, series ocultables, zoom
- [x] T39 Paneles: funnel, mapa de calor, ranking de técnicos, top clientes, pronóstico, conclusiones y alertas
- [x] T40 Tabla con etapa, técnico y búsqueda; modales y PDF con la nueva paleta
- [x] T41 `DESIGN.md`, `PRODUCT.md`, README y verificación a 1440 / 1024 / 375 px en claro y oscuro
- [x] T42 Solo dos tipos de trabajo: Mantenimiento correctivo y preventivo (datos, formulario, filtros, dona, tests); migración de ofertas viejas
- [x] T43 Catálogo sin equipos de instalación nueva; categoría Consumible para preventivo
- [x] T44 Variable "% preventivo" y recalibración Monte Carlo (4 requerimientos/día, 50 % preventivo → mediana $ 253 M)
- [x] T45 Flujo requerimiento → oferta: el técnico levanta el requerimiento y el asesor comercial elabora la oferta (textos de UI, spec, PRODUCT)
- [x] T46 Etapas visibles: Enviada, En negociación, Aprobada, Rechazada (funnel, tabla, filtro, KPIs, exportes)
