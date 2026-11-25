# Spec 001 — Generador de Ofertas para Ascensores

> Qué debe hacer la app y cómo sabemos que está bien. No describe cómo se construye (ver `plan.md`).

## Problema

Después de una visita técnica, el técnico levanta un **requerimiento**: la lista de repuestos, materiales, consumibles y horas de mano de obra que hacen falta. El técnico no cotiza: con ese requerimiento el asesor comercial elabora la oferta. Convertir el requerimiento en una oferta formal para el cliente es lento y propenso a errores de cálculo. La gerencia, además, no ve de forma simple cuántas ofertas se generan, cuánto valen y cuántas se cierran.

## Usuarios

- **Técnico**: levanta el requerimiento después de la visita.
- **Asesor comercial**: elabora la oferta a partir del requerimiento (uno a uno), ajusta el C1 y la descarga en PDF.
- **Jefe comercial**: mira el dashboard del mes, ajusta supuestos y exporta reportes.

## Principio

**Keep it simple.** Una sola pantalla, sin login, sin backend. Los datos viven en el navegador.

## Marca

Empresa ficticia: **Elevia Ofertas**. No se usan nombres ni logos de empresas reales.

---

## Historias de usuario

### HU-1 Crear una oferta (botón **Nuevo requerimiento**)

Como asesor comercial quiero registrar el requerimiento que levantó el técnico para generar la oferta. Cada requerimiento produce una oferta.

**Criterios de aceptación**
- [ ] Puedo ingresar: cliente (nombre, NIT, dirección, contacto), tipo de trabajo (**Mantenimiento correctivo** / **Mantenimiento preventivo**, los únicos del sistema), técnico que levanta el requerimiento y fecha de visita.
- [ ] Puedo agregar ítems desde un catálogo (repuestos, materiales y consumibles de mantenimiento preventivo) o escribir un ítem libre.
- [ ] Puedo editar cantidad y precio unitario de cada ítem, y eliminarlo.
- [ ] Puedo ingresar horas estimadas de mano de obra; la tarifa por hora viene de las variables globales.
- [ ] Puedo ajustar el **C1** (margen de ganancia) de esa oferta entre 1 y 100 %; arranca en el C1 por defecto de Configuración.
- [ ] Subtotal, margen, IVA y total se recalculan al instante al cambiar cualquier valor.
- [ ] No puedo guardar una oferta sin nombre de cliente y al menos un ítem o una hora de mano de obra.
- [ ] Al guardar, la oferta entra a la tabla con estado **Enviada**.

### HU-2 Descargar la oferta en PDF

Como asesor comercial quiero descargar la oferta en PDF para enviársela al cliente.

**Criterios de aceptación**
- [ ] El PDF incluye: encabezado de la empresa, número de oferta, fecha, datos del cliente, tipo de trabajo, tabla de ítems (descripción, cantidad, precio unitario, total), mano de obra, subtotal, IVA, total.
- [ ] Incluye condiciones: validez 30 días, forma de pago 50% anticipo / 50% contra entrega.
- [ ] Montos en pesos colombianos (formato `$ 1.234.567`).
- [ ] Se puede descargar desde el formulario y desde cada fila de la tabla.

### HU-3 Simular el mes comercial

Como jefe comercial quiero simular el flujo de ofertas de un mes para ver cómo se comportan los indicadores.

**Criterios de aceptación**
- [ ] Botón **Iniciar**: avanza un día simulado por cada intervalo de tiempo.
- [ ] Botón **Pausa**: detiene el avance sin borrar datos; Iniciar continúa desde el mismo día.
- [ ] Botón **Reinicio**: vuelve al día 0 y borra las ofertas simuladas.
- [ ] Botones **+1 día** y **+7 días**: avanzan la simulación a mano (con la simulación detenida), para explicar el sistema creando requerimientos entre días.
- [ ] Cada día los técnicos levantan requerimientos aleatorios (cantidad según "requerimientos por día") y cada uno se convierte en una oferta, con tipo según "% preventivo":
  - **Correctivo**: 1–3 repuestos distintos (cantidad 1–2), 4–24 h.
  - **Preventivo**: visita programada de inspección, ajuste y lubricación; 0–3 consumibles (cantidad 1–2), 2–8 h.
