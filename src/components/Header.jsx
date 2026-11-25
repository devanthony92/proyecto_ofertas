import { Plus, Settings } from 'lucide-react'
import Controles from './Controles'

export default function Header({ controles, onNueva, onConfig }) {
  return (
    <header className="bg-acero-800 text-white">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-x-8 gap-y-3 px-4 py-3 sm:px-6">
        <div>
          <h1 className="font-display text-2xl font-semibold leading-tight">Elevia Ofertas</h1>
          <p className="text-xs text-acero-300">Datos simulados con fines académicos</p>
        </div>
        <Controles {...controles} />
        <div className="flex gap-2">
          <button
            type="button"
            className="btn"
            style={{ background: 'transparent', borderColor: 'var(--color-acero-500)', color: 'white' }}
            onClick={onConfig}
          >
            <Settings size={18} aria-hidden="true" />
            Configuración
          </button>
          <button
            type="button"
            className="btn"
            style={{ background: 'white', borderColor: 'white' }}
            onClick={onNueva}
          >
            <Plus size={18} aria-hidden="true" />
            Nuevo requerimiento
          </button>
        </div>
      </div>
    </header>
  )
}
