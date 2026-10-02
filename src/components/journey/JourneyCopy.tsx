import type { ReactNode } from 'react';
import { journeyChapters } from '../../data/journey';
import { useJourney } from './JourneyContext';
import { Arrow } from '../Icons';

export function JourneyCopy({ at, children }: { at: string; children: ReactNode }) {
  const { index, signals, completed } = useJourney();
  const chapter = index === null ? null : journeyChapters[index];
  if (!chapter || chapter.id !== at) return children;
  const Heading = chapter.level;
  const signal = signals[chapter.id];

  function takeControls() {
    if (!chapter || !('selector' in chapter)) return;
    const control = document.querySelector<HTMLElement>(`#${chapter.id} ${chapter.selector}`);
    control?.focus({ preventScroll: true });
    const preview = control?.closest('.personal-work-preview, .transport-preview, .movie-preview');
    const headerHeight =
      document.querySelector('.site-header')?.getBoundingClientRect().height ?? 100;
    if (preview)
      window.scrollTo({
        top: preview.getBoundingClientRect().top + window.scrollY - headerHeight - 16,
        behavior: 'instant',
      });
  }

  return (
    <div className="journey-story" data-journey-narrative={chapter.id}>
      <p className="journey-eyebrow">
        <span />
        {chapter.eyebrow}
      </p>
      <Heading
        id={chapter.headingId}
        className="journey-title"
        tabIndex={-1}
        aria-describedby="journey-controls-hint"
      >
        {chapter.title.split('\n').map((line, i) => (
          <span key={line}>
            {i > 0 && <br />}
            {line}
          </span>
        ))}
      </Heading>
      <p className="journey-body">{chapter.body}</p>
      <button
        className="journey-skip-controls"
        type="button"
        onClick={() => document.querySelector<HTMLButtonElement>('.journey-next')?.focus()}
      >
        Skip to flight controls
      </button>
      <div
        className={`journey-note${signal ? ' has-discovery' : ''}`}
        aria-live="polite"
        aria-atomic="true"
      >
        <span className="journey-note-marker" aria-hidden="true">
          {signal ? '↳' : '—'}
        </span>
        <p>{signal || chapter.note}</p>
      </div>
      {'challenge' in chapter && (
        <div className="journey-challenge" data-complete={completed.includes(chapter.id)}>
          <span className="journey-challenge-icon" aria-hidden="true">
            {completed.includes(chapter.id) ? '✓' : '◇'}
          </span>
          <div>
            <span className="journey-challenge-label">
              {completed.includes(chapter.id) ? 'DISCOVERY LOGGED' : 'OPTIONAL EXPERIMENT'}
            </span>
            <span className="journey-challenge-title">{chapter.challenge}</span>
          </div>
          <button type="button" className="journey-take-controls" onClick={takeControls}>
            {chapter.action}
            <Arrow />
          </button>
        </div>
      )}
    </div>
  );
}

export function JourneyFlightLog() {
  const { index, completed, goTo } = useJourney();
  if (index === null || journeyChapters[index].id !== 'contact') return null;
  return (
    <aside className="journey-completion" aria-label="Your discoveries">
      <div className="journey-flight-log">
        <p className="journey-log-title">
          YOUR FLIGHT LOG <span>Always room for another experiment.</span>
        </p>
        {journeyChapters.map(
          (stop, stopIndex) =>
            'challenge' in stop && (
              <button
                key={stop.id}
                type="button"
                data-complete={completed.includes(stop.id)}
                onClick={() => goTo(stopIndex)}
              >
                <span aria-hidden="true">{completed.includes(stop.id) ? '✓' : '◇'}</span>
                <span>
                  {stop.challenge}
                  <small>
                    {completed.includes(stop.id) ? 'Discovered · revisit' : 'Try it out'}
                  </small>
                </span>
                <Arrow />
              </button>
            ),
        )}
      </div>
      <button className="journey-restart" type="button" onClick={() => goTo(0)}>
        ↺ Restart flight
      </button>
    </aside>
  );
}

export function JourneyInvitation() {
  const { start } = useJourney();
  return (
    <>
      <button type="button" id="journey-invitation" className="journey-invitation" onClick={start}>
        <svg viewBox="0 0 52 52" aria-hidden="true" focusable="false">
          <circle cx="26" cy="26" r="22" />
          <path d="M8 39C18 42 38 24 41 9M33 11l8-2-1 9" />
          <circle className="invitation-origin" cx="8" cy="39" r="2" />
        </svg>
        <span>
          <span className="journey-invitation-label">Let me show you around.</span>
          <span className="journey-invitation-caption">A GUIDED FLIGHT · YOUR PACE</span>
        </span>
      </button>
      <noscript>
        <style>{'.journey-invitation { display: none; }'}</style>
      </noscript>
    </>
  );
}
