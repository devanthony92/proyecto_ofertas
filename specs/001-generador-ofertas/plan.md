# Plan técnico 001 — Generador de Ofertas

Implementa `spec.md`. Regla: si algo no está en la spec, no se construye.

## Stack

| Necesidad | Herramienta |
|---|---|
| Build / dev server | Vite |
| UI | React (JavaScript, sin TypeScript) |
| Estilos | Tailwind CSS v4 |
| Gráficas | Chart.js + react-chartjs-2 |
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
    simulacion.js            # simularDia(estado, variables, rng)
    exportPdf.js             # pdfOferta(oferta), pdfReporte(ofertas, kpis, conclusiones)
    exportExcel.js           # excelReporte(ofertas, kpis)
  hooks/
    useSimulacion.js         # setInterval, iniciar/pausar/reiniciar
  components/
    Header.jsx
    Controles.jsx            # Iniciar / Pausa / Reinicio + día actual
    PanelVariables.jsx
    Kpis.jsx
    Graficas.jsx
    Conclusiones.jsx
    TablaOfertas.jsx
    FormOferta.jsx           # panel lateral / modal
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
ticketPromedio = valorOfertado / n                       → 0 si n = 0
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
   - Calibración (Monte Carlo, 600 meses): con visitas 2/día, cierre 35 %, instalaciones 1 %, mediana del valor ganado ≈ $ 249 M; la mitad de los meses entre $ 207 y 312 M.
   - cliente de una lista ficticia de nombres de edificios.

`rng` inyectable para tests deterministas.

`useSimulacion` maneja `dia`, `corriendo` y un `setInterval` con `velocidad × 1000` ms. Para al llegar a 30.

## Persistencia

`localStorage` guarda `variables` y `ofertas`. Reinicio borra solo las ofertas simuladas.

## Diseño

`DESIGN.md` generado con la skill `impeccable` antes de los componentes. Tokens en `index.css` (`@theme`).

## Verificación

- `npm test` → calculos y simulación.
- `npm run build` sin errores.
- Prueba manual en navegador: ver `tasks.md` tarea final.
