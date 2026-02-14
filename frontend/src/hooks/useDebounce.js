import { useState, useEffect } from 'react';

/**
 * Custom hook that debounces a value by a given delay.
 * Useful for search inputs to avoid firing API calls on every keystroke.
 * @param {*} value - The value to debounce
 * @param {number} delay - Delay in milliseconds (default: 300)
 * @returns The debounced value
 */
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
