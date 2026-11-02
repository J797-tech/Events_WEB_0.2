import { useEffect, useState } from 'react';

// Devuelve el valor con retraso: evita llamar a la API en cada tecla
export function useDebounce(valor, ms = 350) {
  const [retrasado, setRetrasado] = useState(valor);
  useEffect(() => {
    const t = setTimeout(() => setRetrasado(valor), ms);
    return () => clearTimeout(t);
  }, [valor, ms]);
  return retrasado;
}
