# Spec 001 — Generador de Ofertas para Ascensores

> Qué debe hacer la app y cómo sabemos que está bien. No describe cómo se construye (ver `plan.md`).

## Problema

Después de una visita técnica, el técnico entrega una lista de equipos, materiales, repuestos y horas de mano de obra. Convertir esa lista en una oferta formal para el cliente es lento y propenso a errores de cálculo. La gerencia, además, no ve de forma simple cuántas ofertas se generan, cuánto valen y cuántas se cierran.

## Usuarios

- **Técnico / asesor comercial**: arma la oferta y la descarga en PDF.
- **Jefe comercial**: mira el dashboard del mes, ajusta supuestos y exporta reportes.

## Principio

**Keep it simple.** Una sola pantalla, sin login, sin backend. Los datos viven en el navegador.

## Marca

Empresa ficticia: **Elevia Ofertas**. No se usan nombres ni logos de empresas reales.

---

## Historias de usuario

### HU-1 Crear una oferta

Como técnico quiero registrar la información de la visita para generar una oferta.

**Criterios de aceptación**
- [ ] Puedo ingresar: cliente (nombre, NIT, dirección, contacto), tipo de trabajo (Instalación nueva / Reparación), nombre del técnico y fecha de visita.
- [ ] Puedo agregar ítems desde un catálogo (equipos, materiales, repuestos) o escribir un ítem libre.
- [ ] Puedo editar cantidad y precio unitario de cada ítem, y eliminarlo.
- [ ] Puedo ingresar horas estimadas de mano de obra; la tarifa por hora viene de las variables globales.
- [ ] Subtotal, margen, IVA y total se recalculan al instante al cambiar cualquier valor.
- [ ] No puedo guardar una oferta sin nombre de cliente y al menos un ítem o una hora de mano de obra.
- [ ] Al guardar, la oferta entra a la tabla con estado **Enviada**.

### HU-2 Descargar la oferta en PDF

Como técnico quiero descargar la oferta en PDF para enviársela al cliente.

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
- [ ] Cada día se generan ofertas aleatorias (cantidad según "visitas por día"), con ítems del catálogo y tipo según "% instalaciones".
- [ ] Las ofertas abiertas se resuelven como **Aceptada** o **Rechazada** según "probabilidad de cierre".
- [ ] La simulación se detiene sola al llegar al día 30.
- [ ] Las ofertas creadas a mano también cuentan en los indicadores.
- [ ] Se ve claramente el día actual y si la simulación está corriendo o pausada.

### HU-4 Editar supuestos

Como jefe comercial quiero cambiar los supuestos del negocio y ver el efecto al instante.

**Variables editables (valor por defecto)**
| Variable | Defecto |
|---|---|
| Tarifa hora técnico (COP) | 95.000 |
| Margen (%) | 25 |
| IVA (%) | 19 |
| Visitas por día | 2 |
| Probabilidad de cierre (%) | 35 |
| Instalaciones nuevas (%) | 1 |
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
- Ticket promedio = valor ofertado / ofertas
- Margen bruto ganado (COP)
- Horas de mano de obra vendidas

**Criterios de aceptación**
- [ ] Los KPIs cambian en cada día simulado y al guardar una oferta manual.
- [ ] Con cero ofertas se muestra `0` o `—`, nunca `NaN`.

### HU-6 Ver gráficas dinámicas

- [ ] Línea: valor ofertado vs valor ganado acumulado por día.
- [ ] Dona: valor por tipo de trabajo (Instalación vs Reparación).
- [ ] Barras: top 5 ítems más ofertados.
- [ ] Las gráficas se actualizan con la simulación.

### HU-7 Ver la tabla de ofertas

- [ ] Columnas: N°, día, cliente, tipo, total, estado, acción (PDF).
- [ ] Filtro por estado y por tipo.
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

- [ ] Estilo industrial moderno, limpio, legible.
- [ ] Funciona en móvil (375 px), tablet y escritorio.
- [ ] Contraste suficiente para leer (WCAG AA).

---

## Fuera de alcance

Login, base de datos, envío por correo, múltiples monedas, edición de ofertas ya guardadas, catálogo administrable desde la UI.
