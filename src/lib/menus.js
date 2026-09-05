// Client-side role → sidebar menu until the API serves menus.
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
