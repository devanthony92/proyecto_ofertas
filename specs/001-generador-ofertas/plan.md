# Plan técnico 001 — Generador de Ofertas

Implementa `spec.md`. Regla: si algo no está en la spec, no se construye.

## Stack

| Necesidad | Herramienta |
|---|---|
| Build / dev server | Vite |
| UI | React (JavaScript, sin TypeScript) |
| Estilos | Tailwind CSS v4 |
| Gráficas | Chart.js + react-chartjs-2 + chartjs-plugin-zoom (zoom y desplazamiento del eje x) |
| Tipografía | Inter vía @fontsource (autohospedada) |
| Iconos | lucide-react |
| PDF | jsPDF + jspdf-autotable |
| Excel | ExcelJS |
| Tests | Vitest (solo lógica pura) |

Sin router, sin librería de estado, sin backend. Estado con `useState` / `useReducer`. Persistencia en `localStorage`.

## Estructura

```
src/
  main.jsx
  App.jsx                    # estado global + layout de una pantalla
  index.css                  # Tailwind + tokens de DESIGN.md
  data/catalogo.json         # ~20 ítems ficticios
  lib/
    calculos.js              # totalesOferta, kpis, conclusiones, formatoCOP
    calculos.test.js
    analitica.js             # período, filtros, sparklines, funnel, mapa de calor, rankings, pronóstico, alertas
    analitica.test.js
    formato.js               # formatoCompacto ($ 245,3 M), formatoPct
    simulacion.js            # simularDia(estado, variables, rng), etapaOferta(oferta, dia)
    exportPdf.js             # pdfOferta(oferta), pdfReporte(ofertas, kpis, conclusiones)
    exportExcel.js           # excelReporte(ofertas, kpis)
  hooks/
    useSimulacion.js         # setInterval, iniciar/pausar/reiniciar
  components/
    Header.jsx               # logo, búsqueda universal, fecha/hora, notificaciones, tema, configuración, perfil
    Controles.jsx            # barra de mando: período, filtros globales, DÍA n/30, simulación, Nuevo requerimiento
    Card.jsx                 # contenedor de panel + estado vacío
    chartTema.js             # paleta de gráficas por tema y tooltip base
    Kpis.jsx                 # tarjetas con sparkline, variación, desempeño y tooltip
    GraficoAcumulado.jsx     # ofertado vs ganado, banda de meta, proyección, mes anterior, zoom
    Pronostico.jsx
    Embudo.jsx
    MapaCalor.jsx
    Rankings.jsx             # técnicos y clientes
    Graficas.jsx             # dona por tipo + top 5 ítems
    Conclusiones.jsx
    PanelVariables.jsx       # modal Configuración
    TablaOfertas.jsx
    FormOferta.jsx           # modal Nuevo requerimiento
```

## Modelo de datos

```js
// item de catálogo
{ id: "rep-001", categoria: "Repuesto", descripcion: "Botonera de cabina", precio: 1850000 }

// oferta
{
  id: 12, numero: "OF-0012", dia: 5, origen: "simulada" | "manual",
  cliente: { nombre, nit, direccion, contacto },
  tipo: "Instalación" | "Reparación",
  tecnico, fechaVisita,
  items: [{ descripcion, cantidad, precio }],
  horas: 16,
  tarifaHora, margen, iva,          // copiados al crear: la oferta no cambia si cambian las variables
  estado: "Enviada" | "Aceptada" | "Rechazada"
}
```

Totales se calculan con `totalesOferta(oferta)`; no se guardan.

## Fórmulas (`calculos.js`)

```
costoItems   = Σ cantidad × precio
manoObra     = horas × tarifaHora
costo        = costoItems + manoObra
subtotal     = costo × (1 + margen/100)
ivaValor     = subtotal × iva/100
total        = subtotal + ivaValor
margenValor  = subtotal − costo
```

KPIs:
```
ofertas        = n
valorOfertado  = Σ total
valorGanado    = Σ total (Aceptada)
tasaCierre     = aceptadas / (aceptadas + rechazadas)   → 0 si denominador 0
c1Promedio     = Σ margen / n                            → 0 si n = 0
margenGanado   = Σ margenValor (Aceptada)
horasVendidas  = Σ horas (Aceptada)
```

## Simulación (`simulacion.js`)

`simularDia(ofertas, dia, variables, rng = Math.random)` devuelve nuevas ofertas:
1. Resolver ofertas `Enviada` con ≥ 2 días de antigüedad: `rng() < probCierre` → Aceptada, si no Rechazada.
2. Crear `visitasDia` ofertas nuevas (±1 aleatorio, mínimo 0):
   - tipo: `rng() < pctInstalacion` → Instalación, si no Reparación.
   - Instalación: 1 equipo + 3–5 materiales, 40–120 h.
   - Reparación: 1–3 repuestos distintos (cantidad 1–2), 4–24 h.
   - C1 (margen) de cada oferta: C1 por defecto ± 10 puntos, entre 1 y 100.
   - Calibración (Monte Carlo, 600 meses): con visitas 2/día, cierre 35 %, instalaciones 1 %, mediana del valor ganado ≈ $ 249 M; la mitad de los meses entre $ 207 y 312 M.
   - cliente de una lista ficticia de nombres de edificios.

`rng` inyectable para tests deterministas.

`etapaOferta(oferta, dia)` es una regla derivada, no un estado guardado: Aceptada → Ganada, Rechazada → Perdida, Enviada → Pendiente el día de envío y En negociación desde el día siguiente. No cambia `simularDia` ni los datos guardados.

`useSimulacion` maneja `dia`, `corriendo` y un `setInterval` con `velocidad × 1000` ms. Para al llegar a 30.

## Persistencia

`localStorage` guarda `variables`, `ofertas`, `dia`, `tema` y `mesAnterior`. Reinicio guarda las ofertas simuladas en `mesAnterior` (`{ dia, ofertas }`, solo el último mes) y luego las borra del mes actual.

## Analítica (`analitica.js`)

```
rangoPeriodo('mes', d)  → días 0..d; sin ventana anterior interna (se compara con mesAnterior hasta el día d)
rangoPeriodo('7', d)    → días d-6..d; anterior = d-13..d-7, solo si cabe completa
serieKpi(ofertas, a, b) → kpis acumulados por día (sparklines)
embudo, mapaCalor, rankingTecnicos, topClientes (por valor ganado)
pronostico              → proyectado = ganado / dia × 30; esperadoAbierto = abierto × tasaCierre; fiable desde el día 5
alertas                 → conclusiones() + ritmo 7 vs 7 días, concentración de cliente, vs mes anterior
```

## Diseño

`DESIGN.md` (dirección Enterprise SaaS, rediseño con la skill `impeccable`). Tokens semánticos en `index.css`: `@theme` apunta a variables CSS que cambian con la clase `.dark`. Los colores de Chart.js salen de `chartTema.js`.

## Verificación

- `npm test` → calculos y simulación.
- `npm run build` sin errores.
- Prueba manual en navegador: ver `tasks.md` tarea final.
