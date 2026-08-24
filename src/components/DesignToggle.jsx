import { useEffect, useState } from 'react';

const KEY = 'vimpactapp:visual';

// Review-only control - lets the two design directions be compared live
// without two separate builds. Not part of the shipped product.
export default function DesignToggle() {
  const [visual, setVisual] = useState(() => localStorage.getItem(KEY) || 'charcoal');

  useEffect(() => {
    if (visual === 'green') document.documentElement.setAttribute('data-visual', 'green');
    else document.documentElement.removeAttribute('data-visual');
    localStorage.setItem(KEY, visual);
  }, [visual]);

  return (
    <div className="design-toggle">
      <button
        className={visual === 'charcoal' ? 'active' : ''}
        onClick={() => setVisual('charcoal')}
      >
        Design 1 · Charcoal
      </button>
      <button
        className={visual === 'green' ? 'active' : ''}
        onClick={() => setVisual('green')}
      >
        Design 2 · Green
      </button>
    </div>
  );
}
