import { useEffect, useState } from 'react';

const KEY = 'vimpactapp:visual';
const EVENT = 'vimpactapp:visualchange';

// Shared across components without a full context - DesignToggle writes
// to localStorage + fires this event, anything else (Login) can react
// live instead of only picking it up on next mount.
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
