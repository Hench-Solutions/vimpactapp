// Client-side role → sidebar menu until the API serves menus.
const MENUS = {
  Admin: [
    { pageId: "dash", section: "Dashboard", pageUrl: "/dashboard", items: [] },
    {
      pageId: "gatepass",
      section: "Gate Pass",
      items: [
        {
          pageId: "gp-review",
          pageTitle: "Review Queue",
          pageUrl: "/gatepass/review",
        },
        {
          pageId: "gp-all",
          pageTitle: "All Entries",
          pageUrl: "/gatepass/all",
        },
      ],
    },
    {
      pageId: "users",
      section: "User Management",
      items: [
        { pageId: "users-list", pageTitle: "Users", pageUrl: "/users" },
        {
          pageId: "roles",
          pageTitle: "Roles & Pages",
          pageUrl: "/users/roles",
        },
      ],
    },
    {
      pageId: "dispatch",
      section: "Dispatch",
      items: [
        {
          pageId: "labels",
          pageTitle: "Label Printing",
          pageUrl: "/dispatch/labels",
        },
      ],
    },
    {
      pageId: "reports",
      section: "Reports",
      items: [
        { pageId: "mis", pageTitle: "MIS Reports", pageUrl: "/reports/mis" },
      ],
    },
  ],
  OfficeStaff: [
    { pageId: "dash", section: "Dashboard", pageUrl: "/dashboard", items: [] },
    {
      pageId: "gatepass",
      section: "Gate Pass",
      items: [
        {
          pageId: "gp-review",
          pageTitle: "Review Queue",
          pageUrl: "/gatepass/review",
        },
        {
          pageId: "gp-all",
          pageTitle: "All Entries",
          pageUrl: "/gatepass/all",
        },
      ],
    },
    {
      pageId: "dispatch",
      section: "Dispatch",
      items: [
        {
          pageId: "labels",
          pageTitle: "Label Printing",
          pageUrl: "/dispatch/labels",
        },
      ],
    },
  ],
  // Despatch: packing/dispatch staff who only print box labels.
  Despatch: [
    {
      pageId: "dispatch",
      section: "Dispatch",
      items: [
        {
          pageId: "labels",
          pageTitle: "Label Printing",
          pageUrl: "/dispatch/labels",
        },
      ],
    },
  ],
  Guard: [
    { pageId: "dash", section: "Dashboard", pageUrl: "/dashboard", items: [] },
  ],
};

// Pages each role may open (path prefixes). Admin may open everything.
// Keeps a user from reaching a page by typing its URL when it isn't in their menu.
const ACCESS = {
  OfficeStaff: ["/dashboard", "/gatepass", "/dispatch"],
  Despatch: ["/dispatch"],
  Guard: ["/dashboard"],
};

const HOME = { Despatch: "/dispatch/labels" };

export function getMenuForRole(role) {
  return MENUS[role] || MENUS.Guard;
}

/** Where a role lands after login, or when it opens a page it can't use. */
export function homeForRole(role) {
  return HOME[role] || "/dashboard";
}

export function canAccess(role, pathname) {
  if (role === "Admin") return true;
  const allowed = ACCESS[role] || ACCESS.Guard;
  return allowed.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
