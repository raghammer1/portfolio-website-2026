import { useEffect, useRef } from 'react';
import type { KeyboardEvent, PointerEvent } from 'react';
import './RocketScrollbar.css';

const THUMB_HEIGHT = 48;
const clamp = (value: number) => Math.min(1, Math.max(0, value));
const scrollRange = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

export function RocketScrollbar() {
  const railRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLSpanElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const dragOffset = useRef(THUMB_HEIGHT / 2);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const root = document.documentElement;
    const media = window.matchMedia(
      '(min-width: 900px) and (pointer: fine) and (forced-colors: none)',
    );
    let frame = 0;
    let idleTimer = 0;

    const update = () => {
      frame = 0;
      if (!media.matches) return;
      const range = scrollRange();
      const progress = range ? clamp(window.scrollY / range) : 0;
      const percent = Math.round(progress * 100);
      const position = progress * Math.max(0, rail.clientHeight - THUMB_HEIGHT);
      rail.style.setProperty('--rocket-position', `${position}px`);
      rail.style.setProperty('--rocket-progress', String(progress));
      rail.setAttribute('aria-valuenow', String(percent));
      rail.setAttribute('aria-valuetext', `${percent}% of page`);
      if (readoutRef.current)
        readoutRef.current.textContent = `${String(percent).padStart(2, '0')}%`;
    };
    const schedule = () => {
      if (!frame && media.matches) frame = window.requestAnimationFrame(update);
    };
    const configure = () => {
      root.toggleAttribute('data-rocket-scroll', media.matches);
      schedule();
    };
    const onScroll = () => {
      if (!media.matches) return;
      rail.dataset.moving = 'true';
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => delete rail.dataset.moving, 160);
      schedule();
    };
    // Expanded case studies, fonts and responsive changes all affect page length.
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    observer.observe(rail);
    configure();
    media.addEventListener('change', configure);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      root.removeAttribute('data-rocket-scroll');
      observer.disconnect();
      media.removeEventListener('change', configure);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', schedule);
      window.cancelAnimationFrame(frame);
      window.clearTimeout(idleTimer);
    };
  }, []);

  function seek(event: PointerEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const travel = bounds.height - THUMB_HEIGHT;
    if (travel <= 0) return;
    const progress = clamp((event.clientY - bounds.top - dragOffset.current) / travel);
    window.scrollTo({ top: progress * scrollRange(), behavior: 'instant' });
  }

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    const thumb = thumbRef.current;
    dragOffset.current =
      thumb && thumb.contains(event.target as Node)
        ? event.clientY - thumb.getBoundingClientRect().top
        : THUMB_HEIGHT / 2;
    event.currentTarget.focus({ preventScroll: true });
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.dataset.dragging = 'true';
    event.preventDefault();
    seek(event);
  }

  function keyboardScroll(event: KeyboardEvent<HTMLDivElement>) {
    const page = window.innerHeight * 0.85;
    const destinations: Record<string, number> = {
      ArrowDown: window.scrollY + 80,
      ArrowUp: window.scrollY - 80,
      PageDown: window.scrollY + page,
      PageUp: window.scrollY - page,
      Home: 0,
      End: scrollRange(),
      ' ': window.scrollY + (event.shiftKey ? -page : page),
    };
    if (!(event.key in destinations)) return;
    event.preventDefault();
    window.scrollTo({
      top: Math.max(0, Math.min(scrollRange(), destinations[event.key])),
      behavior: 'instant',
    });
  }

  return (
    <div
      ref={railRef}
      className="rocket-scroll"
      role="scrollbar"
      aria-label="Page scroll"
      aria-controls="main"
      aria-orientation="vertical"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
      aria-valuetext="0% of page"
      tabIndex={0}
      onKeyDown={keyboardScroll}
      onPointerDown={startDrag}
      onPointerMove={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) seek(event);
      }}
      onPointerUp={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
      }}
      onLostPointerCapture={(event) => delete event.currentTarget.dataset.dragging}
    >
      <span className="rocket-scroll-track" aria-hidden="true">
        <span className="rocket-scroll-trail" />
      </span>
      <span className="rocket-scroll-thumb" ref={thumbRef} aria-hidden="true">
        <span className="rocket-scroll-readout">
          SCROLL <span ref={readoutRef}>00%</span>
        </span>
        <svg viewBox="0 0 28 48" fill="none" focusable="false">
          <path className="rocket-scroll-flame" d="M11 33Q10 40 14 47Q18 40 17 33Z" />
          <path className="rocket-scroll-fin" d="m9 23-5 7v5l6-3m9-9 5 7v5l-6-3" />
          <path className="rocket-scroll-body" d="M14 2C10 7 9 12 9 18v14h10V18c0-6-1-11-5-16Z" />
          <path className="rocket-scroll-seam" d="M9 24h10M11 35h6" />
          <circle className="rocket-scroll-window" cx="14" cy="16" r="2.4" />
        </svg>
      </span>
    </div>
  );
}
