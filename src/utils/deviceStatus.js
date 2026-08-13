export function normalizeDeviceStatus(status) {
  const value = String(status || "").trim().toLowerCase();
  if (value === "open" || value === "connected") return "open";
  if (value === "connecting" || value === "pending") return "connecting";
  if (value === "reconnecting") return "reconnecting";
  if (value === "logged_out") return "logged_out";
  if (value === "close" || value === "closed" || value === "disconnected") return "close";
  if (["error", "failed", "bad_session", "banned", "forbidden"].includes(value)) {
    return "error";
  }
  return null;
}

export function getDeviceStatusPresentation(deviceOrStatus, explicitSessionId) {
  const isDevice = Boolean(deviceOrStatus && typeof deviceOrStatus === "object");
  const status = normalizeDeviceStatus(isDevice ? deviceOrStatus.status : deviceOrStatus) || "unknown";
  const sessionId = isDevice ? deviceOrStatus.sessionId : explicitSessionId;
  const hasSession = Boolean(String(sessionId || "").trim());

  if (status === "open") return { status, label: "Terhubung", className: "is-open" };
  if (status === "connecting") {
    return { status, label: "Menghubungkan", className: "is-pending" };
  }
  if (status === "reconnecting") {
    return { status, label: "Menghubungkan ulang", className: "is-pending" };
  }
  if (status === "logged_out") {
    return { status, label: "Perlu pairing", className: "is-closed" };
  }
  if (status === "close") {
    return hasSession
      ? { status, label: "Terputus", className: "is-pending" }
      : { status, label: "Perlu pairing", className: "is-closed" };
  }
  if (status === "error") {
    return { status, label: "Bermasalah", className: "is-closed" };
  }
  return { status, label: "Tidak diketahui", className: "is-closed" };
}

export const getDeviceStatusLabel = (deviceOrStatus, sessionId) =>
  getDeviceStatusPresentation(deviceOrStatus, sessionId).label;

export const getDeviceStatusClass = (deviceOrStatus, sessionId) =>
  getDeviceStatusPresentation(deviceOrStatus, sessionId).className;
