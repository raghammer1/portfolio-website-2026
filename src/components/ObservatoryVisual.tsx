import { useEffect, useRef } from 'react';
import './ObservatoryVisual.css';

/** A photographic view of Mars, with an optional subtle change of viewpoint. */
export function ObservatoryVisual() {
  const hostRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={hostRef} className="observatory" aria-hidden="true">
      <div ref={sceneRef} className="observatory-scene">
        <img
          className="observatory-planet"
          src="/images/mars.webp"
          width="1400"
          height="1400"
          alt=""
          decoding="async"
          fetchPriority="high"
          draggable={false}
        />
      </div>
    </div>
  );
}
