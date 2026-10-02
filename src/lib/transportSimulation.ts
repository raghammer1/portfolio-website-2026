/** A deterministic, simplified sliding-window transport model; no network traffic. */
export const TRANSPORT_PAYLOAD = ['MAKE', 'EVERY', 'PACKET', 'FIND', 'ITS', 'WAY.'] as const;
export const TRANSPORT_MESSAGE = TRANSPORT_PAYLOAD.join(' ');
export type TransportScenario = 'reliable' | 'data-loss' | 'ack-loss';
export type TransportEventKind =
  | 'ready'
  | 'send'
  | 'receive'
  | 'buffer'
  | 'ack'
  | 'data-loss'
  | 'ack-loss'
  | 'retry'
  | 'duplicate-data'
  | 'duplicate-ack'
  | 'wait'
  | 'complete';

export interface TransportPacket {
  id: number;
  kind: 'data' | 'ack';
  sequence: number;
  attempt: number;
  sentAt: number;
  arrivesAt: number;
}

export interface TransportState {
  scenario: TransportScenario;
  tick: number;
  nextSequence: number;
  nextPacketId: number;
  confirmedThrough: number;
  receivedThrough: number;
  delivered: number[];
  buffer: number[];
  segments: Array<{ sequence: number; attempts: number; lastSentAt: number }>;
  packets: TransportPacket[];
  retries: number;
  duplicateData: number;
  duplicateAcks: number;
  dataLossInjected: boolean;
  ackLossInjected: boolean;
  complete: boolean;
  event: { kind: TransportEventKind; sequence: number | null; message: string };
}

const WINDOW_SIZE = 3;
const TRANSIT_STEPS = 3;
const RETRY_AFTER_STEPS = 8;
export const packetNumber = (sequence: number) => String(sequence).padStart(2, '0');

export function createTransportState(scenario: TransportScenario = 'reliable'): TransportState {
  return {
    scenario,
    tick: 0,
    nextSequence: 1,
    nextPacketId: 1,
    confirmedThrough: 0,
    receivedThrough: 0,
    delivered: [],
    buffer: [],
    segments: TRANSPORT_PAYLOAD.map((_, index) => ({
      sequence: index + 1,
      attempts: 0,
      lastSentAt: -1,
    })),
    packets: [],
    retries: 0,
    duplicateData: 0,
    duplicateAcks: 0,
    dataLossInjected: false,
    ackLossInjected: false,
    complete: false,
    event: {
      kind: 'ready',
      sequence: null,
      message: 'Ready to send. Six packets, one ordered message.',
    },
  };
}

export function stepTransport(previous: TransportState): TransportState {
  if (previous.complete) return previous;
  const state: TransportState = {
    ...previous,
    tick: previous.tick + 1,
    delivered: [...previous.delivered],
    buffer: [...previous.buffer],
    segments: previous.segments.map((segment) => ({ ...segment })),
    packets: [...previous.packets],
  };
  const enqueue = (kind: TransportPacket['kind'], sequence: number, attempt: number) => {
    state.packets.push({
      id: state.nextPacketId++,
      kind,
      sequence,
      attempt,
      sentAt: state.tick,
      arrivesAt: state.tick + TRANSIT_STEPS,
    });
  };
  const report = (kind: TransportEventKind, sequence: number | null, message: string) => {
    state.event = { kind, sequence, message };
  };
  const dueIndex = state.packets.findIndex((packet) => packet.arrivesAt <= state.tick);

  if (dueIndex !== -1) {
    const [packet] = state.packets.splice(dueIndex, 1);
    const number = packetNumber(packet.sequence);
    if (packet.kind === 'data') {
      if (state.scenario === 'data-loss' && packet.sequence === 2 && !state.dataLossInjected) {
        state.dataLossInjected = true;
        report('data-loss', packet.sequence, 'Packet 02 was lost. The sender will retry.');
        return state;
      }
      if (packet.sequence <= state.receivedThrough || state.buffer.includes(packet.sequence)) {
        state.duplicateData += 1;
        report(
          'duplicate-data',
          packet.sequence,
          `Packet ${number} arrived again. Ignored; acknowledgment resent.`,
        );
      } else {
        state.buffer.push(packet.sequence);
        state.buffer.sort((a, b) => a - b);
        while (state.buffer[0] === state.receivedThrough + 1) {
          state.receivedThrough = state.buffer.shift()!;
          state.delivered.push(state.receivedThrough);
        }
        if (packet.sequence > state.receivedThrough) {
          report(
            'buffer',
            packet.sequence,
            `Packet ${number} arrived early. Waiting for ${packetNumber(state.receivedThrough + 1)}.`,
          );
        } else {
          report(
            'receive',
            packet.sequence,
            `Packet ${number} received. Message ordered through ${packetNumber(state.receivedThrough)}.`,
          );
        }
      }
      // ACKs report the highest contiguous sequence, never a gap beyond it.
      enqueue('ack', state.receivedThrough, packet.attempt);
    } else {
      if (
        state.scenario === 'ack-loss' &&
        packet.sequence === TRANSPORT_PAYLOAD.length &&
        !state.ackLossInjected
      ) {
        state.ackLossInjected = true;
        report('ack-loss', packet.sequence, 'ACK 06 was lost. Delivery awaits confirmation.');
        return state;
      }
      if (packet.sequence <= state.confirmedThrough) {
        state.duplicateAcks += 1;
        report(
          'duplicate-ack',
          packet.sequence,
          `Repeated ACK ${number} ignored. No delivery counted twice.`,
        );
      } else {
        state.confirmedThrough = packet.sequence;
        report(
          'ack',
          packet.sequence,
          `ACK ${number} received. Packets through ${number} confirmed.`,
        );
      }
      if (state.confirmedThrough === TRANSPORT_PAYLOAD.length) {
        state.complete = true;
        state.packets = [];
        report('complete', packet.sequence, 'All six packets confirmed. Delivered once, in order.');
      }
    }
    return state;
  }

  const expired = state.segments.find(
    (segment) =>
      segment.sequence > state.confirmedThrough &&
      segment.attempts > 0 &&
      state.tick - segment.lastSentAt >= RETRY_AFTER_STEPS,
  );
  if (expired) {
    expired.attempts += 1;
    expired.lastSentAt = state.tick;
    state.retries += 1;
    enqueue('data', expired.sequence, expired.attempts);
    report(
      'retry',
      expired.sequence,
      `No confirmation for ${packetNumber(expired.sequence)}. Sending it again.`,
    );
  } else if (
    state.nextSequence <= TRANSPORT_PAYLOAD.length &&
    state.nextSequence <= state.confirmedThrough + WINDOW_SIZE
  ) {
    const segment = state.segments[state.nextSequence - 1];
    segment.attempts = 1;
    segment.lastSentAt = state.tick;
    enqueue('data', segment.sequence, segment.attempts);
    state.nextSequence += 1;
    report(
      'send',
      segment.sequence,
      `Sending packet ${packetNumber(segment.sequence)}: “${TRANSPORT_PAYLOAD[segment.sequence - 1]}”.`,
    );
  } else {
    report('wait', null, 'Waiting for an acknowledgment. The retry timer advances.');
  }
  return state;
}

export function transportSegmentStatus(state: TransportState, sequence: number) {
  if (sequence <= state.confirmedThrough) return 'confirmed';
  if (sequence <= state.receivedThrough) return 'received';
  if (state.buffer.includes(sequence)) return 'buffered';
  if (state.segments[sequence - 1].attempts > 0) return 'awaiting-ack';
  return 'waiting';
}
