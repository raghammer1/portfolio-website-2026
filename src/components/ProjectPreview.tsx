export function ProjectPreview({ kind }: { kind: 'sudoku' | 'transport' | 'movies' }) {
  if (kind === 'sudoku') {
    const digits = [
      '5',
      '',
      '',
      '',
      '7',
      '',
      '',
      '',
      '',
      '6',
      '',
      '',
      '1',
      '9',
      '5',
      '',
      '',
      '',
      '',
      '9',
      '8',
      '',
      '',
      '',
      '',
      '6',
      '',
      '8',
      '',
      '',
      '',
      '6',
      '',
      '',
      '',
      '3',
      '4',
      '',
      '',
      '8',
      '',
      '3',
      '',
      '',
      '1',
      '7',
      '',
      '',
      '',
      '2',
      '',
      '',
      '',
      '6',
      '',
      '6',
      '',
      '',
      '',
      '',
      '2',
      '8',
      '',
      '',
      '',
      '',
      '4',
      '1',
      '9',
      '',
      '',
      '5',
      '',
      '',
      '',
      '',
      '8',
      '',
      '',
      '7',
      '9',
    ];
    return (
      <div className="project-art sudoku-art" aria-hidden="true">
        <div className="sudoku-grid">
          {digits.map((n, i) => (
            <span className={i === 40 ? 'sudoku-active' : ''} key={i}>
              {n || (i === 40 ? '5' : '')}
            </span>
          ))}
        </div>
        <span className="art-caption">CONSTRAINTS → POSSIBILITIES</span>
        <span className="art-index">01</span>
      </div>
    );
  }
  if (kind === 'transport') {
    return (
      <div className="project-art transport-art" aria-hidden="true">
        <svg viewBox="0 0 400 250" fill="none">
          <path
            d="M94 63v148M306 63v148"
            stroke="#7c96a8"
            strokeOpacity=".35"
            strokeDasharray="3 5"
          />
          <circle cx="94" cy="48" r="14" fill="#101e29" stroke="#adc9dd" />
          <circle cx="306" cy="48" r="14" fill="#101e29" stroke="#adc9dd" />
          <circle cx="94" cy="48" r="3" fill="#adc9dd" />
          <circle cx="306" cy="48" r="3" fill="#adc9dd" />
          <path d="m95 82 209 32m-7-6 7 6-8 4M305 129 96 158m7-6-7 6 8 3" stroke="#a4c5db" />
          <path d="m95 176 102 16" stroke="#d1a569" strokeDasharray="4 4" />
          <path d="m198 188 8 8m-8 0 8-8" stroke="#d1a569" />
          <path d="m95 202 209 28m-7-5 7 5-8 4" stroke="#a4c5db" strokeOpacity=".55" />
          <text x="74" y="20">
            SENDER
          </text>
          <text x="278" y="20">
            RECEIVER
          </text>
          <text x="186" y="88">
            DATA
          </text>
          <text x="188" y="132">
            ACK
          </text>
          <text x="227" y="194" className="packet-lost">
            LOSS / RETRY
          </text>
        </svg>
        <span className="art-caption">RELIABILITY IN AN UNRELIABLE NETWORK</span>
        <span className="art-index">02</span>
      </div>
    );
  }
  return (
    <div className="project-art movies-art" aria-hidden="true">
      <svg viewBox="0 0 400 250" fill="none">
        <defs>
          <linearGradient id="movie-glow" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#7898ac" />
            <stop offset="1" stopColor="#14202c" />
          </linearGradient>
        </defs>
        <path
          d="M103 117c60 0 38-55 110-55m-110 55h110m-110 0c60 0 38 55 110 55"
          stroke="#809daf"
          strokeOpacity=".4"
        />
        <rect x="58" y="75" width="57" height="83" rx="2" fill="#152431" stroke="#84a6be" />
        <circle cx="87" cy="110" r="15" stroke="#aecde1" strokeOpacity=".6" />
        <path d="m72 147 14-27 19 27" fill="#aecde1" opacity=".3" />
        {[38, 94, 150].map((y, i) => (
          <g key={y}>
            <rect
              x="213"
              y={y}
              width="134"
              height="45"
              rx="2"
              fill="#101b25"
              stroke="#7694aa"
              strokeOpacity=".4"
            />
            <rect
              x="222"
              y={y + 8}
              width="21"
              height="29"
              fill="url(#movie-glow)"
              opacity={0.8 - i * 0.15}
            />
            <path
              d={`M254 ${y + 17}h64m-64 10h${45 - i * 9}`}
              stroke="#8299a9"
              strokeOpacity=".4"
            />
            <circle cx="331" cy={y + 23} r="2" fill={i === 0 ? '#d1a569' : '#adc9dd'} />
          </g>
        ))}
        <text x="60" y="193">
          ONE FILM.
        </text>
        <text x="213" y="220">
          RELATED POSSIBILITIES.
        </text>
      </svg>
      <span className="art-caption">CONTENT → SIMILARITY → DISCOVERY</span>
      <span className="art-index">03</span>
    </div>
  );
}
