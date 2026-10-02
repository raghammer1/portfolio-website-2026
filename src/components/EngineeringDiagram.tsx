import { useId } from 'react';
import './EngineeringDiagram.css';

function SceneDefinitions({ id }: { id: string }) {
  return (
    <defs>
      <radialGradient id={`${id}-atmosphere`}>
        <stop stopColor="#466e8b" stopOpacity=".18" />
        <stop offset=".5" stopColor="#244258" stopOpacity=".08" />
        <stop offset="1" stopColor="#06090d" stopOpacity="0" />
      </radialGradient>
      <radialGradient id={`${id}-amber-halo`}>
        <stop stopColor="#d1a569" stopOpacity=".18" />
        <stop offset="1" stopColor="#d1a569" stopOpacity="0" />
      </radialGradient>
      <linearGradient
        id={`${id}-ice`}
        gradientUnits="userSpaceOnUse"
        x1="0"
        y1="180"
        x2="560"
        y2="180"
      >
        <stop stopColor="#507c9c" stopOpacity=".1" />
        <stop offset=".38" stopColor="#7aafd4" stopOpacity=".7" />
        <stop offset="1" stopColor="#d6edff" />
      </linearGradient>
      <linearGradient
        id={`${id}-amber`}
        gradientUnits="userSpaceOnUse"
        x1="0"
        y1="180"
        x2="560"
        y2="180"
      >
        <stop stopColor="#f6d3a4" />
        <stop offset=".5" stopColor="#d1a569" />
        <stop offset="1" stopColor="#d1a569" stopOpacity=".1" />
      </linearGradient>
      <linearGradient id={`${id}-top`} x1=".2" y1="0" x2=".7" y2="1">
        <stop stopColor="#345368" stopOpacity=".85" />
        <stop offset=".54" stopColor="#172b3b" stopOpacity=".96" />
        <stop offset="1" stopColor="#0c1823" />
      </linearGradient>
      <linearGradient id={`${id}-left`} x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#233f54" stopOpacity=".9" />
        <stop offset="1" stopColor="#0b1722" />
      </linearGradient>
      <linearGradient id={`${id}-right`} x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#243949" />
        <stop offset="1" stopColor="#0a121b" />
      </linearGradient>
      <radialGradient id={`${id}-nucleus`} cx=".35" cy=".25">
        <stop stopColor="#ffffff" />
        <stop offset=".6" stopColor="#d9e9f4" />
        <stop offset="1" stopColor="#7da4be" />
      </radialGradient>
      <filter id={`${id}-light`} x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="1.8" />
        <feMerge>
          <feMergeNode />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id={`${id}-bloom`} x="-90%" y="-90%" width="280%" height="280%">
        <feGaussianBlur stdDeviation="6" />
      </filter>
    </defs>
  );
}

