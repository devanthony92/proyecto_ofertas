// Contenedor estándar de panel: título, subtítulo opcional, acción a la derecha.
export default function Card({ id, titulo, sub, accion, className = '', cuerpo = 'p-5 pt-4', children }) {
  return (
    <section className={`card h-full min-w-0 ${className}`} aria-labelledby={id}>
      <header className="flex items-start justify-between gap-3 px-5 pt-5">
        <div className="min-w-0">
          <h2 id={id} className="card-titulo">{titulo}</h2>
          {sub && <p className="card-sub mt-0.5">{sub}</p>}
        </div>
        {accion}
      </header>
      <div className={cuerpo}>{children}</div>
    </section>
  )
}

export function Vacio({ children = 'Sin datos todavía. Inicia la simulación o crea un requerimiento.' }) {
  return <p className="grid min-h-32 place-items-center px-4 text-center text-sm text-texto-2">{children}</p>
}
