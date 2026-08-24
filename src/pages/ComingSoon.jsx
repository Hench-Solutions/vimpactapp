import { useLocation } from 'react-router-dom';

// Every sidebar link needs somewhere to land for the UI review to feel
// real when clicking around - this is that somewhere, not a real page.
export default function ComingSoon() {
  const location = useLocation();
  return (
    <div className="placeholder-page">
      <h2>Coming soon</h2>
      <p>
        <code>{location.pathname}</code> isn't built yet - this route exists so the sidebar
        navigation can be reviewed end-to-end before any page content or API wiring starts.
      </p>
    </div>
  );
}
