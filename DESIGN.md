# Sistema de diseño — Elevia Ofertas

Fuente de verdad: `src/index.css` (tokens en `@theme` y clases de componente) y los componentes en `src/components/`.

## Dirección

Botonera de cabina de un ascensor: acero cepillado frío, cifras grabadas y pulsadores que se encienden. El tablero debe leerse de un vistazo en un proyector: los números mandan, la decoración no.

Se rechaza el SaaS gris de tarjetas idénticas con acento azul. El único color con función propia es el ámbar, y se usa para indicar qué está activo.

## Color

Acero (neutros, base de toda la interfaz):

| Token | Hex | Rol |
|---|---|---|
| `acero-50` | #f4f6f7 | Superficie de placas y paneles |
| `acero-100` | #e9edf0 | Fondo de página, hover de botón, cabecera de tabla |
| `acero-200` | #d6dce1 | Separadores internos, rejilla de gráficas, texto sobre la banda |
| `acero-300` | #bcc5cc | Borde 1px de placas y separadores de KPI |
| `acero-400` | #8f9aa4 | Borde de campos y botones |
| `acero-500` | #66727d | Iconos informativos |
| `acero-600` | #4a545e | Etiquetas y texto secundario (contraste AA sobre acero-50) |
| `acero-700` | #353d45 | Hover del botón primario |
| `acero-800` | #252b31 | Banda superior; serie "Instalación" |
| `acero-900` | #15191d | Texto grabado, botón primario, dígito de piso |

Ámbar (señal de estado, no decoración):

| Token | Hex | Rol |
|---|---|---|
| `ambar-300` | #ffd27a | Selección de texto |
| `ambar-400` | #f6b532 | Anillo del pulsador activo; dígito de día mientras la simulación corre |
| `ambar-500` | #e39b0b | Anillo de foco visible (`:focus-visible`) |
| `ambar-700` | #8a5a00 | Reservado; sin uso actual |

Estados de oferta y series de datos:

| Token | Hex | Rol |
|---|---|---|
| `enviada` | #2f6496 | Estado Enviada; serie "Ofertado"; barras del top 5 |
| `aceptada` | #1d7448 | Estado Aceptada; serie "Ganado"; icono de conclusión positiva |
| `rechazada` | #b0291f | Estado Rechazada; error de campo; icono de alerta |
| `serie-instalacion` | #252b31 | Dona: Instalación |
| `serie-reparacion` | #8f9aa4 | Dona: Reparación |

Regla: **ámbar solo para activo / encendido y foco.** Nunca para botones normales, títulos, badges ni bordes decorativos. Los estados de oferta usan azul, verde y rojo para no competir con el ámbar.

## Tipografía

- **Cuerpo**: Barlow (400, 500, 600) vía `--font-sans`. Textos, formularios, tabla.
- **Display**: Barlow Semi Condensed (500, 600, 700) vía `--font-display` y la clase `font-display`. Títulos de placa, nombre de la app, valores de KPI, dígito de piso. Se usa en mayúsculas con tracking leve solo en etiquetas pequeñas (cabecera de KPI, cabecera de tabla).
- **Cifras**: `tabular-nums` en todo número que cambie (KPIs, totales, tabla, campos numéricos) para que las columnas no se muevan al actualizarse. La clase `table` lo aplica por defecto.
- Escala: título de app 24 px; títulos de placa 18 px; valores KPI 20 px; cuerpo 14 px; etiquetas 12 px.

## Componentes

**Placa (`.placa`)**: superficie `acero-50`, borde 1px `acero-300`, radio 6px y sombra suave. Es el contenedor de todos los bloques: KPIs, gráficas, conclusiones, variables, tabla.

**Campo (`.campo`)**: fondo blanco, borde `acero-400`, radio 4px, altura mínima 36 px. Con `aria-invalid="true"` el borde pasa a `rechazada` y el mensaje se muestra debajo con `role="alert"`.

