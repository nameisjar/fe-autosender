import { onUnmounted, ref, watch } from "vue";
import QRCode from "qrcode";
import { cache } from "../../../utils/cache.js";
import { API_BASE } from "../../../api/http.js";

const MIN_RETRY_INTERVAL = 2000;

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export function useDevicePairing({
  userApi, // kept for future parity (not used inside yet)
  toast,
  clearGroups,
  fetchDevices,
  cacheKeyToInvalidate,
  devices,
  deviceId,
  selectedDevice,
  selectedStatus,
}) {
  // Pairing state
  const qr = ref("");
  const asciiQr = ref("");
  const statusText = ref("");
  const pairingLoading = ref(false);
  const apiError = ref("");

  const waitingDisconnect = ref(false);
  const disconnectCountdown = ref(0);

  // retry guard
  const lastPairingAttempt = ref(0);

  // Controller state
  let controller = null;
  const controllerActive = ref(false);

  // QR timer
  const qrGeneratedAt = ref(null);
  const qrTimeLeft = ref(60);
  const qrExpired = ref(false);
  let qrTimerInterval = null;
  let disconnectInterval = null;

  const invalidateDevicesCache = () => {
    try {
      if (cacheKeyToInvalidate) cache.invalidate(cacheKeyToInvalidate);
    } catch (_) {}
  };

  const generateQRFromString = async (qrString) => {
    try {
      qr.value = await QRCode.toDataURL(qrString);
      asciiQr.value = "";
    } catch (error) {
      console.error("Error generating QR from string:", error);
    }
  };

  const onQRImageError = () => {
    console.error("QR image failed to load");
    if (qr.value && !qr.value.startsWith("data:image")) {
      generateQRFromString(qr.value);
    }
  };

  async function openSSEOnce() {
    controller = new AbortController();
    controllerActive.value = true;

    apiError.value = "";
    qr.value = "";
    asciiQr.value = "";

    const token = localStorage.getItem("token") || "";
    const sseUrl = `${API_BASE}/tutors/sessions/create-sse`;

    try {
      const resp = await fetch(sseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ deviceId: deviceId.value }),
        signal: controller.signal,
        cache: "no-store",
      });

      if (!resp.ok) {
        const errorText = await resp.text();
        throw new Error(`HTTP ${resp.status}: ${errorText}`);
      }

      if (!resp.body) {
        throw new Error("Response body is null");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let connectedOpen = false;

      const processLines = async () => {
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const json = line.slice(5).trim();
          if (!json) continue;

          try {
            const data = JSON.parse(json);

            if (data.error) {
              apiError.value = data.error;
              continue;
            }

            if (data.qr) {
              if (typeof data.qr === "string" && data.qr.startsWith("data:image")) {
                qr.value = data.qr;
                asciiQr.value = "";
              } else if (typeof data.qr === "string") {
                await generateQRFromString(data.qr);
              }
            }

            if (!qr.value && data.qrRaw) {
              asciiQr.value = data.qrRaw;
            }

            if (data.connection) {
              statusText.value = data.connection;
              if (data.connection === "open") {
                connectedOpen = true;
                qr.value = "";
                asciiQr.value = "";
                statusText.value = "Berhasil terhubung!";
              }
            }
          } catch (parseError) {
            console.error("Error parsing SSE data:", parseError);
          }
        }
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        await processLines();
      }

      return connectedOpen;
    } catch (error) {
      if (error?.name === "AbortError") {
        return false;
      }
      throw error;
    } finally {
      controllerActive.value = false;
    }
  }

  const startPairing = async () => {
    if (pairingLoading.value) {
      toast?.warning?.("Pairing sedang berlangsung. Mohon tunggu...");
      return;
    }

    const now = Date.now();
    const elapsed = now - lastPairingAttempt.value;
    if (lastPairingAttempt.value > 0 && elapsed < MIN_RETRY_INTERVAL) {
      const waitTime = Math.ceil((MIN_RETRY_INTERVAL - elapsed) / 1000);
      toast?.warning?.(`⏳ Tunggu ${waitTime} detik sebelum pairing lagi`);
      return;
    }

    if (!deviceId.value) {
      toast?.error?.("Pilih device terlebih dahulu");
      return;
    }

    lastPairingAttempt.value = now;

    clearGroups?.();

    // refresh list (cached if available)
    await fetchDevices?.();

    if (controller) {
      try {
        controller.abort();
      } catch (_) {}
      controller = null;
      controllerActive.value = false;
    }

    qr.value = "";
    asciiQr.value = "";
    statusText.value = "Menghubungkan...";
    pairingLoading.value = true;
    apiError.value = "";

    try {
      const maxCycles = 1;
      for (let i = 0; i < maxCycles; i++) {
        statusText.value = i === 0 ? "Memulai koneksi..." : `Mencoba ulang... (${i + 1}/${maxCycles})`;
        const opened = await openSSEOnce();

        if (opened) {
          statusText.value = "Berhasil terhubung!";
          toast?.success?.("WhatsApp berhasil terhubung!");

          qr.value = "";
          asciiQr.value = "";
          pairingLoading.value = false;

          invalidateDevicesCache();
          await fetchDevices?.(true);
          break;
        }

        if (!pairingLoading.value) break;
        if (i < maxCycles - 1) await wait(1000);
      }
    } catch (e) {
      console.error("Pairing error:", e);

      let errorMessage = "Terjadi kesalahan saat melakukan pairing";
      if (e?.message?.includes("timeout")) {
        errorMessage = "Pairing timeout. Silakan coba lagi.";
      } else if (e?.message?.includes("already connected")) {
        errorMessage = "Device sudah terhubung. Refresh halaman untuk melihat status terbaru.";
      } else if (e?.message?.includes("Device not found")) {
        errorMessage = "Device tidak ditemukan.";
      } else if (e?.message) {
        errorMessage = e.message;
      }

      statusText.value = errorMessage;
      apiError.value = errorMessage;
      toast?.error?.(errorMessage);
    } finally {
      pairingLoading.value = false;
      controller = null;
      controllerActive.value = false;

      invalidateDevicesCache();
      await fetchDevices?.(true);
    }
  };

  const stopPairing = () => {
    if (controller) {
      try {
        controller.abort();
      } catch (_) {}
    }
    controller = null;
    controllerActive.value = false;

    pairingLoading.value = false;
    apiError.value = "";
    qr.value = "";
    asciiQr.value = "";
    statusText.value = "Dihentikan";

    waitingDisconnect.value = true;
    disconnectCountdown.value = 10;

    if (disconnectInterval) clearInterval(disconnectInterval);
    disconnectInterval = setInterval(() => {
      disconnectCountdown.value -= 1;
      if (disconnectCountdown.value <= 0) {
        clearInterval(disconnectInterval);
        disconnectInterval = null;
        waitingDisconnect.value = false;

        const s = String(selectedStatus.value || "").toLowerCase();
        if (s !== "close" && s !== "closed" && s !== "disconnected") {
          toast?.warning?.("Status masih belum berubah. Silakan refresh halaman jika perlu.");
        }
      }
    }, 1000);

    setTimeout(async () => {
      invalidateDevicesCache();
      await fetchDevices?.(true);
    }, 500);
  };

  const selectNextDisconnectedDevice = () => {
    const disconnectedDevices = devices.value.filter((d) => String(d.status).toLowerCase() !== "open");
    if (disconnectedDevices.length === 0) {
      toast?.info?.("Semua device sudah terhubung");
      return;
    }

    const nextDevice = disconnectedDevices[0];
    deviceId.value = String(nextDevice.id);
    toast?.success?.(`Device "${nextDevice.name}" dipilih. Klik "Mulai Pairing" untuk menghubungkan.`);
  };

  const quickRetryPairing = async () => {
    apiError.value = "";
    qrExpired.value = false;
    lastPairingAttempt.value = 0;

    if (controller) {
      try {
        controller.abort();
      } catch (_) {}
    }
    controller = null;
    controllerActive.value = false;

    qr.value = "";
    asciiQr.value = "";
    pairingLoading.value = false;
    statusText.value = "";

    await wait(500);
    toast?.info?.("🔄 Membuat QR Code baru...");
    await startPairing();
  };

  // QR timer handling
  watch(qr, (newQr) => {
    if (newQr && String(newQr).startsWith("data:image")) {
      qrGeneratedAt.value = Date.now();
      qrTimeLeft.value = 60;
      qrExpired.value = false;

      // If a QR is shown, don't keep a blocking error banner on screen.
      apiError.value = "";

      if (qrTimerInterval) clearInterval(qrTimerInterval);

      qrTimerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - qrGeneratedAt.value) / 1000);
        qrTimeLeft.value = Math.max(0, 60 - elapsed);

        if (qrTimeLeft.value === 10 && !qrExpired.value) {
          toast?.warning?.("⚠️ QR akan expired dalam 10 detik! Scan sekarang.", {
            duration: 5000,
          });
        }

        if (qrTimeLeft.value <= 0) {
          clearInterval(qrTimerInterval);
          qrTimerInterval = null;

          // Mark as expired, but KEEP the QR so the overlay can be displayed.
          qrExpired.value = true;

          // Do not show an error banner when the QR expires.
          apiError.value = "";
        }
      }, 1000);
    } else if (!newQr) {
      if (qrTimerInterval) {
        clearInterval(qrTimerInterval);
        qrTimerInterval = null;
      }
      qrGeneratedAt.value = null;
      qrTimeLeft.value = 60;
    }
  });

  // react to status changes for cleanup experience
  watch(selectedStatus, (newStatus, oldStatus) => {
    if (!oldStatus || newStatus === oldStatus) return;

    const ns = String(newStatus || "").toLowerCase();
    const os = String(oldStatus || "").toLowerCase();

    if (waitingDisconnect.value && (ns === "close" || ns === "closed" || ns === "disconnected")) {
      if (disconnectInterval) {
        clearInterval(disconnectInterval);
        disconnectInterval = null;
      }
      waitingDisconnect.value = false;
      toast?.success?.("Device berhasil terputus!");
    }

    if (ns === "open") {
      qr.value = "";
      asciiQr.value = "";
      statusText.value = "Berhasil terhubung! ✅";
      pairingLoading.value = false;
      apiError.value = "";

      if (controller) {
        try {
          controller.abort();
        } catch (_) {}
      }
      controller = null;
      controllerActive.value = false;
    }

    if ((os === "open" || os === "connected") && (ns === "close" || ns === "closed" || ns === "disconnected")) {
      pairingLoading.value = false;
      qr.value = "";
      asciiQr.value = "";
      statusText.value = "";
      apiError.value = "";

      if (controller) {
        try {
          controller.abort();
        } catch (_) {}
      }
      controller = null;
      controllerActive.value = false;

      toast?.warning?.("Device terputus dari WhatsApp. Silakan lakukan pairing ulang.");
    }
  });

  onUnmounted(() => {
    if (controller) {
      try {
        controller.abort();
      } catch (_) {}
    }

    if (qrTimerInterval) {
      clearInterval(qrTimerInterval);
      qrTimerInterval = null;
    }

    if (disconnectInterval) {
      clearInterval(disconnectInterval);
      disconnectInterval = null;
    }

    controller = null;
    controllerActive.value = false;
  });

  return {
    qr,
    asciiQr,
    statusText,
    pairingLoading,
    apiError,
    waitingDisconnect,
    disconnectCountdown,
    qrTimeLeft,
    qrExpired,
    controllerActive,

    startPairing,
    stopPairing,
    quickRetryPairing,
    selectNextDisconnectedDevice,
    onQRImageError,
  };
}
