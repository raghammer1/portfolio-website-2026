import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { MarsRenderer } from './marsRenderer';
import './ObservatoryVisual.css';

/** A photographic fallback enhanced with genuine surface rotation when supported. */
export function ObservatoryVisual() {
  const hostRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const toggleRef = useRef<(() => void) | null>(null);
  const [controlHost, setControlHost] = useState<HTMLElement | null>(null);
  const [enhanced, setEnhanced] = useState(false);
  const [paused, setPaused] = useState(true);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    const host = hostRef.current;
    const scene = sceneRef.current;
    if (!host || !scene) return;
    const receiver = host.closest<HTMLElement>('.hero') ?? host;

    const enabled = window.matchMedia(
      '(pointer: fine) and (prefers-reduced-motion: no-preference)',
    );
    let frame = 0;
    let x = 0;
    let y = 0;
    let targetX = 0;
    let targetY = 0;

    const render = () => {
      x += (targetX - x) * 0.085;
      y += (targetY - y) * 0.085;
      const settled = Math.abs(targetX - x) + Math.abs(targetY - y) < 0.015;
      if (settled) {
        x = targetX;
        y = targetY;
      }
      scene.style.setProperty('--observatory-x', `${x.toFixed(3)}px`);
      scene.style.setProperty('--observatory-y', `${y.toFixed(3)}px`);
      frame = settled ? 0 : window.requestAnimationFrame(render);
    };

    const move = (event: PointerEvent) => {
      if (!enabled.matches || event.pointerType === 'touch') return;
      const rect = receiver.getBoundingClientRect();
      targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 9;
      targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 9;
      if (!frame) frame = window.requestAnimationFrame(render);
    };

    const leave = () => {
      targetX = 0;
      targetY = 0;
      if (enabled.matches && !frame) frame = window.requestAnimationFrame(render);
    };

    const updatePreference = () => {
      if (enabled.matches) return;
      window.cancelAnimationFrame(frame);
      frame = 0;
      x = y = targetX = targetY = 0;
      scene.style.setProperty('--observatory-x', '0px');
      scene.style.setProperty('--observatory-y', '0px');
    };

    receiver.addEventListener('pointermove', move, { passive: true });
    receiver.addEventListener('pointerleave', leave);
    enabled.addEventListener('change', updatePreference);

    return () => {
      window.cancelAnimationFrame(frame);
      receiver.removeEventListener('pointermove', move);
      receiver.removeEventListener('pointerleave', leave);
      enabled.removeEventListener('change', updatePreference);
    };
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    const hero = host.closest<HTMLElement>('.hero') ?? host;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const abort = new AbortController();
    let renderer: MarsRenderer | null = null;
    let disposed = false;
    let loading = false;
    let failed = false;
    let userPaused = false;
    let wantsMotion = !preference.matches;
    const initialBounds = hero.getBoundingClientRect();
    let inView = initialBounds.bottom > 0 && initialBounds.top < window.innerHeight;
    setControlHost(hero);
    setPaused(!wantsMotion);

    const fail = () => {
      if (disposed) return;
      failed = true;
      renderer?.dispose();
      renderer = null;
      setEnhanced(false);
      setAvailable(false);
    };
    const synchronize = () => {
      if (disposed || failed) return;
      const shouldRun = wantsMotion && inView && document.visibilityState === 'visible';
      if (shouldRun && !renderer && !loading) void initialize();
      renderer?.setRunning(shouldRun);
    };
    const initialize = async () => {
      loading = true;
      try {
        const { createMarsRenderer } = await import('./marsRenderer');
        if (disposed) return;
        const next = await createMarsRenderer(canvas, {
          textureUrl: window.matchMedia('(max-width: 767px)').matches
            ? '/images/mars-color-map-mobile.webp'
            : '/images/mars-color-map.webp',
          signal: abort.signal,
          onContextLost: fail,
        });
        if (disposed) {
          next.dispose();
          return;
        }
        renderer = next;
        setEnhanced(wantsMotion || !preference.matches);
        synchronize();
      } catch {
        if (!abort.signal.aborted) fail();
      } finally {
        loading = false;
      }
    };
    toggleRef.current = () => {
      wantsMotion = !wantsMotion;
      userPaused = !wantsMotion;
      setPaused(!wantsMotion);
      if (renderer && wantsMotion) setEnhanced(true);
      synchronize();
    };
    const preferenceChanged = () => {
      wantsMotion = !preference.matches && !userPaused;
      setPaused(!wantsMotion);
      if (preference.matches) setEnhanced(false);
      else if (renderer) setEnhanced(true);
      synchronize();
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        synchronize();
      },
      { threshold: 0 },
    );
    const resize = new ResizeObserver(() => renderer?.resize());
    observer.observe(hero);
    resize.observe(host);
    document.addEventListener('visibilitychange', synchronize);
    preference.addEventListener('change', preferenceChanged);
    synchronize();

    return () => {
      disposed = true;
      abort.abort();
      observer.disconnect();
      resize.disconnect();
      document.removeEventListener('visibilitychange', synchronize);
      preference.removeEventListener('change', preferenceChanged);
      renderer?.dispose();
      toggleRef.current = null;
    };
  }, []);

  return (
    <>
      <div
        ref={hostRef}
        className="observatory"
        data-enhanced={enhanced}
        data-motion={enhanced ? (paused ? 'paused' : 'running') : 'static'}
      >
        <div ref={sceneRef} className="observatory-scene" aria-hidden="true">
          <img
            className="observatory-planet observatory-photo"
            src="/images/mars.webp"
            width="1400"
            height="1400"
            alt=""
            decoding="async"
            fetchPriority="high"
            draggable={false}
          />
          <canvas ref={canvasRef} className="observatory-planet observatory-canvas" />
        </div>
      </div>
      {controlHost &&
        available &&
        createPortal(
          <button
            className="observatory-motion-control"
            type="button"
            onClick={() => toggleRef.current?.()}
            aria-label={paused ? 'Play planet rotation' : 'Pause planet rotation'}
            title={paused ? 'Play planet rotation' : 'Pause planet rotation'}
          >
            <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
              {paused ? <path d="M6 3.5 16 10 6 16.5Z" /> : <path d="M6 4v12M14 4v12" />}
            </svg>
          </button>,
          controlHost,
        )}
    </>
  );
}
