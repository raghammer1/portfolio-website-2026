import { useEffect, useId, useRef, useState } from 'react';
import {
  createTransportState,
  packetNumber,
  stepTransport,
  TRANSPORT_PAYLOAD,
  transportSegmentStatus,
} from '../lib/transportSimulation';
import type { TransportScenario } from '../lib/transportSimulation';
import './TransportPreview.css';
import { useJourney } from './journey/JourneyContext';

const scenarios: Array<{ value: TransportScenario; label: string }> = [
  { value: 'reliable', label: 'Reliable' },
  { value: 'data-loss', label: 'Data lost' },
  { value: 'ack-loss', label: 'ACK lost' },
];

export function TransportPreview() {
  const { report } = useJourney();
  const headingId = useId();
  const scenarioName = useId();
  const hostRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState(() => createTransportState());
  const [running, setRunning] = useState(false);
  const playing = running && !state.complete;
  const disrupted = state.event.kind === 'data-loss' || state.event.kind === 'ack-loss';

  useEffect(() => {
    if (state.complete)
      report(
        'transport-preview',
        'Six packets, in order. Message delivered and confirmed.',
        state.retries > 0,
      );
    else if (state.retries > 0)
      report(
        'transport-preview',
        'There’s the retry. Reliability comes from expecting a failure and knowing what to do next.',
        true,
      );
    else if (disrupted)
      report(
        'transport-preview',
        'A packet went missing. Watch what the sender does when the acknowledgment doesn’t arrive.',
      );
    else if (state.tick === 0) report('transport-preview', '');
  }, [state.complete, state.retries, state.tick, disrupted, report]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setState(stepTransport), 500);
    return () => window.clearInterval(timer);
  }, [playing]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) setRunning(false);
    });
    const visibilityChanged = () => {
      if (document.visibilityState !== 'visible') setRunning(false);
    };
    observer.observe(host);
    document.addEventListener('visibilitychange', visibilityChanged);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', visibilityChanged);
    };
  }, []);

  function reset(scenario = state.scenario) {
    setRunning(false);
    setState(createTransportState(scenario));
  }

  return (
    <div ref={hostRef} className="transport-preview" role="group" aria-labelledby={headingId}>
      <div className="transport-preview-heading" id={headingId}>
        <span>INTERACTIVE PREVIEW</span>
        <span>02 / TRANSPORT</span>
      </div>
      <p className="transport-instructions">
        Send six packets. Introduce a loss. Watch order recover.
      </p>
      <fieldset className="transport-scenarios">
        <legend>Connection</legend>
        <div>
          {scenarios.map((scenario) => (
            <label key={scenario.value}>
              <input
                type="radio"
                name={scenarioName}
                value={scenario.value}
                checked={state.scenario === scenario.value}
                onChange={() => reset(scenario.value)}
              />
              <span>{scenario.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className={`transport-display${state.complete ? ' is-complete' : ''}`}>
        <div className="transport-endpoints" aria-hidden="true">
          <span>
            <i /> SENDER
          </span>
          <span>
            RECEIVER <i />
          </span>
        </div>
        <svg className="transport-link" viewBox="0 0 480 104" aria-hidden="true" focusable="false">
          <path className="transport-rail" d="M14 14v76M466 14v76" />
          <path className="transport-route" d="M14 29H459m-7-5 7 5-7 5M466 77H21m7-5-7 5 7 5" />
          <text className="transport-lane-label" x="240" y="14" textAnchor="middle">
            DATA →
          </text>
          <text className="transport-lane-label" x="240" y="101" textAnchor="middle">
            ← ACKNOWLEDGMENT
          </text>
          {state.packets.map((packet) => {
            const progress = Math.min(
              1,
              (state.tick - packet.sentAt) / (packet.arrivesAt - packet.sentAt),
            );
            const x = packet.kind === 'data' ? 32 + progress * 416 : 448 - progress * 416;
            return (
              <g
                key={packet.id}
                className={`transport-datagram is-${packet.kind}${packet.attempt > 1 ? ' is-retry' : ''}`}
                style={{ transform: `translate(${x}px, ${packet.kind === 'data' ? 29 : 77}px)` }}
              >
                <rect x="-15" y="-11" width="30" height="22" rx="1" />
                <text textAnchor="middle" dominantBaseline="central">
                  {packetNumber(packet.sequence)}
                </text>
              </g>
            );
          })}
          {disrupted && (
            <g
              className="transport-loss"
              transform={`translate(${state.event.kind === 'data-loss' ? 421 : 59}, ${state.event.kind === 'data-loss' ? 29 : 77})`}
            >
              <circle r="12" />
              <path d="m-4-4 8 8m0-8-8 8" />
            </g>
          )}
        </svg>
        <ol className="transport-sequence" aria-label="Packet delivery progress">
          {TRANSPORT_PAYLOAD.map((payload, index) => {
            const sequence = index + 1;
            const status = transportSegmentStatus(state, sequence);
            return (
              <li
                key={sequence}
                data-state={status}
                aria-label={`Packet ${sequence}: ${status.replace('-', ' ')}`}
              >
                <span className="transport-sequence-number">{packetNumber(sequence)}</span>
                <span>{payload}</span>
              </li>
            );
          })}
        </ol>
        <div className="transport-result">
          <span>RECEIVED IN ORDER</span>
          <output aria-label="Received message" aria-live="off">
            {state.delivered.length
              ? state.delivered.map((sequence) => TRANSPORT_PAYLOAD[sequence - 1]).join(' ')
              : 'Waiting for the first packet.'}
          </output>
        </div>
        <div className="transport-counters">
          <span>
            <strong data-counter="confirmed">{state.confirmedThrough}</strong> / 6 confirmed
          </span>
          <span>
            <strong data-counter="retries">{state.retries}</strong> retries
          </span>
          <span>
            <strong data-counter="duplicates">{state.duplicateData + state.duplicateAcks}</strong>{' '}
            repeats ignored
          </span>
        </div>
      </div>
      <div className="transport-controls">
        <button
          className="transport-run"
          type="button"
          disabled={state.complete}
          aria-label={
            playing
              ? 'Pause transport simulation'
              : state.complete
                ? 'Message delivered'
                : state.tick
                  ? 'Continue — Run transport simulation'
                  : 'Send message — Run transport simulation'
          }
          onClick={() => setRunning(!running)}
        >
          <span>
            {playing
              ? 'Pause'
              : state.complete
                ? 'Delivered'
                : state.tick
                  ? 'Continue'
                  : 'Send message'}
          </span>
          <svg viewBox="0 0 20 20" aria-hidden="true">
            {playing ? (
              <path d="M7 4v12m6-12v12" />
            ) : state.complete ? (
              <path d="m4 10 4 4 8-8" />
            ) : (
              <path d="M4 10h12m-5-5 5 5-5 5" />
            )}
          </svg>
        </button>
        <button
          type="button"
          disabled={state.complete}
          aria-label="Step transport simulation"
          onClick={() => {
            setRunning(false);
            setState(stepTransport);
          }}
        >
          Step
        </button>
        <button type="button" aria-label="Reset transport simulation" onClick={() => reset()}>
          Reset
        </button>
      </div>
      <p
        className={`transport-status${disrupted ? ' is-loss' : ''}`}
        role="status"
        aria-live={playing ? 'off' : 'polite'}
        aria-atomic="true"
      >
        <span aria-hidden="true">{state.complete ? '✓' : disrupted ? '×' : '•'}</span>
        {state.event.message}
      </p>
      <p className="transport-note">A browser simulation inspired by the Python project.</p>
      <noscript>
        <style>{`.transport-scenarios, .transport-controls, .transport-status, .transport-instructions { display: none; }`}</style>
        <p className="transport-fallback">
          Enable JavaScript to try this preview, or explore the project source.
        </p>
      </noscript>
    </div>
  );
}
