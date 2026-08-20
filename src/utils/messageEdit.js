export const MESSAGE_EDIT_WINDOW_MS = 15 * 60 * 1000;

export function isWithinMessageEditWindow(timestamp, now = Date.now()) {
  const sentAt = new Date(timestamp).getTime();
  const ageMs = Number(now) - sentAt;
  return Number.isFinite(ageMs) && ageMs >= 0 && ageMs < MESSAGE_EDIT_WINDOW_MS;
}
