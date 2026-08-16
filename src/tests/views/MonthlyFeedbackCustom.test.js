import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";

const toast = {
  error: vi.fn(),
  success: vi.fn(),
  warning: vi.fn(),
};

vi.mock("../../api/http.js", () => ({
  userApi: {
    get: vi.fn().mockResolvedValue({
      data: {
        templates: [
          {
            courseName: "Python Start_2_IND",
            month: 5,
            level: "Python Start 2",
            code: "PS2-05",
            topicModule: "Algoritma Linear",
            result: "Siswa memahami materi",
            skillsAcquired: "Berpikir algoritmis",
          },
        ],
      },
    }),
    post: vi.fn(),
  },
}));

vi.mock("../../composables/useToast.js", () => ({
  useToast: () => toast,
}));

import MonthlyFeedbackCustom from "../../views/MonthlyFeedbackCustom.vue";

const findButton = (wrapper, label) =>
  wrapper.findAll("button").find((button) => button.text().includes(label));

describe("MonthlyFeedbackCustom view", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("mengubah nama hasil copy dari Sheets menjadi baris siswa", async () => {
    const wrapper = mount(MonthlyFeedbackCustom, {
      global: {
        stubs: { MonthlyFeedbackPDFTemplate: true },
      },
    });
    await flushPromises();

    await wrapper.find(".paste-layout textarea").setValue("Mathew Enrico\nYuri Yuri\n\n");
    await findButton(wrapper, "Tambahkan Nama").trigger("click");

    const rows = wrapper.findAll("tbody tr");
    expect(rows).toHaveLength(2);
    expect(rows[0].find(".name-input").element.value).toBe("Mathew Enrico");
    expect(rows[1].find(".name-input").element.value).toBe("Yuri Yuri");
    const firstComment = rows[0].find(".comment-select option:nth-child(2)").text();
    expect(firstComment).toContain("Mathew Enrico");
    expect(firstComment).not.toContain("M. Alghifari Setyawan");
    expect(toast.success).toHaveBeenCalledWith("2 siswa berhasil ditambahkan");
    expect(wrapper.text()).not.toContain("Device WhatsApp");

    await rows[0].find(".status-pill.incomplete").trigger("click");
    expect(wrapper.find(".status-popover").exists()).toBe(true);
    document.body.click();
    await wrapper.vm.$nextTick();
    expect(wrapper.find(".status-popover").exists()).toBe(false);

    wrapper.unmount();
  });

  it("menampilkan course dari template pada setiap baris siswa", async () => {
    const wrapper = mount(MonthlyFeedbackCustom, {
      global: {
        stubs: { MonthlyFeedbackPDFTemplate: true },
      },
    });
    await flushPromises();

    await wrapper.find(".paste-layout textarea").setValue("Raka");
    await findButton(wrapper, "Tambahkan Nama").trigger("click");

    const courseOptions = wrapper.findAll("tbody .course-select option").map((option) => option.text());
    expect(courseOptions).toContain("Python Start_2_IND");
    expect(wrapper.findAll(".defaults-grid label")).toHaveLength(2);
    expect(wrapper.find("tbody .rating-select").exists()).toBe(true);
    const headers = wrapper.findAll("thead th").map((header) => header.text());
    expect(headers).toContain("Rating");
    expect(headers).toContain("Link YouTube");
    expect(headers).not.toContain("Link Referral");

    wrapper.unmount();
  });
});
