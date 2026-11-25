# Elevia Ofertas — Generador de ofertas para ascensores

**Demo en vivo:** https://devanthony92.github.io/proyecto_ofertas/

Después de una visita técnica, el técnico tiene en la mano una lista de equipos, materiales, repuestos y horas de mano de obra. Elevia Ofertas convierte esa lista en una oferta para el cliente, con totales calculados automáticamente (margen, IVA y total en pesos colombianos) y descargable en PDF en cuestión de minutos. El tablero simula un mes comercial completo para mostrar cómo se comportan las ofertas, el cierre y el margen día a día.

> Aviso: la marca Elevia Ofertas, los clientes, el catálogo y todas las cifras son ficticios. Es un proyecto académico y no contiene datos reales de ninguna empresa.

## Funcionalidades

| Requisito | Cómo lo resuelve la app |
|---|---|
| Dashboard interactivo | Una sola pantalla con banda de control, KPIs, gráficas, conclusiones, tabla y panel de variables. Un formulario lateral permite crear ofertas sin salir. |
| Datos y variables editables | Panel "Variables" con tarifa por hora, margen, IVA, visitas por día, probabilidad de cierre, % de instalaciones y velocidad. Valida que no haya negativos y que los porcentajes estén entre 0 y 100. Incluye botón para restaurar valores. |
| Cálculos automáticos | Subtotal, margen, IVA y total se recalculan al instante al cambiar cualquier ítem, cantidad, precio, horas o variable. |
| KPIs en tiempo real | Fila de siete indicadores (ofertas, valor ofertado, valor ganado, tasa de cierre, C1 promedio (margen), margen ganado y horas vendidas) que se actualizan en cada día simulado y al guardar una oferta. |
| Gráficas dinámicas | Chart.js: línea de valor ofertado frente a ganado acumulado por día, dona por tipo de trabajo y barras con el top 5 de ítems más ofertados. |
| Iniciar / pausa / reinicio | Un hook de simulación usa un intervalo de "velocidad × 1 s" por día. Pausa conserva los datos, Reinicio vuelve al día 0 y borra solo las ofertas simuladas. La simulación se detiene sola en el día 30. Los botones +1 día y +7 días avanzan a mano, para explicar el sistema creando requerimientos entre días. |
| Exportación PDF y Excel | Oferta en PDF desde el formulario y desde cada fila (jsPDF y jspdf-autotable). Reporte del mes en PDF y libro Excel con hojas Ofertas, Ítems y KPIs (ExcelJS). |
| Tablas automáticas | La tabla de ofertas se construye desde el estado: filtros por estado y tipo, más recientes primero. |
| Conclusiones automáticas | Reglas sobre tasa de cierre, peso de reparaciones y carga de mano de obra. Siempre muestra al menos un mensaje. |
| Diseño Enterprise SaaS | Tailwind CSS v4 con tokens semánticos, modo claro y oscuro y tipografía Inter. Funciona desde 375 px hasta escritorio. Ver [DESIGN.md](DESIGN.md). |

## Cómo se calcula

Totales de una oferta (`totalesOferta`):

```
costoItems   = Σ cantidad × precio
manoObra     = horas × tarifaHora
costo        = costoItems + manoObra
subtotal     = costo × (1 + margen/100)
ivaValor     = subtotal × iva/100
total        = subtotal + ivaValor
margenValor  = subtotal − costo
```

Indicadores (`kpis`):

```
ofertas        = n
valorOfertado  = Σ total
valorGanado    = Σ total (Aceptada)
tasaCierre     = aceptadas / (aceptadas + rechazadas)   → 0 si el denominador es 0
c1Promedio     = Σ margen C1 / n                         → 0 si n = 0
margenGanado   = Σ margenValor (Aceptada)
horasVendidas  = Σ horas (Aceptada)
```

Las ofertas copian la tarifa, el margen y el IVA al crearse, así que un cambio posterior en las variables no altera las ofertas ya generadas.

## Stack

| Necesidad | Herramienta |
|---|---|
| Framework de interfaz | React 19 |
| Build y servidor de desarrollo | Vite 8 |
| Estilos | Tailwind CSS 4 (`@tailwindcss/vite`) |
| Gráficas | Chart.js 4 + react-chartjs-2 5 |
| PDF | jsPDF 4 + jspdf-autotable 5 |
| Excel | ExcelJS 4 |
| Pruebas | Vitest (lógica pura) |
| Iconos | lucide-react |
| Tipografía | Inter vía @fontsource |

Sin backend, sin base de datos y sin login. El estado vive en React y las variables y ofertas se guardan en `localStorage`.

## Cómo ejecutar

Requisito: Node.js (versión LTS reciente).

```bash
npm install
npm run dev
```

Otros comandos:

```bash
npm test          # pruebas de cálculos y simulación
npm run build     # compilación de producción en dist/
npm run preview   # sirve la compilación para revisarla
```

## Estructura del proyecto

```
proyecto_ofertas/
├── DESIGN.md                  # sistema de diseño
├── PRODUCT.md                 # producto, usuarios y principios
├── specs/001-generador-ofertas/
│   ├── spec.md                # qué debe hacer la app
│   ├── plan.md                # cómo se construye
│   └── tasks.md               # tareas y estado
└── src/
    ├── App.jsx                # estado global y layout de una pantalla
    ├── index.css              # Tailwind y tokens de diseño
    ├── data/catalogo.json     # catálogo ficticio de ítems
    ├── lib/                   # cálculos, simulación y exportes
    ├── hooks/useSimulacion.js # iniciar, pausar y reiniciar
    └── components/            # Header, Controles, PanelVariables, Kpis,
                               # Graficas, Conclusiones, TablaOfertas, FormOferta
```

## Metodología

El proyecto sigue **desarrollo guiado por especificación**. Cada funcionalidad pasa por tres documentos en `specs/` antes de escribir código:

1. **Spec**: el problema, las historias de usuario y sus criterios de aceptación.
2. **Plan**: stack, modelo de datos, fórmulas y decisiones técnicas.
3. **Tasks**: la lista de tareas que se marcan al terminar, una por commit.

El principio que guía todas las decisiones es **keep it simple**: una sola pantalla, sin login ni backend, y si algo no está en la spec, no se construye.

## Uso de Inteligencia Artificial

El proyecto se construyó con **Claude Code**, distribuyendo las tareas entre modelos de Claude según su complejidad:

- **Opus**: planificación, dirección de diseño, revisión y correcciones.
- **Sonnet**: lógica de negocio y pruebas, interfaz del dashboard, exportes a PDF y Excel.
- **Haiku**: andamiaje del proyecto y documentación.

La dirección visual se definió con la skill de diseño **Impeccable**, primero con una dirección industrial de "botonera de cabina" y luego con un rediseño ejecutivo tipo Enterprise SaaS. El conocimiento del dominio (cómo se levanta una oferta de mantenimiento o instalación de ascensores), los requisitos y la aprobación de la spec y del diseño son responsabilidad humana.

## Capturas

Agrega aquí capturas en `docs/` (dashboard escritorio, móvil, PDF de oferta).

## Autores

Equipo: _(nombres del grupo)_
