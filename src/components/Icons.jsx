/** Stroke icon set — 1.75px, round caps; inherits currentColor. */

function Icon({ size = 18, className, children, title, decorative = true }) {
  return (
    <svg
      className={className ? `icon ${className}` : 'icon'}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={decorative ? true : undefined}
      role={decorative ? undefined : 'img'}
      aria-label={!decorative && title ? title : undefined}
    >
      {children}
    </svg>
  );
}

const stroke = {
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export function MenuIcon(props) {
  return (
    <Icon {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" {...stroke} />
    </Icon>
  );
}

export function BellIcon(props) {
  return (
    <Icon {...props}>
      <path d="M6 9a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" {...stroke} />
      <path d="M10 21a2 2 0 0 0 4 0" {...stroke} />
    </Icon>
  );
}

export function ChevronDownIcon(props) {
  return (
    <Icon size={14} {...props}>
      <path d="M6 9l6 6 6-6" {...stroke} />
    </Icon>
  );
}

export function EyeIcon(props) {
  return (
    <Icon {...props}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" {...stroke} />
      <circle cx="12" cy="12" r="3" {...stroke} />
    </Icon>
  );
}

export function EyeOffIcon(props) {
  return (
    <Icon {...props}>
      <path d="M3 3l18 18" {...stroke} />
      <path d="M10.6 10.6A3 3 0 0 0 13.4 13.4" {...stroke} />
      <path d="M9.9 5.2A10.5 10.5 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-4.1 4.8" {...stroke} />
      <path d="M6.1 6.1A17.4 17.4 0 0 0 2 12s3.5 7 10 7c1.4 0 2.7-.3 3.9-.8" {...stroke} />
    </Icon>
  );
}

export function ArrowRightIcon(props) {
  return (
    <Icon size={16} {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" {...stroke} />
    </Icon>
  );
}

export function SearchIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="11" cy="11" r="6.5" {...stroke} />
      <path d="M16.5 16.5L21 21" {...stroke} />
    </Icon>
  );
}

export function CheckIcon(props) {
  return (
    <Icon {...props}>
      <path d="M5 12.5l4.5 4.5L19 7" {...stroke} />
    </Icon>
  );
}

export function AlertIcon(props) {
  return (
    <Icon {...props}>
      <path d="M12 3.5L21 20H3L12 3.5z" {...stroke} />
      <path d="M12 10v4.5M12 17.5h.01" {...stroke} />
    </Icon>
  );
}

export function CloseIcon(props) {
  return (
    <Icon {...props}>
      <path d="M6 6l12 12M18 6L6 18" {...stroke} />
    </Icon>
  );
}

export function LogoutIcon(props) {
  return (
    <Icon {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" {...stroke} />
      <path d="M16 17l5-5-5-5M21 12H9" {...stroke} />
    </Icon>
  );
}
