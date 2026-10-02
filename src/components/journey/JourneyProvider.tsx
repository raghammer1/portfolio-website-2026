import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { journeyChapters } from '../../data/journey';
import type { JourneyId } from '../../data/journey';
import { JourneyContext } from './JourneyContext';
import { Arrow } from '../Icons';
import { FlightPlan } from './FlightPlan';

export function JourneyProvider({ children }: { children: ReactNode }) {
  const [index, setIndex] = useState<number | null>(null);
  const [signals, setSignals] = useState<Partial<Record<JourneyId, string>>>({});
  const [completed, setCompleted] = useState<JourneyId[]>([]);
  const [inView, setInView] = useState(true);
  const deck = useRef<HTMLDivElement>(null);
  const restoreOnExit = useRef(false);
  const chapter = index === null ? null : journeyChapters[index];

  const goTo = useCallback((next: number) => {
    restoreOnExit.current = false;
    setIndex(Math.max(0, Math.min(journeyChapters.length - 1, next)));
  }, []);
  const start = useCallback(() => goTo(0), [goTo]);
  const report = useCallback((id: JourneyId, message: string, discovered = false) => {
    setSignals((previous) =>
      previous[id] === message ? previous : { ...previous, [id]: message },
    );
    if (discovered)
      setCompleted((previous) => (previous.includes(id) ? previous : [...previous, id]));
  }, []);

  const exit = useCallback(() => {
    restoreOnExit.current = true;
    setIndex(null);
  }, []);

  useLayoutEffect(() => {
    if (index !== null || !restoreOnExit.current) return;
    restoreOnExit.current = false;
    // Restore a useful reading position without sending a freely scrolling visitor back to the hero.
    const headings = Array.from(
      document.querySelectorAll<HTMLElement>('main h1, main h2, main h3'),
    );
    const visible = headings.find((el) => {
      const bounds = el.getBoundingClientRect();
      return bounds.top >= 90 && bounds.top < window.innerHeight - 40;
    });
    const destination = visible || document.getElementById('main');
    destination?.setAttribute('tabindex', '-1');
    destination?.focus({ preventScroll: true });
  }, [index]);

  function returnToChapter() {
    if (!chapter) return;
    const target = document.getElementById(chapter.id);
    const headerHeight =
      document.querySelector('.site-header')?.getBoundingClientRect().height ?? 100;
    if (target)
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - headerHeight,
        behavior: 'instant',
      });
    document.getElementById(chapter.headingId)?.focus({ preventScroll: true });
  }

  useEffect(() => {
    if (!chapter) return;
    const root = document.documentElement;
    const target = document.getElementById(chapter.id);
    if (!target) return;
    root.dataset.journey = chapter.id;
    target.dataset.journeyCurrent = 'true';
    // One deliberate cut per visitor action. No timed progression, wheel capture or scroll locks.
    const frame = window.requestAnimationFrame(() => {
      const headerHeight =
        document.querySelector('.site-header')?.getBoundingClientRect().height ?? 100;
      window.scrollTo({
        top: Math.max(0, target.getBoundingClientRect().top + window.scrollY - headerHeight),
        behavior: 'instant',
      });
      document.getElementById(chapter.headingId)?.focus({ preventScroll: true });
    });
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin: '-110px 0px -110px 0px',
    });
    observer.observe(target);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      delete target.dataset.journeyCurrent;
      delete root.dataset.journey;
    };
  }, [chapter]);

  const active = index !== null;
  useEffect(() => {
    if (!active || !deck.current) return;
    const root = document.documentElement;
    const element = deck.current;
    const measure = () =>
      root.style.setProperty(
        '--journey-deck-height',
        `${element.getBoundingClientRect().height}px`,
      );
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    measure();
    return () => {
      observer.disconnect();
      root.style.removeProperty('--journey-deck-height');
    };
  }, [active]);

  useEffect(() => {
    if (index === null) return;
    const keydown = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey
      )
        return;
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest('dialog[open]')) return;
      if (event.key === 'Escape') {
        if (target?.closest('select')) return;
        event.preventDefault();
        exit();
        return;
      }
      // Native controls (especially Sudoku and radio/select controls) own their keys.
      if (target?.closest('input, select, textarea, [contenteditable], [role="scrollbar"]')) return;
      if (target?.closest('button, a, summary') && !target.closest('.journey-deck')) return;
      if (event.key === 'ArrowRight' && index < journeyChapters.length - 1) {
        event.preventDefault();
        goTo(index + 1);
      }
      if (event.key === 'ArrowLeft' && index > 0) {
        event.preventDefault();
        goTo(index - 1);
      }
    };
    // Native navigation always leaves the optional journey. No query strings or history entries are written.
    const leave = () => setIndex(null);
    const followLink = (event: MouseEvent) => {
      const anchor = event.target instanceof Element ? event.target.closest('a[href^="#"]') : null;
      if (anchor) leave();
    };
    document.addEventListener('keydown', keydown);
    document.addEventListener('click', followLink);
    window.addEventListener('popstate', leave);
    window.addEventListener('hashchange', leave);
    return () => {
      document.removeEventListener('keydown', keydown);
      document.removeEventListener('click', followLink);
      window.removeEventListener('popstate', leave);
      window.removeEventListener('hashchange', leave);
    };
  }, [index, goTo, exit]);

  const value = useMemo(
    () => ({ index, signals, completed, start, goTo, exit, report }),
    [index, signals, completed, start, goTo, exit, report],
  );

  return (
    <JourneyContext.Provider value={value}>
      {children}
      {chapter && index !== null && (
        <div className="journey-deck" ref={deck} role="region" aria-label="Guided flight controls">
          <div className="journey-deck-inner">
            <div className="journey-position">
              <span className="journey-flight-label">
                {index === journeyChapters.length - 1 ? 'FLIGHT COMPLETE' : 'GUIDED FLIGHT'}
              </span>
              <span className="journey-chapter-name" aria-live="polite" aria-atomic="true">
                {String(index + 1).padStart(2, '0')} / {journeyChapters.length}{' '}
                <span>{inView ? chapter.label : 'Exploring freely'}</span>
              </span>
              <FlightPlan
                index={index}
                onSelect={(next) => (next === index ? returnToChapter() : goTo(next))}
                completed={completed}
              />
            </div>
            <nav className="journey-route" aria-label="Flight chapters">
              {journeyChapters.map((stop, i) => (
                <button
                  key={stop.id}
                  type="button"
                  aria-label={`Go to chapter ${i + 1}: ${stop.label}`}
                  aria-current={index === i ? 'step' : undefined}
                  data-passed={i < index || undefined}
                  onClick={() => (i === index ? returnToChapter() : goTo(i))}
                >
                  <span className="journey-route-dot" />
                  <span className="journey-route-label">{stop.label}</span>
                </button>
              ))}
            </nav>
            <div className="journey-controls">
              {!inView && (
                <button
                  className="journey-return"
                  type="button"
                  onClick={returnToChapter}
                  aria-label="Return to current chapter"
                >
                  ↗
                </button>
              )}
              <button
                className="journey-back"
                type="button"
                aria-label="Previous chapter"
                disabled={index === 0}
                onClick={() => goTo(index - 1)}
              >
                ←<span> Back</span>
              </button>
              {index < journeyChapters.length - 1 ? (
                <button
                  className="journey-next"
                  type="button"
                  aria-label="Next chapter"
                  onClick={() => goTo(index + 1)}
                >
                  Next <Arrow />
                </button>
              ) : (
                <button className="journey-next" type="button" onClick={exit}>
                  Explore freely <Arrow />
                </button>
              )}
              <button
                className="journey-exit"
                type="button"
                onClick={exit}
                aria-label="Exit journey"
              >
                Exit <span aria-hidden="true">×</span>
              </button>
            </div>
          </div>
          <p className="sr-only" id="journey-controls-hint">
            Use Next and Back, or left and right arrow keys outside the demos. Escape exits. Scroll
            and explore whenever you like.
          </p>
        </div>
      )}
    </JourneyContext.Provider>
  );
}