**Botón (`.btn`)**: blanco con borde `acero-400`, altura mínima 36 px, hover `acero-100`. Estado deshabilitado con opacidad 45 %.
- **`.btn-primario`**: fondo `acero-900`, texto blanco. Una sola acción primaria por zona.
- **`.btn-sm`**: 32 px de altura, para acciones dentro de filas (descargar PDF, eliminar ítem).

**Pulsador (`.pulsador`)**: botón circular de 44 px con gradiente de acero y sombra de bisel, etiqueta debajo. Al pulsar se hunde 1 px.
- Con `aria-pressed="true"` aparece un anillo ámbar de 2 px con halo suave: es la señal de que la simulación está corriendo (Iniciar) o en pausa (Pausa).
- Iniciar, Pausa y Reinicio son los tres pulsadores de la banda superior.

**Indicador de piso**: el texto "DÍA 12 / 30" va en un recuadro `acero-900` con tipografía display tabular. Cambia a ámbar mientras corre.

**Badges de estado**: texto de 12 px en un rectángulo redondeado con borde al 30 % del color y fondo al 10 %. Azul para Enviada, verde para Aceptada, rojo para Rechazada.

**Fila de KPI**: una sola placa dividida en siete celdas con reglas de 1px `acero-300` (sin tarjetas separadas). Cada celda: etiqueta pequeña arriba, cifra grande abajo. Sin íconos.

**Formulario lateral (drawer)**: panel fijo a la derecha, 560 px en escritorio y pantalla completa en móvil, sobre una capa `acero-900` al 50 %. Se cierra con Escape, con la capa o con el botón de cerrar. Los totales se muestran en una placa al pie con la cifra final en display.

## Layout

- Ancho máximo 1440 px, centrado; márgenes de 16 px en móvil y 24 px desde `sm`.
- Escritorio (`xl`, 1280 px o más): columna principal a la izquierda y columna lateral de 320 px con variables y conclusiones.
- Móvil y tablet: una sola columna en el orden banda, KPIs, gráficas, conclusiones, variables y tabla.
- La tabla de ofertas tiene scroll horizontal interno (mínimo 640 px de ancho) y cabecera fija.

## Gráficas

- Chart.js con fuente Barlow y color de texto `#4a545e`.
- Rejilla y ejes en `acero-200` (#d6dce1).
- Línea: "Ofertado" en azul `enviada` y "Ganado" en verde `aceptada`, con tensión 0,25 y puntos de 2 px. Eje Y en formato compacto (`$ 12 M`, `$ 800 k`).
- Dona: Instalación en `acero-800` y Reparación en `serie-reparacion` (#8f9aa4), sin usar el ámbar; grosor de corte 60 %, separación de 2 px en color de fondo.
- Barras horizontales del top 5 en azul `enviada`; etiquetas de más de 28 caracteres se recortan con puntos suspensivos.
- Las gráficas se sincronizan con la simulación con animación de 300 ms. Sin datos se muestra un texto que invita a iniciar la simulación o crear una oferta.
- Nota de implementación: los colores de las gráficas están escritos como valores hex en `Graficas.jsx`, no como tokens de Tailwind. Si cambia la paleta, actualizar ambos sitios.

## Qué evitar

- Tarjetas idénticas con sombra y radio grandes repetidas en cuadrícula sin jerarquía.
- Gradientes de fondo, efectos de vidrio (glass) y brillos decorativos. El único gradiente permitido es el bisel de los pulsadores.
- Emojis en la interfaz, en gráficas o en los PDF y Excel.
- Ámbar decorativo: en títulos, en botones normales, en badges o como acento de marca. Si algo no está encendido o activo, no es ámbar.
- Íconos decorativos en las cifras KPI. Los íconos solo acompañan acciones o estados.
- Números que cambian de ancho al actualizarse: siempre `tabular-nums`.
- Mostrar `NaN`: con cero datos se muestra `0` o `—`.
