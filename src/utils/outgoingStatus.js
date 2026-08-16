export const OUTGOING_STATUS_HIERARCHY = {
  error: 0,
  pending: 1,
  sending: 1,
  server_ack: 2,
  delivery_ack: 3,
  read: 4,
  played: 5,
};

export const normalizeOutgoingUiStatus = status => {
  const normalized = String(status || '').trim().toLowerCase();

  if (normalized === 'pending' || normalized === 'sending') return 'sending';
  if (normalized === 'server_ack') return 'server_ack';
  if (normalized === 'delivery_ack') return 'delivery_ack';
  if (normalized === 'read' || normalized === 'played') return 'read';
  if (normalized === 'error' || normalized === 'failed') return 'error';
  if (normalized === 'revoked') return 'revoked';
  return null;
};

// Merge status updates monotonically across Socket.IO, HTTP, and database
// snapshots. A WhatsApp rejection is terminal: a later queued/server ACK event
// can be stale and must not turn the red error back into a sent checkmark.
export const mergeOutgoingStatus = (currentStatus, incomingStatus) => {
  const current = normalizeOutgoingUiStatus(currentStatus) || 'sending';
  const incoming = normalizeOutgoingUiStatus(incomingStatus);

  if (current === 'error' || current === 'revoked') return current;
  if (!incoming) return current;

  // A rejection can replace an optimistic/server ACK state, but cannot undo
  // evidence that the message was already delivered or read.
  if (incoming === 'error') {
    return ['delivery_ack', 'read'].includes(current) ? current : 'error';
  }

  const currentLevel = OUTGOING_STATUS_HIERARCHY[current] || 0;
  const incomingLevel = OUTGOING_STATUS_HIERARCHY[incoming] || 0;
  return incomingLevel > currentLevel ? incoming : current;
};

// An HTTP response only confirms that the request finished. It follows the
// same monotonic rules as a socket event and cannot revive a rejected message.
export const mergeOutgoingResponseStatus = (currentStatus, databaseStatus) =>
  mergeOutgoingStatus(currentStatus, databaseStatus);

// A missing/late HTTP response does not prove that WhatsApp rejected the
// message. Only explicit application failures or client errors that happen
// before the send can safely produce the red error state in the Inbox.
export const isConfirmedOutgoingFailure = error => {
  if (error?.outgoingFailureConfirmed === true) return true;

  const httpStatus = Number(error?.response?.status);
  if (!Number.isInteger(httpStatus)) return false;

  return httpStatus >= 400
    && httpStatus < 500
    && ![408, 409, 425, 429].includes(httpStatus);
};

const outgoingMessageIds = message =>
  [message?.waMessageId, message?.id, message?.tempId].filter(Boolean);

// Database requests are snapshots: by the time one resolves, Socket.IO may
// already have applied a newer ACK/NACK locally. Merge matching rows by every
// supported ID instead of replacing their status with the stale snapshot.
export const mergeOutgoingSnapshotStatuses = (
  currentMessages,
  snapshotMessages,
  { keepUnmatchedCurrent = true } = {},
) => {
  const currentById = new Map();
  const matchedCurrent = new Set();
  const currentList = Array.isArray(currentMessages) ? currentMessages : [];

  for (const message of currentList) {
    for (const id of outgoingMessageIds(message)) {
      currentById.set(id, message);
    }
  }

  const mergedSnapshot = (Array.isArray(snapshotMessages) ? snapshotMessages : []).map(snapshot => {
    const current = outgoingMessageIds(snapshot)
      .map(id => currentById.get(id))
      .find(Boolean);

    if (!current) return snapshot;
    matchedCurrent.add(current);
    const currentStatus = normalizeOutgoingUiStatus(current.status);
    const snapshotStatus = normalizeOutgoingUiStatus(snapshot.status);
    // Delivery/read persisted by the backend is stronger evidence than a
    // browser-local error (for example an HTTP timeout after WhatsApp already
    // accepted the message). A pending/server ACK is not strong enough to
    // revive a confirmed WhatsApp rejection.
    const mergedStatus = currentStatus === 'error'
      && ['delivery_ack', 'read'].includes(snapshotStatus)
      ? snapshotStatus
      : mergeOutgoingStatus(current.status, snapshot.status);
    return {
      ...snapshot,
      status: mergedStatus,
    };
  });

  // A snapshot may have been queried before an optimistic message was inserted
  // or before its pending row committed. Keep those unmatched local bubbles.
  return [
    ...mergedSnapshot,
    ...(keepUnmatchedCurrent
      ? currentList.filter(message => !matchedCurrent.has(message))
      : []),
  ];
};

// Create the WhatsApp-compatible ID before sending so early ACK/NACK events can
// match the optimistic Inbox bubble before the HTTP response is returned.
export const createOutgoingMessageId = () => {
  const bytes = new Uint8Array(9);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }

  const suffix = Array.from(bytes, value => value.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
  return `3EB0${suffix}`;
};
