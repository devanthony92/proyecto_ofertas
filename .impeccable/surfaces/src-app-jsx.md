---
version: 2
slug: "src-app-jsx"
primary_target: "src/App.jsx"
related_targets: ["src/components", "src/index.css"]
---

## Scope

Single-screen executive dashboard (src/App.jsx). Mode: Operate. Audience: jefe comercial / directivos, técnico, evaluadores en proyector. Task: leer el mes comercial simulado de un vistazo, filtrar, crear un requerimiento → PDF, correr la simulación, exportar.

## Direction contract

THESIS: Panel ejecutivo Enterprise SaaS (referencias del usuario: Power BI, Salesforce Lightning, SAP Analytics Cloud, Schneider EcoStruxure). Minimalista, espacio en blanco, premium. Pin del usuario: paleta #F8FAFC / blanco / #0057B8 / #10B981 / #F59E0B / #DC2626 / #111827 / #6B7280, Inter, radio 12 px, claro y oscuro.

OWN-WORLD: Un solo azul de marca; verde/ámbar/rojo solo para estado. Tarjetas blancas con borde 1 px y sombra sutil. Cifras tabulares grandes, etiquetas grises. Encabezado en dos filas: identidad + utilidades; barra de mando con período, filtros, DÍA n/30 y simulación.

STORY: El directivo ve 7 KPIs con tendencia y variación, la curva acumulada contra la banda de meta y el pronóstico; luego funnel, actividad por técnico, rankings, alertas y la tabla.

FIRST VIEWPORT: Encabezado, barra de mando, título "Panel comercial", fila de 7 KPIs, inicio de la gráfica acumulada y del pronóstico.

HONESTY: Todo sale de ofertas simuladas o manuales; rotulado "simulado". Período anterior = mes anterior guardado al reiniciar, o ventana previa de igual largo. Pronóstico = proyección lineal declarada, no IA.

FINISH: verificado en 1440 / 1024 / 375 px, claro y oscuro; DESIGN.md actualizado.
