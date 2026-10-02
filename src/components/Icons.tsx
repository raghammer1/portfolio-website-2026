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
      width="40"
      height="40"
      viewBox="0 0 44 44"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        className="signature-glyph"
        fill="currentColor"
        fillRule="evenodd"
        d="M3 10h11.4L20 15.6v4.8l-4.5 3.9L23 34h-5.2L11 25H7.3v9H3V10Zm4.3 4.3V21h6.2l2.2-2v-2.3l-2.7-2.4H7.3Z"
      />
      <path
        className="signature-glyph"
        fill="currentColor"
        fillRule="evenodd"
        d="M19.5 34 27.4 8h3.7L39 34h-4.6l-1.9-6.9h-6.7L23.9 34h-4.4ZM27 23h4.3l-2.15-7.3L27 23Z"
      />
      <path
        className="signature-trajectory"
        d="M6 39C21 40 35 30 41 17"
        stroke="currentColor"
        strokeWidth="1.15"
        pathLength="1"
      />
      <path
        className="signature-spark"
        d="m37 2 1.2 3.3L41.5 6.5 38.2 7.7 37 11 35.8 7.7 32.5 6.5 35.8 5.3 37 2Z"
        fill="var(--amber, #d1a569)"
      />
    </svg>
  );
}