- [ ] Las ofertas abiertas se resuelven como **Aceptada** o **Rechazada** según "probabilidad de cierre".
- [ ] Mientras no se decide, la oferta tiene una **etapa** comercial por regla: **Enviada** el día en que se envía y **En negociación** desde el día siguiente. Al decidirse queda **Aprobada** o **Rechazada** (en datos: Aceptada / Rechazada).
- [ ] Al **Reinicio**, las ofertas simuladas del mes que termina se guardan como **mes anterior** (solo el último) para comparar.
- [ ] La simulación se detiene sola al llegar al día 30.
- [ ] Las ofertas creadas a mano también cuentan en los indicadores.
- [ ] Se ve claramente el día actual y si la simulación está corriendo o pausada.

### HU-4 Editar supuestos

Como jefe comercial quiero cambiar los supuestos del negocio y ver el efecto al instante.

**Variables editables (valor por defecto)**
| Variable | Defecto |
|---|---|
| Tarifa hora técnico (COP) | 95.000 |
| C1 por defecto: margen (%) | 25 |
| IVA (%) | 19 |
| Requerimientos por día | 4 |
| Probabilidad de cierre (%) | 35 |
| Mantenimiento preventivo (%) | 50 |
| Velocidad (segundos por día) | 1 |
| Meta mensual mínima (millones COP) | 200 |
| Meta mensual máxima (millones COP) | 300 |

**Criterios de aceptación**
- [ ] Las variables se editan en un modal **Configuración** (botón en la barra superior), no ocupan espacio en el dashboard.
- [ ] Con los valores por defecto, el valor ganado del mes queda en promedio entre $ 200 y 300 millones (facturación típica de una sede de servicio).
- [ ] Al cambiar una variable, los KPIs, gráficas y conclusiones se actualizan sin recargar.
- [ ] Hay un botón para restaurar los valores por defecto.
- [ ] No se aceptan valores negativos; porcentajes entre 0 y 100.

### HU-5 Ver KPIs en tiempo real

**KPIs**
- Ofertas generadas
- Valor total ofertado
- Valor ganado (ofertas aceptadas)
- Tasa de cierre = aceptadas / (aceptadas + rechazadas)
- C1 promedio = promedio simple del C1 (%) de las ofertas; cada oferta puede tener su propio C1 (1–100 %)
- Margen bruto ganado (COP)
- Horas de mano de obra vendidas

**Criterios de aceptación**
- [ ] Los KPIs cambian en cada día simulado y al guardar una oferta manual.
- [ ] Con cero ofertas se muestra `0` o `—`, nunca `NaN`.
- [ ] Cada KPI es una tarjeta con icono, sparkline (valor acumulado día a día del período), variación frente al período anterior, indicador de desempeño (cuando hay una meta o regla) y tooltip con la definición.
- [ ] **Período anterior**: con el período "Mes en curso" se compara contra el mes anterior simulado al mismo día; con "Últimos 7 / 14 días" contra los 7 / 14 días previos del mismo mes (solo si caben completos). Si no hay base, se dice "Sin período anterior".

### HU-6 Ver gráficas dinámicas

- [ ] Línea suavizada: valor ofertado vs valor ganado acumulado por día, en el eje de los 30 días del mes.
- [ ] La meta mensual se muestra como **banda** entre meta mínima y máxima, con la meta mínima como línea roja punteada.
- [ ] Serie de **proyección lineal** del ganado hasta el día 30 (desde el día 5) y serie del **mes anterior** simulado si existe.
- [ ] Las series se pueden ocultar; se puede acercar arrastrando (Ctrl + rueda, pellizco, Shift + arrastre para desplazar) y restablecer.
- [ ] Tooltip con día, valores, conversión y brecha a la meta mínima.
- [ ] Dona: valor por tipo de trabajo (Mantenimiento correctivo vs preventivo).
- [ ] Barras: top 5 ítems más ofertados.
- [ ] Las gráficas se actualizan con la simulación.