function ProcessingScene({ id }: { id: string }) {
  const paint = (name: string) => `url(#${id}-${name})`;
  const streams = [76, 123, 170, 217, 264].map((start, index) => ({
    path: `M-18 ${start}H43C121 ${start} 139 ${147 + index * 18} 218 ${147 + index * 18}`,
    start,
  }));
  return (
    <svg className="engineering-scene" viewBox="0 0 560 360" fill="none" aria-hidden="true">
      <SceneDefinitions id={id} />
      <ellipse cx="292" cy="183" rx="251" ry="178" fill={paint('atmosphere')} />
      <path
        d="M79 305 293 229 515 305M130 323 293 265 458 323M293 229v119M174 271 399 271M126 289h322"
        stroke="#b2cee4"
        strokeOpacity=".07"
      />
      <ellipse cx="294" cy="198" rx="148" ry="103" stroke="#b2cee4" strokeOpacity=".07" />
      <g className="engineering-streams" stroke={paint('ice')}>
        {streams.map(({ path, start }, index) => (
          <g key={start}>
            <path d={path} strokeWidth="5" opacity=".2" filter={paint('light')} />
            <path d={path} strokeWidth={index === 2 ? 2 : 1.3} />
            <path d={`M${30 + index * 7} ${start}h30`} stroke="#c0e2fb" strokeWidth="2.2" />
            <circle cx={30 + index * 7} cy={start} r="2.5" fill="#d1eaff" stroke="none" />
          </g>
        ))}
      </g>
      <path d="m294 88 84 50-84 49-84-49Z" fill={paint('top')} />
      <path d="m210 138 84 49v93l-84-50Z" fill={paint('left')} />
      <path d="m294 187 84-49v92l-84 50Z" fill={paint('right')} />
      <path
        d="m294 88 84 50v92l-84 50-84-50v-92Zm-84 50 84 49 84-49m-84 49v93"
        stroke="#bad9ef"
        strokeWidth="1.35"
        strokeLinejoin="round"
        strokeOpacity=".82"
      />
      <path
        d="m232 138 62-36 62 36-62 36Zm-8 20 70 41 70-41m-140 23 70 41 70-41m-140 23 70 41 70-41"
        stroke="#96c6e7"
        strokeOpacity=".24"
      />
      <path
        d="m294 89 83 49-83 49-83-49"
        stroke="#e4f3ff"
        strokeWidth="1.5"
        filter={paint('light')}
      />
      <path
        d="m233 173 7 4v33l-7-4Zm18 11 7 4v33l-7-4Zm18 11 7 4v33l-7-4Z"
        fill="#c2e3fa"
        opacity=".9"
      />
      <path d="m311 210 45-27m-45 42 45-27m-45 42 27-16" stroke="#94bcd5" strokeOpacity=".26" />
      <circle cx="378" cy="183" r="43" fill={paint('amber-halo')} />
      <path
        d="M378 183h163"
        stroke={paint('amber')}
        strokeWidth="6"
        opacity=".3"
        filter={paint('light')}
      />
      <path d="M378 183h163" stroke={paint('amber')} strokeWidth="2" />
      <circle cx="378" cy="183" r="4" fill="#f7dbb4" filter={paint('light')} />
      <path d="m493 178 8 5-8 5" stroke="#e9c596" strokeWidth="1.5" />
      <text className="engineering-label" x="28" y="45">
        INPUTS
      </text>
      <text className="engineering-label engineering-label-amber" x="442" y="157">
        OUTPUT
      </text>
      <text className="engineering-core-label" x="294" y="326" textAnchor="middle">
        POLARS
      </text>
    </svg>
  );
}

function AnalysisScene({ id }: { id: string }) {
  const paint = (name: string) => `url(#${id}-${name})`;
  return (
    <svg className="engineering-scene" viewBox="0 0 560 360" fill="none" aria-hidden="true">
      <SceneDefinitions id={id} />
      <ellipse cx="295" cy="175" rx="255" ry="180" fill={paint('atmosphere')} />
      <path
        d="M83 151C119 48 343 12 465 113S423 333 238 310 19 232 83 151Z"
        stroke="#b2cee4"
        strokeOpacity=".2"
      />
      <path
        d="M62 174C103 40 359-7 493 113S439 355 230 329 2 263 62 174Z"
        stroke="#b2cee4"
        strokeOpacity=".08"
        strokeDasharray="2 9"
      />
      <path
        d="M101 154c55-36 90-24 132 1M169 255c28-13 50-33 71-54"
        stroke={paint('ice')}
        strokeWidth="2"
      />
      <path d="M357 154c34-35 60-38 77-30" stroke="#d7e9f7" strokeWidth="1.6" />
      <path
        d="M357 154c34-35 60-38 77-30"
        stroke="#b2cee4"
        strokeWidth="5"
        opacity=".2"
        filter={paint('light')}
      />
      <path
        d="M466 154c42 86-28 162-158 81"
        stroke="#d1a569"
        strokeOpacity=".45"
        strokeWidth="1.4"
      />
      <path
        d="M472 226c-7 32-34 51-66 52"
        stroke="#e3bb87"
        strokeWidth="2"
        filter={paint('light')}
      />
      <path d="m312 245-4-10 11 2" stroke="#d1a569" strokeWidth="1.4" />
      <circle cx="83" cy="154" r="29" fill="#0b1620" stroke="#88b4d2" strokeOpacity=".4" />
      <rect x="72" y="141" width="18" height="23" rx="2" stroke="#c5e1f5" strokeWidth="1.5" />
      <path d="M77 146h8m-8 6h8m-8 6h5m9-12h4v22H78v-4" stroke="#91bbd8" strokeWidth="1.2" />
      <circle cx="148" cy="265" r="27" fill="#0b1620" stroke="#88b4d2" strokeOpacity=".4" />
      <circle cx="145" cy="262" r="9" stroke="#c5e1f5" strokeWidth="1.6" />
      <path d="m152 269 8 8m-19-15h8m-4-4v8" stroke="#c5e1f5" strokeWidth="1.6" />
      <circle cx="295" cy="174" r="83" stroke="#b2cee4" strokeOpacity=".08" />
      <circle cx="295" cy="174" r="67" stroke="#91b7d4" strokeOpacity=".2" strokeDasharray="2 7" />
      <circle cx="295" cy="174" r="53" stroke="#cde5f7" strokeOpacity=".4" />
      <circle cx="295" cy="174" r="34" fill="#d9eeff" opacity=".35" filter={paint('bloom')} />
      <path
        d="m281 141 28 0 20 19v28l-20 19h-28l-20-19v-28Z"
        fill={paint('nucleus')}
        stroke="#ecf7ff"
        strokeWidth="1.2"
      />
      <path
        d="m282 161 23 13-23 13m23-13h9"
        stroke="#1c3b50"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="282" cy="161" r="3" fill="#1c3b50" />
      <circle cx="282" cy="187" r="3" fill="#1c3b50" />
      <circle cx="305" cy="174" r="3" fill="#1c3b50" />
      <circle cx="465" cy="124" r="63" fill={paint('amber-halo')} />
      <circle cx="465" cy="124" r="34" fill="#181510" stroke="#d1a569" strokeWidth="1.4" />
      <circle cx="465" cy="124" r="40" stroke="#d1a569" strokeOpacity=".13" />
      <circle cx="465" cy="117" r="7" stroke="#f0d0a6" strokeWidth="1.6" />
      <path d="M451 139c1-12 27-12 28 0" stroke="#f0d0a6" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="202" cy="58" r="2.5" fill="#c5e1f5" />
      <circle cx="521" cy="215" r="2" fill="#d1a569" />
      <text className="engineering-label" x="83" y="105" textAnchor="middle">
        CONTEXT
      </text>
      <text className="engineering-label" x="148" y="320" textAnchor="middle">
        RETRIEVAL
      </text>
      <text className="engineering-core-label" x="295" y="269" textAnchor="middle">
        WORKFLOW
      </text>
      <text
        className="engineering-label engineering-label-amber"
        x="465"
        y="65"
        textAnchor="middle"
      >
        HUMAN REVIEW
      </text>
    </svg>
  );
}

