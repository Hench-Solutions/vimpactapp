export function TableSkeleton({ columns = 6, rows = 5 }) {
  return (
    <div className="table-wrap table-desktop" aria-busy="true" aria-label="Loading">
      <table className="data-table data-table-skeleton">
        <thead>
          <tr>
            {Array.from({ length: columns }, (_, i) => (
              <th key={i}><span className="skel skel-th" /></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, r) => (
            <tr key={r}>
              {Array.from({ length: columns }, (_, c) => (
                <td key={c}><span className={`skel skel-td ${c === 0 ? 'short' : ''}`} /></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function MobileCardSkeleton({ cards = 3 }) {
  return (
    <div className="mobile-card-list" aria-busy="true" aria-label="Loading">
      {Array.from({ length: cards }, (_, i) => (
        <article className="mobile-card mobile-card-skel" key={i}>
          <span className="skel skel-td" style={{ width: '40%' }} />
          <span className="skel skel-td" style={{ width: '70%' }} />
          <span className="skel skel-td short" />
        </article>
      ))}
    </div>
  );
}

export function PaneLoader({ label = 'Loading…' }) {
  return (
    <div className="pane-loader" role="status" aria-live="polite">
      <span className="brand-spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}