### HU-7 Ver la tabla de ofertas

- [ ] Columnas: N°, día, cliente, técnico, tipo, total, etapa, acción (PDF).
- [ ] Filtro por etapa y búsqueda por texto; tipo, técnico y período vienen de los filtros globales.
- [ ] Más recientes arriba.

### HU-8 Exportar reportes

- [ ] **Excel**: hojas *Ofertas*, *Ítems* y *KPIs*.
- [ ] **PDF reporte del mes**: KPIs, tabla de ofertas y conclusiones.
- [ ] Nombre de archivo con fecha, p. ej. `reporte-ofertas-2026-11-25.xlsx`.

### HU-9 Leer conclusiones automáticas

Reglas (cada una muestra un mensaje corto):
- Tasa de cierre < 30% → "Tasa de cierre baja: revisar precios o seguimiento comercial."
- Tasa de cierre ≥ 50% → "Buena tasa de cierre: hay espacio para subir margen."
- Facturación (valor ganado) vs meta mensual editable (defecto $ 200–300 M), desde el día 5; antes del día 30 se proyecta al mes completo → "Facturación proyectada / del mes: $ X, por debajo de / dentro de / por encima de la meta ($ 200–300 M)." Por debajo es alerta.
- Mano de obra > 40% del costo → "Alta carga de mano de obra: revisar capacidad del equipo técnico."
- Sin ofertas → "Inicia la simulación o crea una oferta para ver el análisis."

**Criterios de aceptación**
- [ ] Las conclusiones cambian con los datos.
- [ ] Siempre hay al menos un mensaje.

### HU-10 Diseño

- [ ] Estilo Enterprise SaaS ejecutivo (ver `DESIGN.md`): Inter, fondo #F8FAFC, tarjetas blancas, primario #0057B8, radios de 12 px.
- [ ] Modo claro y oscuro, con el tema guardado.
- [ ] Funciona en móvil (375 px), tablet (1024 px) y escritorio (1440 px).
- [ ] Contraste suficiente para leer (WCAG AA).

### HU-11 Encabezado ejecutivo y navegación

- [ ] Encabezado con logo ficticio, búsqueda universal (Ctrl K) sobre ofertas, clientes y técnicos, fecha y hora local, notificaciones (alertas automáticas), configuración, cambio de tema y perfil de demostración (sin login).
- [ ] Barra de mando con selector de período (mes en curso, últimos 14 o 7 días), filtros globales (tipo, técnico), progreso **DÍA n / 30**, controles de simulación y **Nuevo requerimiento**.
- [ ] Los filtros globales aplican a KPIs, gráficas, paneles y tabla. Conclusiones, notificaciones y exportes usan siempre el mes completo.

### HU-12 Paneles de análisis

Todo sale de las ofertas del estado (simuladas o manuales); nada se inventa.
- [ ] **Funnel comercial**: creadas, en negociación, enviadas (sin respuesta), aprobadas, rechazadas (etapas de HU-3).
- [ ] **Actividad comercial**: mapa de calor de requerimientos levantados por técnico y día.
- [ ] **Ranking de técnicos** por el valor ganado de las ofertas que salen de sus requerimientos, con número de requerimientos y tasa de cierre.
- [ ] **Top clientes por facturación** (valor ganado).
- [ ] **Pronóstico de cierre**: proyección lineal (ganado ÷ días × 30) frente a la banda de meta, más valor abierto y su valor esperado (× tasa de cierre). Se rotula como proyección estadística, no IA; se muestra desde el día 5.
- [ ] **Conclusiones y alertas**: reglas de HU-9 más tendencias: ritmo de ofertas de los últimos 7 días frente a los 7 previos (±25 %), concentración de un cliente (> 35 % del ganado) y valor ganado frente al mes anterior al mismo día.

---

## Fuera de alcance

Login, base de datos, envío por correo, múltiples monedas, edición de ofertas ya guardadas, catálogo administrable desde la UI.
