/**
 * useDebounce.ts
 *
 * Evita chamadas excessivas ao Firebase quando o usuário
 * digita em campos de filtro ou busca.
 *
 * Exemplo: sem debounce, digitar "ali" faz 3 chamadas ao Firebase.
 * Com debounce de 400ms, faz apenas 1 após parar de digitar.
 */
import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delayMs: number = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}
