import { useCallback, useEffect, useMemo, useState } from 'react'
import Header from './components/Header'
import Kpis from './components/Kpis'
import Graficas from './components/Graficas'
import Conclusiones from './components/Conclusiones'
import PanelVariables from './components/PanelVariables'
import TablaOfertas from './components/TablaOfertas'
import FormOferta from './components/FormOferta'
import { useSimulacion } from './hooks/useSimulacion'
import { simularDia } from './lib/simulacion'
import { VARIABLES_DEFECTO, kpis, serieDiaria, valorPorTipo, topItems, conclusiones } from './lib/calculos'
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

export default function App() {
  const [variables, setVariables] = useState(() => ({ ...VARIABLES_DEFECTO, ...leer('elevia.variables.v2', {}) }))
  const [ofertas, setOfertas] = useState(() => {
    const o = leer('elevia.ofertas', [])
    return Array.isArray(o) ? o : []
  })
  const [formAbierto, setFormAbierto] = useState(false)
  const [configAbierta, setConfigAbierta] = useState(false)

  useEffect(() => {
    try { localStorage.setItem('elevia.variables.v2', JSON.stringify(variables)) } catch { /* sin almacenamiento */ }
  }, [variables])
  useEffect(() => {
    try { localStorage.setItem('elevia.ofertas', JSON.stringify(ofertas)) } catch { /* sin almacenamiento */ }
  }, [ofertas])

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
  useEffect(() => {
    try { localStorage.setItem('elevia.dia', JSON.stringify(sim.dia)) } catch { /* sin almacenamiento */ }
  }, [sim.dia])

  const reiniciar = () => {
    sim.reiniciar()
    setOfertas((o) => o.filter((x) => x.origen !== 'simulada'))
  }

  const k = useMemo(() => kpis(ofertas), [ofertas])
  const serie = useMemo(() => serieDiaria(ofertas, sim.dia), [ofertas, sim.dia])
  const porTipo = useMemo(() => valorPorTipo(ofertas), [ofertas])
  const top = useMemo(() => topItems(ofertas, 5), [ofertas])
  const textos = useMemo(() => conclusiones(ofertas, variables, sim.dia), [ofertas, variables, sim.dia])

  const guardar = (oferta, descargar) => {
    setOfertas((o) => [...o, oferta])
    setFormAbierto(false)
    if (descargar) pdfOferta(oferta)
  }
  const siguienteId = ofertas.reduce((m, o) => Math.max(m, o.id), 0) + 1

  return (
    <div className="min-h-screen bg-acero-100">
      <Header
        onNueva={() => setFormAbierto(true)}
        onConfig={() => setConfigAbierta(true)}
        controles={{
          dia: sim.dia,
          diaMax: DIA_MAX,
          corriendo: sim.corriendo,
          onIniciar: sim.iniciar,
          onPausa: sim.pausar,
          onReinicio: reiniciar,
          onAvanzar: sim.avanzar,
        }}
      />
      <main className="mx-auto max-w-[1440px] space-y-4 px-4 py-4 sm:px-6 sm:py-6">
        <Kpis k={k} />
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-4">
            <Graficas serie={serie} porTipo={porTipo} top={top} meta={variables.metaMin * 1e6} />
            <TablaOfertas
              ofertas={ofertas}
              onPdf={pdfOferta}
              onExcel={() => excelReporte(ofertas, k)}
              onReporte={() => pdfReporte(ofertas, k, textos)}
            />
          </div>
          <div className="space-y-4">
            <Conclusiones items={textos} />
          </div>
        </div>
      </main>
      <footer className="mx-auto max-w-[1440px] px-4 pb-6 text-xs text-acero-600 sm:px-6">
        Datos simulados con fines académicos.
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
          dia={sim.dia}
          siguienteId={siguienteId}
          onGuardar={guardar}
          onClose={() => setFormAbierto(false)}
        />
      )}
    </div>
  )
}
