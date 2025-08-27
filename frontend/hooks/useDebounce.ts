import { useState, useEffect } from 'react';

/**
 * Hook personalizado para implementar debounce em valores
 * Útil para otimizar chamadas de API em campos de busca
 * 
 * @param value - O valor a ser "debounced"
 * @param delay - O tempo de delay em milissegundos
 * @returns O valor com debounce aplicado
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Cria um timer que irá atualizar o valor após o delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpa o timer se o valor mudar antes do delay
    // Isso previne que o valor seja atualizado se o usuário continuar digitando
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;