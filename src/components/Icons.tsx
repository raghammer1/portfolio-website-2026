export function Arrow({
  diagonal = false,
  className = '',
}: {
  diagonal?: boolean;
  className?: string;
}) {
  return (
    <svg
      className={`arrow-icon ${className}`}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d={diagonal ? 'M6 18 18 6M6 6h12v12' : 'M4 12h15m-6-6 6 6-6 6'}
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ObservatoryMark() {
  return (
    <svg
      className="observatory-mark"
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <path d="M24.5 20.7a10.5 10.5 0 1 1-10-15.2" stroke="currentColor" strokeWidth="1.3" />
      <ellipse
        cx="16"
        cy="16"
        rx="16"
        ry="5.4"
        transform="rotate(-35 16 16)"
        stroke="currentColor"
        strokeWidth="1"
      />
      <circle cx="24" cy="7" r="2" fill="var(--amber)" />
    </svg>
  );
}
