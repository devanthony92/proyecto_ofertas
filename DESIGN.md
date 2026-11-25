# Sistema de diseño — Elevia Ofertas

Fuente de verdad: `src/index.css` (tokens en `@theme`, variables por tema y clases de componente), `src/components/chartTema.js` (colores de gráficas) y los componentes en `src/components/`.

## Dirección

Panel comercial ejecutivo con estándar Enterprise SaaS de multinacional. Referencias pedidas por el usuario: Power BI, Salesforce Lightning, SAP Analytics Cloud, Schneider EcoStruxure. Minimalista, mucho espacio en blanco, premium y sobrio: lo lee un directivo en un proyector o en una tableta.

Reemplaza por completo la dirección anterior ("botonera de cabina", acero y ámbar, Barlow).

Reglas de la dirección:
- El dato manda. Cifras grandes y tabulares; el resto en gris secundario.
- Un solo color de marca (azul primario). Verde, ámbar y rojo solo comunican estado (bien, vigilar, crítico), nunca decoran.
- Consistencia total: mismo radio, borde, sombra y espaciado en cada panel.

## Color

La paleta la fijó el usuario. Cada token existe en claro y en oscuro (`:root` y `.dark` en `index.css`); los componentes usan los nombres semánticos (`bg-superficie`, `text-texto-2`, …), nunca hex sueltos.

| Token | Claro | Oscuro | Rol |
|---|---|---|---|
| `fondo` | #F8FAFC | #0B1120 | Fondo de página |
| `superficie` | #FFFFFF | #111A2C | Tarjetas, encabezado, modales, campos |
| `sutil` | #F1F5F9 | #18233A | Hover, cabecera de tabla, pistas de barras, celdas vacías |
| `borde` | #E5E7EB | #233049 | Borde 1 px de tarjetas y separadores |
| `borde-fuerte` | #D1D5DB | #31415F | Borde de campos y botones |
| `texto` | #111827 | #F1F5F9 | Texto principal y cifras |
| `texto-2` | #6B7280 | #9AA6B8 | Etiquetas, subtítulos, texto secundario (AA sobre fondo y superficie) |
| `texto-3` | #9CA3AF | #64748B | Iconos informativos y marcas de eje; no para texto de lectura |
| `primario` | #0057B8 | #4D9BF0 | Marca, botón primario, serie "Ganado", barras, foco, selección |
| `primario-suave` | 8 % de primario | 14 % | Fondo de iconos de KPI, chips activos, avatar |
| `exito` / `exito-texto` | #10B981 / #047857 | #34D399 | Desempeño bueno, variación positiva, banda de meta |
| `alerta` / `alerta-texto` | #F59E0B / #B45309 | #FBBF24 | En riesgo, pausa, alertas automáticas |
| `critico` / `critico-texto` | #DC2626 / #B91C1C | #F87171 | Bajo meta, variación negativa, rechazadas, errores, línea de meta mínima |

Los colores de estado tienen una variante `-texto` porque #10B981 y #F59E0B no llegan a 4,5:1 sobre blanco: el color base se usa en puntos, barras e iconos; la variante oscura en texto. Los chips de estado usan el color al 10 % de fondo.

## Tipografía

- **Inter** (400, 500, 600, 700) autohospedada con `@fontsource/inter`. Una sola familia.
- Escala: título de página 24 px semibold; valor de KPI 24 px semibold; pronóstico 30 px; título de tarjeta 15 px semibold; cuerpo 14 px; etiquetas y subtítulos 12–13 px.
- Tracking −0,01 em en títulos y cifras grandes.
- `tabular-nums` en todo número que cambie (KPIs, tabla, rankings, ejes, campos numéricos).
- Montos largos se compactan en tarjetas (`$ 245,3 M`, `$ 1,2 MM`) con el valor completo en `title`.

## Forma y profundidad

- Radio de tarjeta 12 px (`--radius-card`); controles 8 px (`--radius-control`); chips y búsqueda en píldora.
- Borde 1 px `borde` + sombra sutil `--shadow-card` (desplazada y difusa). Popovers con `--shadow-pop`.
- Sin gradientes de fondo ni vidrio. Único degradado: el relleno bajo la serie "Ganado" de la gráfica.

## Componentes

**Encabezado** (sticky desde 1024 px): logo ficticio (cabina con flechas, dibujado en SVG), búsqueda universal en píldora con atajo `Ctrl K` y resultados en popover, fecha y hora local, botón de tema, notificaciones con contador de alertas, configuración y perfil de demostración.

