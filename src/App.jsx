import { useCallback, useEffect, useMemo, useState } from 'react'
import { FileSpreadsheet, FileText } from 'lucide-react'
import Header from './components/Header'
import Controles from './components/Controles'
import Kpis from './components/Kpis'
import GraficoAcumulado from './components/GraficoAcumulado'
import Graficas from './components/Graficas'
import Pronostico from './components/Pronostico'
import Embudo from './components/Embudo'
import MapaCalor from './components/MapaCalor'
import { RankingTecnicos, TopClientes } from './components/Rankings'
import Conclusiones from './components/Conclusiones'
import PanelVariables from './components/PanelVariables'
import TablaOfertas from './components/TablaOfertas'
import FormOferta from './components/FormOferta'
import { useSimulacion } from './hooks/useSimulacion'
import { simularDia, TECNICOS } from './lib/simulacion'
import { VARIABLES_DEFECTO, kpis, serieDiaria, valorPorTipo, topItems } from './lib/calculos'
import {
  rangoPeriodo, filtrarOfertas, serieKpi, embudo, mapaCalor, rankingTecnicos, topClientes, pronostico, alertas,
} from './lib/analitica'
// Los exportes cargan jsPDF/ExcelJS solo cuando se usan (bundle inicial más liviano).
const pdfOferta = (o) => import('./lib/exportPdf').then((m) => m.pdfOferta(o))
const pdfReporte = (...a) => import('./lib/exportPdf').then((m) => m.pdfReporte(...a))
const excelReporte = (...a) => import('./lib/exportExcel').then((m) => m.excelReporte(...a))

const DIA_MAX = 30

function leer(clave, defecto) {
  try {
    const v = JSON.parse(localStorage.getItem(clave))
    return v ?? defecto
  } catch {
    return defecto
  }
}
function guardarLocal(clave, valor) {
  try { localStorage.setItem(clave, JSON.stringify(valor)) } catch { /* sin almacenamiento */ }
}

