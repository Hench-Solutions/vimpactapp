import { useEffect } from 'react';
import { useVisual, setVisual } from '../lib/useVisual';

// Review-only control - lets the two design directions be compared live
// without two separate builds. Not part of the shipped product.
export default function DesignToggle({ compact = false, floating = false }) {
  const visual = useVisual();

  useEffect(() => {
    if (visual === 'green') document.documentElement.setAttribute('data-visual', 'green');
    else document.documentElement.removeAttribute('data-visual');
  }, [visual]);

  return (
    <div
      className={`design-toggle ${compact ? 'compact' : ''} ${floating ? 'floating' : ''}`}
      role="group"
      aria-label="Visual theme"
    >
      <button
        type="button"
        className={visual === 'charcoal' ? 'active' : ''}
        onClick={() => setVisual('charcoal')}
      >
        {compact ? 'Classic' : 'Classic'}
      </button>
      <button
        type="button"
        className={visual === 'green' ? 'active' : ''}
        onClick={() => setVisual('green')}
      >
        {compact ? 'Modern' : 'Modern'}
      </button>
    </div>
  );
}
