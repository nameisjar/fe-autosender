import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";

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

vi.mock("../../composables/useChatTemplates.js", async () => {
  const { ref } = await import("vue");
  const chatTemplates = ref([
    {
      id: "template-1",
      title: "Extra Class",
      message: "Halo {{siswa}}, jadwal Extra Class sudah tersedia.",
    },
  ]);

  return {
    useChatTemplates: () => ({
      chatTemplates,
      loadingChatTemplates: ref(false),
      loadChatTemplates: vi.fn().mockResolvedValue(chatTemplates.value),
    }),
  };
});

import Broadcasts from "../../views/Broadcasts.vue";
import ReminderAlgo from "../../views/ReminderAlgo.vue";
import ScheduleReminder from "../../views/ScheduleReminder.vue";

const stubs = {
  DevicePicker: true,
  MediaUpload: true,
  RecipientsPicker: true,
  RouterLink: {
    template: "<a><slot /></a>",
  },
};

describe.each([
  ["Broadcast", Broadcasts, "#broadcast-message-label"],
  ["Broadcast Berulang", ScheduleReminder, "#recurring-message-label"],
  ["Reminder (Algo)", ReminderAlgo, "#reminder-message-label"],
])("pemilih custom template di halaman %s", (_, View, labelSelector) => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = "";
  });

  it("mengisi pesan hanya setelah custom template dipilih", async () => {
    const wrapper = mount(View, {
      attachTo: document.body,
      global: { stubs },
    });
    const message = wrapper.find(`textarea[aria-labelledby="${labelSelector.slice(1)}"]`);

    await wrapper.find(labelSelector).trigger("click");

    expect(message.element.value).toBe("");
    expect(toast.success).not.toHaveBeenCalled();

    await wrapper.find(".btn-template-picker").trigger("click");
    await flushPromises();

    expect(message.element.value).toBe("");

    document.querySelector(".chat-template-select-item").click();
    await flushPromises();

    expect(message.element.value).toBe(
      "Halo {{siswa}}, jadwal Extra Class sudah tersedia."
    );
    expect(toast.success).toHaveBeenCalledTimes(1);
    expect(document.querySelector(".chat-template-select-backdrop")).toBeNull();

    wrapper.unmount();
  });
});
