import { useId, useRef, useState } from 'react';
import { journeyChapters } from '../../data/journey';
import './FlightPlan.css';

type FlightPlanProps = {
  index: number;
  onSelect: (index: number) => void;
  completed: readonly string[];
};

const chapterContext: Record<string, string> = {
  top: 'Meet Raghav',
  'python-performance': 'Commonwealth Bank',
  'applied-ai': 'In development',
  'full-stack': 'Axiom Technologies',
  'sudoku-preview': 'Sudoku',
  'transport-preview': 'Reliable transport',
  'movies-preview': 'Movie recommendations',
  experience: 'Career & experience',
  about: 'Curiosity & science',
  contact: 'Open channel',
};

export function FlightPlan({ index, onSelect, completed }: FlightPlanProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const restoreFocus = useRef(true);
  const backdropPress = useRef(false);
  const [open, setOpen] = useState(false);
  const id = useId();
  const experiments = journeyChapters.filter((chapter) => 'action' in chapter);
  const completedExperiments = experiments.filter((chapter) => completed.includes(chapter.id));

  function show() {
    if (!dialog.current || dialog.current.open) return;
    restoreFocus.current = true;
    dialog.current.showModal();
    setOpen(true);
    heading.current?.focus({ preventScroll: true });
    dialog.current
      .querySelector('[aria-current="step"]')
      ?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
  }

  function close() {
    dialog.current?.close();
  }

  function visit(next: number) {
    // The journey moves focus to its new heading; closing the plan must not steal it back.
    restoreFocus.current = false;
    close();
    onSelect(next);
  }

  return (
    <>
      <button
        ref={trigger}
        type="button"
        className="flight-plan-trigger"
        aria-label="Open flight plan"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={`${id}-dialog`}
        onClick={show}
      >
        <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
          <path d="M4 15 10 5l6 10M4 15h12" />
          <circle cx="4" cy="15" r="1.5" />
          <circle cx="10" cy="5" r="1.5" />
          <circle cx="16" cy="15" r="1.5" />
        </svg>
        Flight plan
        <span aria-hidden="true">↗</span>
      </button>
      <dialog
        ref={dialog}
        id={`${id}-dialog`}
        className="flight-plan-dialog"
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-description`}
        onKeyDown={(event) => {
          // Native dialog Escape/Tab behavior remains intact. Journey shortcuts stay outside.
          event.stopPropagation();
        }}
        onCancel={(event) => event.stopPropagation()}
        onClose={() => {
          setOpen(false);
          if (restoreFocus.current) trigger.current?.focus({ preventScroll: true });
        }}
        onPointerDown={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect();
          backdropPress.current =
            event.target === event.currentTarget &&
            (event.clientX < bounds.left ||
              event.clientX > bounds.right ||
              event.clientY < bounds.top ||
              event.clientY > bounds.bottom);
        }}
        onClick={(event) => {
          if (event.target !== event.currentTarget || !backdropPress.current) return;
          const bounds = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < bounds.left ||
            event.clientX > bounds.right ||
            event.clientY < bounds.top ||
            event.clientY > bounds.bottom
          )
            close();
        }}
      >
        <header className="flight-plan-header">
          <p className="flight-plan-eyebrow">
            <span aria-hidden="true" />
            GUIDED FLIGHT / {String(journeyChapters.length).padStart(2, '0')} STOPS
          </p>
          <h2 id={`${id}-title`} ref={heading} tabIndex={-1}>
            Choose your next stop.
          </h2>
          <p id={`${id}-description`} className="flight-plan-description">
            Follow the story, or take a little detour.
          </p>
          <button
            type="button"
            className="flight-plan-close"
            aria-label="Close flight plan"
            onClick={close}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </header>
        <nav className="flight-plan-body" aria-label="Choose a journey chapter">
          <ol className="flight-plan-stops">
            {journeyChapters.map((chapter, chapterIndex) => {
              const interactive = 'action' in chapter;
              const complete = interactive && completed.includes(chapter.id);
              return (
                <li key={chapter.id}>
                  <button
                    type="button"
                    className="flight-plan-stop"
                    aria-label={`Visit ${chapter.label}`}
                    aria-current={index === chapterIndex ? 'step' : undefined}
                    aria-describedby={`${id}-stop-${chapterIndex}`}
                    data-interactive={interactive || undefined}
                    data-complete={complete || undefined}
                    onClick={() => visit(chapterIndex)}
                  >
                    <span className="flight-plan-number" aria-hidden="true">
                      {String(chapterIndex + 1).padStart(2, '0')}
                    </span>
                    <span className="flight-plan-stop-copy">
                      <span className="flight-plan-stop-label">{chapter.label}</span>
                      <span className="flight-plan-stop-context" id={`${id}-stop-${chapterIndex}`}>
                        {chapterContext[chapter.id] || chapter.eyebrow}
                        {interactive && (
                          <span className="flight-plan-interactive">
                            {complete ? 'Experiment complete' : 'Interactive'}
                          </span>
                        )}
                      </span>
                    </span>
                    <span className="flight-plan-stop-icon" aria-hidden="true">
                      {complete ? '✓' : index === chapterIndex ? '●' : '↗'}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
        <footer className="flight-plan-footer">
          <span>
            <strong>{completedExperiments.length}</strong> / {experiments.length} experiments
            completed
          </span>
          <span className="flight-plan-current-location">
            YOU ARE HERE <strong>{String(index + 1).padStart(2, '0')}</strong>
          </span>
        </footer>
      </dialog>
    </>
  );
}