export default function App() {
  const [variables, setVariables] = useState(() => ({ ...VARIABLES_DEFECTO, ...leer('elevia.variables.v2', {}) }))
  const [ofertas, setOfertas] = useState(() => {
    const o = leer('elevia.ofertas', [])
    return Array.isArray(o) ? o : []
  })
  // Mes anterior: al reiniciar se guardan las ofertas simuladas del mes que termina.
  const [mesAnterior, setMesAnterior] = useState(() => leer('elevia.mesAnterior', null))
  const [tema, setTema] = useState(() => (document.documentElement.classList.contains('dark') ? 'oscuro' : 'claro'))
  const [periodo, setPeriodo] = useState('mes')
  const [tipo, setTipo] = useState('')
  const [tecnico, setTecnico] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [formAbierto, setFormAbierto] = useState(false)
  const [configAbierta, setConfigAbierta] = useState(false)

  useEffect(() => guardarLocal('elevia.variables.v2', variables), [variables])
  useEffect(() => guardarLocal('elevia.ofertas', ofertas), [ofertas])
  useEffect(() => guardarLocal('elevia.mesAnterior', mesAnterior), [mesAnterior])
  useEffect(() => {
    document.documentElement.classList.toggle('dark', tema === 'oscuro')
    guardarLocal('elevia.tema', tema)
  }, [tema])

  const onTick = useCallback(
    (dia) => setOfertas((o) => simularDia(o, dia, variables)),
    [variables],
  )
  const sim = useSimulacion({
    onTick,
    velocidad: variables.velocidad,
    diaMax: DIA_MAX,
    diaInicial: Math.min(DIA_MAX, Math.max(0, Number(leer('elevia.dia', 0)) || 0)),
  })
  useEffect(() => guardarLocal('elevia.dia', sim.dia), [sim.dia])

  const reiniciar = () => {
    const simuladas = ofertas.filter((x) => x.origen === 'simulada')
    if (sim.dia > 0 && simuladas.length) setMesAnterior({ dia: sim.dia, ofertas: simuladas })
    sim.reiniciar()
    setOfertas((o) => o.filter((x) => x.origen !== 'simulada'))
  }

  const dia = sim.dia
  const filtros = { tipo, tecnico }
  const filtrado = !!(tipo || tecnico)
  const tecnicos = useMemo(() => [...new Set([...TECNICOS, ...ofertas.map((o) => o.tecnico || 'Sin asignar')])], [ofertas])

  const d = useMemo(() => {
    const rango = rangoPeriodo(periodo, dia)
    const base = filtrarOfertas(ofertas, filtros)
    const enPeriodo = filtrarOfertas(base, rango)
    const anteriorBase = mesAnterior ? filtrarOfertas(mesAnterior.ofertas, filtros) : null
    const previas = rango.anterior
      ? filtrarOfertas(base, rango.anterior)
      : periodo === 'mes' && anteriorBase && dia > 0 ? filtrarOfertas(anteriorBase, { hasta: dia }) : null
    return {
      rango,
      base,
      enPeriodo,
      k: kpis(enPeriodo),
      prev: previas ? kpis(previas) : null,
      comparado: periodo === 'mes' ? `vs mes anterior al día ${dia}` : `vs ${periodo} días previos`,
      serieK: serieKpi(base, rango.desde, rango.hasta),
      serie: serieDiaria(base, dia),
      serieAnterior: anteriorBase ? serieDiaria(anteriorBase, mesAnterior.dia) : [],
      pron: pronostico(base, dia, DIA_MAX),
      funnel: embudo(enPeriodo, dia),
      calor: mapaCalor(base, DIA_MAX, tecnico ? [tecnico] : TECNICOS),
      ranking: rankingTecnicos(enPeriodo),
      clientes: topClientes(enPeriodo, 5),
      porTipo: valorPorTipo(enPeriodo),
      top: topItems(enPeriodo, 5),
    }
  }, [ofertas, periodo, dia, tipo, tecnico, mesAnterior]) // eslint-disable-line react-hooks/exhaustive-deps

  // Conclusiones y exportes: siempre sobre todo el mes, sin filtros.
  const kTotal = useMemo(() => kpis(ofertas), [ofertas])
  const textos = useMemo(() => alertas(ofertas, variables, dia, mesAnterior), [ofertas, variables, dia, mesAnterior])
  const exportarExcel = () => excelReporte(ofertas, kTotal)
  const exportarPdf = () => pdfReporte(ofertas, kTotal, textos)

  const guardar = (oferta, descargar) => {
    setOfertas((o) => [...o, oferta])
    setFormAbierto(false)
    if (descargar) pdfOferta(oferta)
  }
  const siguienteId = ofertas.reduce((m, o) => Math.max(m, o.id), 0) + 1

  const buscar = (texto) => {
    setBusqueda(texto)
    setPeriodo('mes')
    setTipo('')
    setTecnico('')
    requestAnimationFrame(() => document.getElementById('tabla-ofertas')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  const diasPeriodo = Math.max(0, d.rango.hasta - Math.max(1, d.rango.desde) + 1)

  return (
    <div className="min-h-screen bg-fondo text-texto">
      <Header
        ofertas={ofertas}
        alertas={textos}
        tema={tema}
        onTema={() => setTema((t) => (t === 'oscuro' ? 'claro' : 'oscuro'))}
        onConfig={() => setConfigAbierta(true)}
        onBuscar={buscar}
      >
        <Controles
          dia={dia}
          diaMax={DIA_MAX}
          corriendo={sim.corriendo}
          onIniciar={sim.iniciar}
          onPausa={sim.pausar}
          onReinicio={reiniciar}
          onAvanzar={sim.avanzar}
          onNueva={() => setFormAbierto(true)}
          periodo={periodo}
          onPeriodo={setPeriodo}
          tipo={tipo}
          onTipo={setTipo}
          tecnico={tecnico}
          onTecnico={setTecnico}
          tecnicos={tecnicos}
        />
      </Header>

      <main className="mx-auto max-w-[1440px] space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-texto">Panel comercial</h1>
            <p className="mt-1 text-sm text-texto-2">
              Mes simulado · {periodo === 'mes' ? 'mes en curso' : `últimos ${periodo} días`}
              {filtrado && ` · ${[tipo, tecnico].filter(Boolean).join(' · ')}`}
              {' · '}datos simulados con fines académicos
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn" onClick={exportarExcel}>
              <FileSpreadsheet size={16} aria-hidden="true" /> Exportar Excel
            </button>
            <button type="button" className="btn" onClick={exportarPdf}>
              <FileText size={16} aria-hidden="true" /> Reporte PDF
            </button>
          </div>
        </div>

        <Kpis k={d.k} prev={d.prev} serie={d.serieK} comparado={d.comparado} variables={variables} dias={diasPeriodo} />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 md:col-span-2 xl:col-span-1">
            <GraficoAcumulado
              serie={d.serie}
              anterior={d.serieAnterior}
              metaMin={variables.metaMin}
              metaMax={variables.metaMax}
              pronostico={d.pron}
              dia={dia}
              diaMax={DIA_MAX}
              desde={d.rango.desde}
              tema={tema}
            />
          </div>
          <Pronostico p={d.pron} metaMin={variables.metaMin} metaMax={variables.metaMax} dia={dia} diaMax={DIA_MAX} filtrado={filtrado} />
          <div className="min-w-0 xl:order-4"><Conclusiones items={textos} /></div>
          <div className="min-w-0 md:col-span-2 xl:order-3 xl:col-span-1">
            <MapaCalor datos={d.calor} dia={dia} diaMax={DIA_MAX} desde={d.rango.desde} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          <Embudo datos={d.funnel} />
          <RankingTecnicos filas={d.ranking} />
          <div className="min-w-0 md:col-span-2 xl:col-span-1"><TopClientes filas={d.clientes} /></div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Graficas porTipo={d.porTipo} top={d.top} tema={tema} />
        </div>

        <TablaOfertas
          ofertas={d.enPeriodo}
          total={ofertas.length}
          dia={dia}
          busqueda={busqueda}
          onBusqueda={setBusqueda}
          onPdf={pdfOferta}
          onExcel={exportarExcel}
          onReporte={exportarPdf}
        />
      </main>
      <footer className="mx-auto max-w-[1440px] border-t border-borde px-4 py-6 text-xs text-texto-2 sm:px-6">
        Elevia Ofertas es una marca ficticia. Clientes, precios y ofertas son datos simulados con fines académicos.
      </footer>
      <PanelVariables
        abierto={configAbierta}
        variables={variables}
        onChange={setVariables}
        onClose={() => setConfigAbierta(false)}
      />
      {formAbierto && (
        <FormOferta
          variables={variables}
          dia={dia}
          siguienteId={siguienteId}
          onGuardar={guardar}
          onClose={() => setFormAbierto(false)}
        />
      )}
    </div>
  )
}
