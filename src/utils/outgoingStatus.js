export const OUTGOING_STATUS_HIERARCHY = {
  error: 0,
  pending: 1,
  sending: 1,
  submitted: 2,
  server_ack: 3,
  delivery_ack: 4,
  read: 5,
  played: 6,
};

export const normalizeOutgoingUiStatus = status => {
  const normalized = String(status || '').trim().toLowerCase();

  if (normalized === 'pending' || normalized === 'sending') return 'sending';
  if (normalized === 'submitted') return 'submitted';
  if (normalized === 'server_ack') return 'server_ack';
  if (normalized === 'delivery_ack') return 'delivery_ack';
  if (normalized === 'read' || normalized === 'played') return 'read';
  if (normalized === 'error' || normalized === 'failed') return 'error';
  if (normalized === 'revoked') return 'revoked';
  return null;
};

export const resolveOutgoingUiStatus = (status, { readCount = 0, isGroup = false } = {}) => {
  const normalized = normalizeOutgoingUiStatus(status);

  // A participant read does not prove the entire group has read the message.
  // It does prove delivery, so it may repair a stale pending/error state while
  // the per-member read count remains visible separately.
  if (Number(readCount) > 0) {
    if (!isGroup) return 'read';
    if (normalized === 'read' || normalized === 'revoked') return normalized;
    return 'delivery_ack';
  }
  return normalized || 'sending';
};

// Merge status updates monotonically across Socket.IO, HTTP, and database
// snapshots. A queued/server ACK cannot revive a rejection, but delivery/read
// receipts are authoritative evidence that the message was successfully sent.
export const mergeOutgoingStatus = (currentStatus, incomingStatus) => {
  const current = normalizeOutgoingUiStatus(currentStatus) || 'sending';
  const incoming = normalizeOutgoingUiStatus(incomingStatus);

  if (current === 'revoked') return current;
  if (current === 'error') {
    return ['delivery_ack', 'read'].includes(incoming) ? incoming : current;
  }
  if (!incoming) return current;

  // A rejection can replace an optimistic/submitted/server ACK state, but cannot undo
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

export const getOutgoingFailureMessage = (
  error,
  fallback = 'Gagal mengirim pesan. Pastikan WhatsApp sudah terhubung.',
) => {
  const responseData = error?.response?.data || {};
  const firstError = Array.isArray(responseData.errors) ? responseData.errors[0] : null;
  const message =
    responseData.message ||
    firstError?.error ||
    responseData.error ||
    error?.message ||
    fallback;
  const retryAt = responseData.retryAt || firstError?.retryAt;
  if (!retryAt) return message;

  const retryDate = new Date(retryAt);
  if (Number.isNaN(retryDate.getTime()) || retryDate.getTime() <= Date.now()) return message;

  const formattedRetryAt = retryDate.toLocaleString('id-ID', {
    timeZone: 'Asia/Jayapura',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  });
  return `${message} Coba lagi setelah ${formattedRetryAt}.`;
};

export const getOutgoingMessageIdentityValues = message =>
  [
    message?.waMessageId,
    message?.messageId,
    message?.id,
    message?.tempId,
    message?.outgoingPkId,
    message?.pkId,
    message?.sourcePkId,
  ]
    .filter(value => value !== undefined && value !== null && value !== '')
    .map(value => String(value));

export const outgoingMessageMatchesStatusEvent = (message, event) => {
  const eventIds = new Set(getOutgoingMessageIdentityValues(event));
  return eventIds.size > 0
    && getOutgoingMessageIdentityValues(message).some(id => eventIds.has(id));
};

const outgoingMessageIds = message => getOutgoingMessageIdentityValues(message);

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
    return {
      ...snapshot,
      status: mergeOutgoingStatus(current.status, snapshot.status),
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
