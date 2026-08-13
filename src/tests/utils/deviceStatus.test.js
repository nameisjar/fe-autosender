import { describe, expect, it } from "vitest";
import {
  getDeviceStatusClass,
  getDeviceStatusLabel,
  normalizeDeviceStatus,
} from "../../utils/deviceStatus.js";

describe("device status presentation", () => {
  it("normalizes backend connection aliases", () => {
    expect(normalizeDeviceStatus("connected")).toBe("open");
    expect(normalizeDeviceStatus("closed")).toBe("close");
    expect(normalizeDeviceStatus("pending")).toBe("connecting");
  });

  it("shows close without a session as requiring pairing", () => {
    const device = { status: "close", sessionId: null };
    expect(getDeviceStatusLabel(device)).toBe("Perlu pairing");
    expect(getDeviceStatusClass(device)).toBe("is-closed");
  });

  it("shows close with retained credentials as disconnected", () => {
    const device = { status: "close", sessionId: "session-1" };
    expect(getDeviceStatusLabel(device)).toBe("Terputus");
    expect(getDeviceStatusClass(device)).toBe("is-pending");
  });

  it("uses user-facing labels for active and transient states", () => {
    expect(getDeviceStatusLabel({ status: "open" })).toBe("Terhubung");
    expect(getDeviceStatusLabel({ status: "connecting" })).toBe("Menghubungkan");
    expect(getDeviceStatusLabel({ status: "reconnecting" })).toBe("Menghubungkan ulang");
  });

  it("always requires pairing after an explicit logged out status", () => {
    expect(getDeviceStatusLabel({ status: "logged_out", sessionId: "stale-session" })).toBe(
      "Perlu pairing"
    );
  });
});
