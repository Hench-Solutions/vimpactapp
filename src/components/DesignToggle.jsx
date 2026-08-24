import { useEffect } from 'react';
import { useVisual, setVisual } from '../lib/useVisual';

// Review-only control - lets the two design directions be compared live
// without two separate builds. Not part of the shipped product.
export default function DesignToggle() {
  const visual = useVisual();

  useEffect(() => {
    if (visual === 'green') document.documentElement.setAttribute('data-visual', 'green');
    else document.documentElement.removeAttribute('data-visual');
  }, [visual]);

  return (
    <div className="design-toggle">
      <button className={visual === 'charcoal' ? 'active' : ''} onClick={() => setVisual('charcoal')}>
        Design 1 · Classic
      </button>
      <button className={visual === 'green' ? 'active' : ''} onClick={() => setVisual('green')}>
        Design 2 · Modern
      </button>
    </div>
  );
}
