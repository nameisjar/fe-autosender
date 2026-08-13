const manualLogoutExpirations = new Map();

const normalizeDeviceId = (deviceId) => String(deviceId || "").trim();

export function markManualDeviceLogout(deviceId, ttlMs = 30000) {
  const key = normalizeDeviceId(deviceId);
  if (!key) return;
  manualLogoutExpirations.set(key, Date.now() + Math.max(1000, Number(ttlMs) || 30000));
}

export function clearManualDeviceLogout(deviceId) {
  const key = normalizeDeviceId(deviceId);
  if (key) manualLogoutExpirations.delete(key);
}

export function consumeManualDeviceLogout(deviceId) {
  const key = normalizeDeviceId(deviceId);
  if (!key) return false;

  const expiresAt = manualLogoutExpirations.get(key);
  manualLogoutExpirations.delete(key);
  return Boolean(expiresAt && expiresAt > Date.now());
}

