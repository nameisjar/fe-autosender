import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";

const toast = {
  error: vi.fn(),
  success: vi.fn(),
  warning: vi.fn(),
};

vi.mock("../../api/http.js", () => ({
  deviceApi: {
    post: vi.fn(),
  },
}));

vi.mock("../../composables/useToast.js", () => ({
  useToast: () => toast,
}));

import Broadcasts from "../../views/Broadcasts.vue";
import ReminderAlgo from "../../views/ReminderAlgo.vue";

const stubs = {
  DevicePicker: true,
  MediaUpload: true,
  RecipientsPicker: true,
};

describe.each([
  ["Broadcast", Broadcasts, "#broadcast-message-label"],
  ["Reminder (Algo)", ReminderAlgo, "#reminder-message-label"],
])("pemilih template di halaman %s", (_, View, labelSelector) => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("hanya menerapkan template ketika tombol template diklik", async () => {
    const wrapper = mount(View, { global: { stubs } });
    const message = wrapper.find("textarea[aria-labelledby]");

    await wrapper.find(labelSelector).trigger("click");

    expect(message.element.value).toBe("");
    expect(toast.success).not.toHaveBeenCalled();

    await wrapper.find(`${labelSelector} .badge-template`).trigger("click");

    expect(message.element.value).not.toBe("");
    expect(toast.success).toHaveBeenCalledTimes(1);

    wrapper.unmount();
  });
});
