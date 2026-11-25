---
version: 1
slug: "src-app-jsx"
primary_target: "src/App.jsx"
related_targets: []
---

## Scope

Single-screen dashboard (src/App.jsx). Mode: Operate. Audience: técnico, jefe comercial, evaluadores en proyector. Task: armar oferta → PDF; correr simulación del mes; leer KPIs, gráficas, conclusiones; exportar.

## Direction contract

THESIS: El dashboard es la botonera de cabina de un ascensor: acero cepillado, cifras grabadas, pulsadores que se encienden. Rechaza el SaaS gris con tarjetas idénticas y un acento azul.

OWN-WORLD: Fondo acero-100, paneles acero-50 con borde 1px acero-300 y radio 6px (placas atornilladas). Banda superior acero-800 como el panel de cabina. Texto grabado acero-900; display Barlow Semi Condensed mayúsculas con tracking leve; cifras tabulares. Ámbar SOLO para "activo/encendido" (pulsador corriendo, fila nueva). Estados: enviada azul acero, aceptada verde, rechazada rojo.

STORY: El visitante ve el mes avanzar día a día, los totales suben, las conclusiones cambian; puede crear su propia oferta y descargarla.

FIRST VIEWPORT: Banda superior: nombre Elevia Ofertas, indicador de piso "DÍA 12 / 30" grande, tres pulsadores redondos (Iniciar, Pausa, Reinicio) y botón primario "Nueva oferta". Debajo: fila de KPIs como placa de capacidad (valores grandes grabados, etiqueta pequeña, sin íconos decorativos). Luego gráfica línea ancha + dona, conclusiones a la derecha. Variables en panel lateral plegable. Tabla al final.

FORM: Botonera de cabina (candidato 3 de 7). Signature move: pulsadores con anillo ámbar iluminado cuando la simulación corre; indicador de día estilo display de piso. Raises: de "terminal yellow wayfinding" — un color reservado para un solo trabajo (ámbar = activo); de "split-flap" — cifras en celdas fijas tabulares que cambian sin mover el layout. seed:8a55bd7090ba82c5

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