function StackPlane({ id, offset, level }: { id: string; offset: number; level: number }) {
  const paint = (name: string) => `url(#${id}-${name})`;
  return (
    <g transform={`translate(0 ${offset})`}>
      <path d="m59 96 174 66v13L59 109Z" fill={paint('left')} />
      <path d="m233 162 160-63v13l-160 63Z" fill={paint('right')} />
      <path
        d="m59 96 160-64 174 67-160 63Z"
        fill={paint('top')}
        stroke="#9bbfd8"
        strokeOpacity=".55"
      />
      <path
        d="m59 96 174 66 160-63m-160 63v13"
        stroke="#c2dff3"
        strokeWidth="1.5"
        strokeOpacity=".85"
      />
      <path
        d="m59 109 174 66 160-63"
        stroke={level === 2 ? '#d1a569' : '#6996b5'}
        strokeOpacity={level === 2 ? '.7' : '.35'}
      />
      <path d="m98 97 121-48 135 52-121 48Z" stroke="#8fb7d3" strokeOpacity=".18" />
      {level === 0 && (
        <g stroke="#9cc4e0" strokeOpacity=".65">
          <path d="m127 94 58-23 34 13-58 23Z" fill="#567c98" fillOpacity=".32" />
          <path d="m172 111 58-23 80 31-58 23Z" fill="#789bb6" fillOpacity=".2" />
          <path d="m197 66 22-9 102 40-22 8Z" fill="#9bc5e2" fillOpacity=".4" />
          <path d="m185 116 31-12m-21 16 45-18m-33 23 45-18" strokeOpacity=".28" />
        </g>
      )}
      {level === 1 && (
        <g>
          <path d="m139 98 53 0m64 0h59m-90-16V68m0 47v19" stroke="#b2cee4" strokeOpacity=".55" />
          <path d="m193 98 32-13 33 13-32 13Z" fill="#91b9d4" fillOpacity=".65" stroke="#d4eaff" />
          <path d="m193 98v8l33 13 32-13v-8m-32 13v8" stroke="#9cc7e4" strokeOpacity=".5" />
          {[139, 315].map((x) => (
            <circle key={x} cx={x} cy="98" r="3" fill="#c5e5fa" />
          ))}
          <circle cx="225" cy="68" r="3" fill="#c5e5fa" />
          <circle cx="225" cy="134" r="3" fill="#d1a569" />
        </g>
      )}
      {level === 2 && (
        <g stroke="#97bfdb" strokeWidth="2">
          {[0, 1, 2, 3, 4].map((row) => (
            <path
              key={row}
              d={`m${135 + row * 23} ${87 + row * 9} 70-28`}
              strokeOpacity={0.26 + row * 0.12}
            />
          ))}
          <path d="m137 105 77 30" stroke="#d1a569" strokeOpacity=".85" />
        </g>
      )}
      <path
        d="m59 96 174 66 160-63"
        stroke="#b2cee4"
        strokeWidth="3"
        opacity=".16"
        filter={paint('light')}
      />
    </g>
  );
}

