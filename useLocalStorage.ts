"use client"; // This is a client component

import { useState } from "react";

export function useLocalStorage<T extends string = string>(
  key: string
): [T | undefined, (value: T | undefined) => void];

export function useLocalStorage<T extends string = string>(
  key: string,
  initialValue: T
): [T, (value: T) => void];

export function useLocalStorage<T extends string = string>(
  key: string,
  initialValue?: T
): [T | undefined, (value: T | undefined) => void] | [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T | undefined>(
    () => (typeof window !== 'undefined' ? localStorage.getItem(key) : false || initialValue) as T | undefined
  );

  const setValue = (value: T | undefined) => {
    setStoredValue(value);

    if (typeof window !== 'undefined') {
      if (value === undefined) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, value);
      }
    }
  };

  return [storedValue, setValue];
}
