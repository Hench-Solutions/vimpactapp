import { useLocation } from 'react-router-dom';

const MODULES = {
  '/gatepass/review': { section: 'Gate Pass', title: 'Review Queue' },
  '/users/roles': { section: 'User Management', title: 'Roles & Pages' },
  '/reports/mis': { section: 'Reports', title: 'MIS Reports' },
};

function titleFromPath(pathname) {
  const parts = pathname.split('/').filter(Boolean);
  return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' · ') || 'This module';
}

export default function ComingSoon() {
  const { pathname } = useLocation();
  const meta = MODULES[pathname] || {
    section: 'Module',
    title: titleFromPath(pathname),
  };

  return (
    <div className="coming-soon">
      <div className="coming-soon-card">
        <div className="coming-soon-icon" aria-hidden="true">
          <svg viewBox="0 0 64 64" width="56" height="56" fill="none">
            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
            <path
              d="M32 18v16l10 6"
              stroke="currentColor"
              strokeWidth="2.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="coming-soon-eyebrow">{meta.section}</p>
        <h2>{meta.title}</h2>
        <p className="coming-soon-msg">Coming soon</p>
      </div>
    </div>
  );
}