function StackScene({ id }: { id: string }) {
  const paint = (name: string) => `url(#${id}-${name})`;
  return (
    <svg className="engineering-scene" viewBox="0 0 560 360" fill="none" aria-hidden="true">
      <SceneDefinitions id={id} />
      <ellipse cx="238" cy="186" rx="266" ry="187" fill={paint('atmosphere')} />
      <ellipse cx="237" cy="321" rx="194" ry="30" fill={paint('atmosphere')} />
      <path d="m24 302 208-83 224 87-208 43Z" stroke="#9cc1db" strokeOpacity=".08" />
      <path
        d="M219 32v152M59 96v152m334-149v152"
        stroke="#99bdd7"
        strokeOpacity=".2"
        strokeDasharray="2 5"
      />
      <StackPlane id={id} offset={152} level={2} />
      <StackPlane id={id} offset={76} level={1} />
      <StackPlane id={id} offset={0} level={0} />
      <g stroke="#b2cee4" strokeOpacity=".64" strokeWidth="1.3">
        <path d="M59 109v63m0 13v63M393 112v63m0 13v63M233 175v63m0 13v63" />
      </g>
      {[175, 251].map((y) => (
        <g key={y}>
          <circle cx="233" cy={y} r="3.5" fill="#c9e6fa" filter={paint('light')} />
          <circle cx="393" cy={y - 63} r="2.5" fill="#c9e6fa" />
        </g>
      ))}
      <circle cx="233" cy="327" r="3" fill="#e2bd8d" />
      {[
        { y: 99, label: 'INTERFACE' },
        { y: 175, label: 'APPLICATION' },
        { y: 251, label: 'PERSISTENCE' },
      ].map(({ y, label }) => (
        <g key={label}>
          <path d={`M393 ${y}h17`} stroke="#b2cee4" strokeOpacity=".35" />
          <text className="engineering-layer-label" x="420" y={y + 5}>
            {label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function EngineeringDiagram({ kind }: { kind: string }) {
  const id = useId().replaceAll(':', '');
  const processing = kind === 'python-performance';
  const analysis = kind === 'applied-ai';
  return (
    <div
      className={`engineering-diagram ${processing ? 'processing-diagram' : analysis ? 'ai-diagram' : 'stack-diagram'}`}
      role="img"
      aria-label={
        processing
          ? 'Conceptual Python processing paths converge into a Polars workflow and a streamlined output.'
          : analysis
            ? 'Context and retrieval feed an analytical workflow. Human review forms a feedback loop, with observability across the process.'
            : 'An exploded application architecture connects a React and Redux interface, Node.js REST API, and MongoDB persistence.'
      }
    >
      <div className="engineering-art-caption">
        <span>
          {processing
            ? 'PYTHON PERFORMANCE'
            : analysis
              ? 'INTELLIGENCE, IN CONTEXT'
              : 'ONE CONNECTED SYSTEM'}
        </span>
        <span className="engineering-art-rule" />
        <span className="engineering-art-index">{processing ? '01' : analysis ? '02' : '03'}</span>
      </div>
      {processing ? (
        <ProcessingScene id={id} />
      ) : analysis ? (
        <AnalysisScene id={id} />
      ) : (
        <StackScene id={id} />
      )}
      <div className="engineering-art-key">
        <span className={`engineering-art-signal ${analysis ? 'is-amber' : ''}`} />
        <span>
          {processing
            ? 'An efficient processing path.'
            : analysis
              ? 'Human review stays in the loop.'
              : 'React · Redux / Node.js · REST / MongoDB'}
        </span>
      </div>
    </div>
  );
}
