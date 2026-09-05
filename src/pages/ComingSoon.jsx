import { useLocation } from 'react-router-dom';

const ROADMAP = {
  '/gatepass/review': {
    eyebrow: 'Gate Pass',
    title: 'Review Queue',
    blurb:
      'A focused inbox for gate passes waiting on OCR checks, voucher tagging, and office sign-off.',
    planned: [
      'Prioritized queue with status and age',
      'Side-by-side document preview + field edit',
      'Assign, approve, or send back in one pass',
    ],
  },
  '/users/roles': {
    eyebrow: 'User Management',
    title: 'Roles & Pages',
    blurb:
      'Map which roles can open which modules — the same shape the sidebar already mirrors today.',
    planned: [
      'Role → page matrix with live preview',
      'Guard vs office permission boundaries',
      'Audit of who changed access last',
    ],
  },
  '/reports/mis': {
    eyebrow: 'Reports',
    title: 'MIS Reports',
    blurb:
      'Operational summaries for gate throughput, pending reviews, and reconciliation trends.',
    planned: [
      'Date-range filters and export',
      'Gate / role breakdowns',
      'Saved views for recurring MIS pulls',
    ],
  },
};

function titleFromPath(pathname) {
  const parts = pathname.split('/').filter(Boolean);
  return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' · ') || 'This module';
}

export default function ComingSoon() {
  const { pathname } = useLocation();
  const meta = ROADMAP[pathname] || {
    eyebrow: 'Roadmap',
    title: titleFromPath(pathname),
    blurb: 'This route is reserved in navigation so the workspace shell can be reviewed end-to-end.',
    planned: [
      'Screen layout signed off with the rest of the app',
      'API wiring once the module is prioritized',
      'Role-aware access matching the sidebar',
    ],
  };

  return (
    <div className="coming-soon">
      <div className="coming-soon-hero">
        <span className="coming-soon-badge">In design</span>
        <p className="coming-soon-eyebrow">{meta.eyebrow}</p>
        <h2>{meta.title}</h2>
        <p className="coming-soon-blurb">{meta.blurb}</p>
      </div>

      <div className="coming-soon-body">
        <h3>What&apos;s planned</h3>
        <ul className="coming-soon-list">
          {meta.planned.map((item) => (
            <li key={item}>
              <span className="coming-soon-tick" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
        <p className="coming-soon-foot">
          Route <code>{pathname}</code> is live in the nav — content lands here when this module is
          built.
        </p>
      </div>
    </div>
  );
}
