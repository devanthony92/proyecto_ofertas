import { useCallback, useEffect, useRef, useState } from 'react'

export function useSimulacion({ onTick, velocidad, diaMax = 30, diaInicial = 0 }) {
  const [dia, setDia] = useState(diaInicial)
  const [corriendo, setCorriendo] = useState(false)
  const diaRef = useRef(diaInicial)
  const onTickRef = useRef(onTick)

  useEffect(() => {
    onTickRef.current = onTick
  })

  useEffect(() => {
    if (!corriendo) return undefined
    const id = setInterval(() => {
      const nuevo = diaRef.current + 1
      diaRef.current = nuevo
      setDia(nuevo)
      onTickRef.current?.(nuevo)
      if (nuevo >= diaMax) setCorriendo(false)
    }, Math.max(0.05, velocidad) * 1000)
    return () => clearInterval(id)
  }, [corriendo, velocidad, diaMax])

  const iniciar = useCallback(() => {
    if (diaRef.current < diaMax) setCorriendo(true)
  }, [diaMax])
  const pausar = useCallback(() => setCorriendo(false), [])
  const reiniciar = useCallback(() => {
    diaRef.current = 0
    setDia(0)
    setCorriendo(false)
  }, [])

  return { dia, corriendo, iniciar, pausar, reiniciar }
}
