import { useEffect, useState } from 'react';

const KEY = 'vimpactapp:visual';
const EVENT = 'vimpactapp:visualchange';

export function setVisual(value) {
  localStorage.setItem(KEY, value);
  window.dispatchEvent(new Event(EVENT));
}

export function useVisual() {
  const [visual, setLocal] = useState(() => localStorage.getItem(KEY) || 'charcoal');
  useEffect(() => {
    const onChange = () => setLocal(localStorage.getItem(KEY) || 'charcoal');
    window.addEventListener(EVENT, onChange);
    return () => window.removeEventListener(EVENT, onChange);
  }, []);
  return visual;
}
