import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearManualDeviceLogout,
  consumeManualDeviceLogout,
  markManualDeviceLogout,
} from "../../utils/manualDeviceLogout.js";

describe("manual device logout notification guard", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    clearManualDeviceLogout("device-a");
    vi.useRealTimers();
  });

  it("suppresses one expected disconnect notification", () => {
    markManualDeviceLogout("device-a");

    expect(consumeManualDeviceLogout("device-a")).toBe(true);
    expect(consumeManualDeviceLogout("device-a")).toBe(false);
  });

  it("does not suppress a disconnect after the guard expires", () => {
    markManualDeviceLogout("device-a", 1000);
    vi.advanceTimersByTime(1001);

    expect(consumeManualDeviceLogout("device-a")).toBe(false);
  });

  it("can clear the guard after a failed logout request", () => {
    markManualDeviceLogout("device-a");
    clearManualDeviceLogout("device-a");

    expect(consumeManualDeviceLogout("device-a")).toBe(false);
  });
});
