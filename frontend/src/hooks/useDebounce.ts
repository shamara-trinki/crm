// E:\SVG\crm\frontend\src\hooks\useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set a timer to update the debounced value after delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: if value changes before delay ends, cancel previous timer
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]); // Only re-run if value or delay changes

  return debouncedValue;
}

// How it works:
// 1. User types "a" → timer starts (500ms)
// 2. User types "b" after 100ms → previous timer cancelled, new timer starts
// 3. User stops typing → after 500ms, value updates