**Barra de mando** (segunda fila del encabezado): selector de período, filtros globales de tipo y técnico, progreso **DÍA n / 30** con punto de estado (verde en curso, ámbar en pausa, azul mes cerrado) y barra, grupo segmentado de simulación (Iniciar/Reanudar o Pausa, +1 día, +7 días, Reinicio) y botón primario **Nuevo requerimiento**.

**Tarjeta (`.card` + `Card.jsx`)**: superficie, borde, radio 12, sombra; título 15 px y subtítulo 13 px; acción opcional a la derecha. Estado vacío con texto centrado que invita a iniciar la simulación.

**Tarjeta KPI**: icono en cuadro `primario-suave`, botón de ayuda con tooltip (anclado a la tarjeta para no salirse de la pantalla), etiqueta, cifra, sparkline del acumulado del período (línea primaria + área al 8 %), chip de variación (flecha, verde/rojo, en % o en puntos porcentuales `pp`) con su base de comparación, y pie de desempeño con punto de color cuando hay una meta o regla.

**Botones**: `.btn` (superficie, borde fuerte, 36 px), `.btn-primario` (primario), `.btn-sm` (32 px), `.btn-icono` (36 px, sin borde, para el encabezado y filas).

**Campos**: `.campo` 36 px, borde fuerte, foco con borde primario y halo `primario-suave` de 3 px.

**Chips de etapa**: píldora con fondo al 10 %: Enviada gris, En negociación azul, Aprobada verde, Rechazada rojo.

**Listas con barra** (ranking, top clientes, funnel): fila con nombre y cifra, barra de 6–8 px sobre pista `sutil`, detalle en 12 px.

**Mapa de calor**: tabla de celdas de 24 px con radio 4; intensidad = primario mezclado al 22–100 %; días futuros en `sutil` atenuado; columna del día actual resaltada.

**Modales** (Nuevo requerimiento, Configuración): superficie, radio 12, velo #0B1120 al 55 %, cierre con Escape.

## Layout

- Ancho máximo 1440 px, márgenes 16 / 24 px, separación entre bloques 24 px.
- Orden: título de página + exportes, 7 KPIs, gráfica acumulada + pronóstico, mapa de calor + conclusiones, funnel + ranking + clientes, dona + top ítems, tabla.
- KPIs: 7 columnas desde 1280 px, 4 en 1024, 3 en 768, 2 desde 420, 1 en móvil.
- Columnas de 360 px a la derecha desde 1280 px; en tablet los paneles pasan a 2 columnas y en móvil a 1.
- Tablas anchas (ofertas, mapa de calor) con scroll horizontal propio; la página nunca desborda a 375 px.

## Gráficas

- Chart.js con Inter; colores de `paleta(tema)` en `chartTema.js` (canvas no lee variables CSS).
- Acumulado: líneas monotónicas suavizadas; Ofertado azul claro, Ganado primario con área degradada, Proyección lineal punteada, Mes anterior gris discontinuo. Banda de meta verde al 8 % entre meta mínima y máxima, meta mínima en rojo punteado. Leyenda como chips que ocultan series. Zoom: arrastrar, Ctrl + rueda, pellizco; Shift + arrastre para desplazar; doble clic o "Restablecer".
- Tooltip oscuro (claro en modo oscuro) con título "Día n de 30", valores en COP y pie con conversión y brecha a la meta.
- Animación 450 ms `easeOutQuart`; los cambios de ancho de barras duran 500 ms. Con `prefers-reduced-motion` se anulan.

## Honestidad de los datos

- Todo indicador sale de las ofertas del estado (simuladas o manuales). La interfaz dice "simulado" en el título de página, en la gráfica, en las alertas y en el pie.
- El pronóstico se rotula como proyección estadística con su método; no se presenta como IA.
- El perfil es un usuario de demostración; no hay login.

## Qué evitar

- Color de estado como decoración, o más de un color de marca.
- Tarjetas anidadas, bordes laterales de color, sombras duras, vidrio, texto con degradado.
- Emojis en la interfaz, en gráficas o en PDF/Excel.
- Hex sueltos en componentes: usar tokens (excepción documentada: `chartTema.js`).
- Mostrar `NaN`: con cero datos se muestra `0`, `—` o el estado vacío.
- Logos, nombres o colores de empresas reales.
