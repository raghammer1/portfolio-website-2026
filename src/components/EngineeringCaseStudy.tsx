import type { CaseStudy } from '../data/content';
import { Arrow } from './Icons';
import { EngineeringDiagram } from './EngineeringDiagram';

const photography: Record<string, string> = {
  'python-performance': '/images/mars-dunes.webp',
  'applied-ai': '/images/earthrise.webp',
  'full-stack': '/images/earth-night.webp',
};

export function EngineeringCaseStudy({ study }: { study: CaseStudy }) {
  return (
    <article className={`case-study case-study-${study.number}`} id={study.id}>
      <div className="case-scene">
        <img
          className="case-photograph"
          src={photography[study.id]}
          alt=""
          loading="lazy"
          decoding="async"
        />
        <div className="case-shade" aria-hidden="true" />
        <div className="case-summary section-shell">
          <div className="case-copy">
            <div className="case-meta mono">
              <span className="case-number">{study.number}</span>
              <span>{study.discipline}</span>
            </div>
            <p className="case-company">
              {study.company}
              <span
                className={study.status === 'In development' ? 'development-status' : 'sr-only'}
              >
                {study.status}
              </span>
            </p>
            <h3>
              {study.title.split('\n').map((line, index) => (
                <span key={line}>
                  {index > 0 && <br />}
                  {line}
                </span>
              ))}
            </h3>
            <p className="case-description">{study.description}</p>
          </div>
        </div>
      </div>
      <details
        className="case-details section-shell"
        onKeyDown={(event) => {
          if (event.key === 'Escape' && event.currentTarget.open) {
            event.currentTarget.open = false;
            event.currentTarget.querySelector('summary')?.focus();
            event.preventDefault();
          }
        }}
      >
        <summary>
          <span className="case-toggle">
            <span className="closed-label">View case study</span>
            <span className="open-label">Close case study</span>
            <Arrow />
          </span>
          <span className="case-outcome">{study.outcome}</span>
        </summary>
        <div className="case-expanded">
          <div className="case-technical">
            <p className="eyebrow mono">THE ENGINEERING / CONCEPTUAL VIEW</p>
            <EngineeringDiagram kind={study.id} />
            <ul className="tags" aria-label="Technologies">
              {study.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          </div>
          <div className="case-analysis">
            {study.details.map((detail) => (
              <div key={detail.title}>
                <h4>{detail.title}</h4>
                <p>{detail.body}</p>
              </div>
            ))}
          </div>
        </div>
      </details>
    </article>
  );
}
