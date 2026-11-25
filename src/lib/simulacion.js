import catalogo from '../data/catalogo.json'

export const CLIENTES = [
  'Edificio Torre Alameda',
  'Conjunto Residencial Los Cerezos',
  'Centro Comercial Plaza Norte',
  'Edificio Palma Real',
  'Hospital San Rafael del Valle',
  'Conjunto Parques de la Colina',
  'Edificio Bahía Azul',
  'Torre Empresarial Meridiano',
  'Hotel Casa Verde',
  'Conjunto Residencial Altos del Río',
  'Edificio Santa Lucía',
  'Clínica Nuestra Señora del Carmen',
  'Edificio Mirador del Parque',
  'Centro Empresarial Andino',
  'Conjunto Residencial Villa Serena',
]

export const TECNICOS = ['Carlos Mejía', 'Andrea Londoño', 'Julián Restrepo', 'Marcela Ortiz']

const porCategoria = (c) => catalogo.filter((i) => i.categoria === c)

// Devuelve un array nuevo. El id de las ofertas nuevas = máximo id existente + 1.
export function simularDia(ofertas, dia, variables, rng = Math.random) {
  const randInt = (min, max) => min + Math.floor(rng() * (max - min + 1))
  const pick = (arr) => arr[Math.floor(rng() * arr.length)]
  // n ítems distintos del arreglo
  const pickN = (arr, n) => {
    const resto = [...arr]
    return Array.from({ length: Math.min(n, arr.length) }, () => resto.splice(Math.floor(rng() * resto.length), 1)[0])
  }
  const prob = variables.probCierre / 100

  const resultado = ofertas.map((o) =>
    o.estado === 'Enviada' && dia - o.dia >= 2
      ? { ...o, estado: rng() < prob ? 'Aceptada' : 'Rechazada' }
      : o,
  )

  let id = ofertas.reduce((m, o) => Math.max(m, o.id), 0) + 1
  const cantidad = Math.max(0, variables.visitasDia + randInt(-1, 1))
  const fecha = new Date()
  fecha.setDate(fecha.getDate() + dia)

  for (let n = 0; n < cantidad; n++, id++) {
    const instalacion = rng() < variables.pctInstalacion / 100
    const elegidos = instalacion
      ? [pick(porCategoria('Equipo')), ...pickN(porCategoria('Material'), randInt(3, 5))]
      : pickN(porCategoria('Repuesto'), randInt(1, 3))
    const items = elegidos.map((c) => ({
      descripcion: c.descripcion,
      cantidad: c.categoria === 'Equipo' ? 1 : randInt(1, instalacion ? 10 : 2),
      precio: c.precio,
    }))
    resultado.push({
      id,
      numero: 'OF-' + String(id).padStart(4, '0'),
      dia,
      origen: 'simulada',
      cliente: {
        nombre: pick(CLIENTES),
        nit: `9${String(randInt(0, 99999999)).padStart(8, '0')}-${randInt(0, 9)}`,
        direccion: `Calle ${randInt(1, 120)} # ${randInt(1, 90)}-${randInt(1, 99)}`,
        contacto: 'Administración',
      },
      tipo: instalacion ? 'Instalación' : 'Reparación',
      tecnico: pick(TECNICOS),
      fechaVisita: fecha.toISOString().slice(0, 10),
      items,
      horas: instalacion ? randInt(40, 120) : randInt(4, 24),
      tarifaHora: variables.tarifaHora,
      // C1 varía por oferta según condiciones especiales: ±10 puntos sobre el defecto, entre 1 y 100
      margen: Math.min(100, Math.max(1, variables.margen + randInt(-10, 10))),
      iva: variables.iva,
      estado: 'Enviada',
    })
  }
  return resultado
}

// Etapa comercial de una oferta en el día `dia` de la simulación (regla, no estado guardado).
// Una oferta Enviada se decide a los 2 días (ver simularDia); mientras tanto:
//  - el día en que se envía queda "Pendiente" (el cliente aún no responde),
//  - desde el día siguiente queda "En negociación" (el cliente la está revisando).
export function etapaOferta(oferta, dia) {
  if (oferta.estado === 'Aceptada') return 'Ganada'
  if (oferta.estado === 'Rechazada') return 'Perdida'
  return dia - oferta.dia >= 1 ? 'En negociación' : 'Pendiente'
}
