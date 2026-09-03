// UI-only stand-in for what will eventually come from the CareAi-style
// User / Page / Group tables (Modules -> Pages -> Role-Page mapping).
// Nothing here touches a database - it exists purely so the Sidebar can
// be shown actually changing shape per role before that wiring exists.
// Keys match the Role values the API returns (Users module) - "Guard"
// never actually reaches here since guards can't log into vimpactapp.

const MENUS = {
  Admin: [
    { pageId: 'dash', section: 'Dashboard', pageUrl: '/dashboard', items: [] },
    {
      pageId: 'gatepass',
      section: 'Gate Pass',
      items: [
        { pageId: 'gp-review', pageTitle: 'Review Queue', pageUrl: '/gatepass/review' },
        { pageId: 'gp-all', pageTitle: 'All Entries', pageUrl: '/gatepass/all' },
      ],
    },
    {
      pageId: 'users',
      section: 'User Management',
      items: [
        { pageId: 'users-list', pageTitle: 'Users', pageUrl: '/users' },
        { pageId: 'roles', pageTitle: 'Roles & Pages', pageUrl: '/users/roles' },
      ],
    },
    {
      pageId: 'reports',
      section: 'Reports',
      items: [{ pageId: 'mis', pageTitle: 'MIS Reports', pageUrl: '/reports/mis' }],
    },
  ],
  OfficeStaff: [
    { pageId: 'dash', section: 'Dashboard', pageUrl: '/dashboard', items: [] },
    {
      pageId: 'gatepass',
      section: 'Gate Pass',
      items: [
        { pageId: 'gp-review', pageTitle: 'Review Queue', pageUrl: '/gatepass/review' },
        { pageId: 'gp-all', pageTitle: 'All Entries', pageUrl: '/gatepass/all' },
      ],
    },
  ],
  Guard: [{ pageId: 'dash', section: 'Dashboard', pageUrl: '/dashboard', items: [] }],
};

export function getMenuForRole(role) {
  return MENUS[role] || MENUS.Guard;
}
