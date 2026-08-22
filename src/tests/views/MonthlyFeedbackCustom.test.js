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
  const writeText = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
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
    await rows[0].find(".comment-summary-button").trigger("click");
    const firstComment = wrapper.find(".comment-modal .comment-option").text();
    expect(firstComment).toContain("Mathew Enrico");
    expect(firstComment).not.toContain("M. Alghifari Setyawan");
    await wrapper.find(".comment-modal .modal-close").trigger("click");
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
    expect(wrapper.findAll(".defaults-grid label")).toHaveLength(5);
    expect(wrapper.findAll(".defaults-group")).toHaveLength(2);
    expect(wrapper.find(".identity-defaults-group").text()).toContain("Laporan dibuat oleh");
    expect(wrapper.find(".identity-defaults-group").text()).toContain("Link Referral");
    expect(wrapper.find("tbody .rating-select").exists()).toBe(true);
    const headers = wrapper.findAll("thead th").map((header) => header.text());
    expect(headers).toContain("Rating");
    expect(headers).toContain("Link YouTube");
    expect(headers.indexOf("Komentar") + 1).toBe(headers.indexOf("Link YouTube"));
    expect(headers).not.toContain("Komentar Custom");
    expect(headers).not.toContain("Link Referral");

    wrapper.unmount();
  });

  it("menerapkan default baru, menerima komentar kosong, dan menyalin caption dinamis", async () => {
    const wrapper = mount(MonthlyFeedbackCustom, {
      global: {
        stubs: { MonthlyFeedbackPDFTemplate: true },
      },
    });
    await flushPromises();

    await wrapper.find(".default-course").setValue("Python Start_2_IND");
    await wrapper.find(".default-month").setValue("5");
    await wrapper.find(".default-report-by").setValue("Niko Muhamad Fajar");
    await wrapper.find(".default-youtube").setValue("https://youtu.be/contoh");
    await wrapper.find(".default-referral").setValue("https://algonova.id/invite/contoh");

    await wrapper.find(".paste-layout textarea").setValue("Raka Pratama");
    await findButton(wrapper, "Tambahkan Nama").trigger("click");

    const row = wrapper.find("tbody tr");
    expect(row.find(".course-select").element.value).toBe("Python Start_2_IND");
    expect(row.find(".month-select").element.value).toBe("5");
    expect(row.find(".link-input").element.value).toBe("https://youtu.be/contoh");
    expect(row.find(".comment-summary-button").text()).toContain("Belum ada komentar");
    expect(row.find(".status-pill.ready").exists()).toBe(true);

    await row.find('button[title="Salin caption"]').trigger("click");
    await flushPromises();

    expect(writeText).toHaveBeenCalledOnce();
    expect(writeText.mock.calls[0][0]).toContain("Halo, Ayah/Bunda dari Raka Pratama! 👋");
    expect(writeText.mock.calls[0][0]).toContain("Saya Niko Muhamad Fajar, tutor Raka Pratama");
    expect(toast.success).toHaveBeenCalledWith("Caption Raka Pratama berhasil disalin");

    wrapper.unmount();
  });

  it("menerapkan default feedback dan identitas secara terpisah ke siswa terpilih", async () => {
    const wrapper = mount(MonthlyFeedbackCustom, {
      global: {
        stubs: { MonthlyFeedbackPDFTemplate: true },
      },
    });
    await flushPromises();

    await wrapper.find(".paste-layout textarea").setValue("Raka Pratama\nBudi Santoso");
    await findButton(wrapper, "Tambahkan Nama").trigger("click");

    await wrapper.find(".default-course").setValue("Python Start_2_IND");
    await wrapper.find(".default-month").setValue("5");
    await wrapper.find(".default-youtube").setValue("https://youtu.be/default");
    await wrapper.find(".default-report-by").setValue("Niko Muhamad Fajar");
    await wrapper.find(".default-referral").setValue("https://algonova.id/invite/default");

    const rows = wrapper.findAll("tbody tr");
    await rows[0].find('.select-column input[type="checkbox"]').setValue(true);
    await wrapper.find(".apply-feedback-defaults").trigger("click");

    expect(rows[0].find(".course-select").element.value).toBe("Python Start_2_IND");
    expect(rows[0].find(".link-input").element.value).toBe("https://youtu.be/default");
    expect(rows[1].find(".course-select").element.value).toBe("");
    expect(rows[0].find(".status-pill.incomplete").exists()).toBe(true);
    expect(toast.success).toHaveBeenCalledWith("Default feedback diterapkan ke 1 siswa");

    await wrapper.find(".apply-identity-defaults").trigger("click");
    expect(toast.success).toHaveBeenCalledWith("Identitas laporan diterapkan ke 1 siswa");

    await rows[0].find('button[title="Salin caption"]').trigger("click");
    await flushPromises();
    expect(writeText.mock.calls.at(-1)[0]).toContain("Saya Niko Muhamad Fajar, tutor Raka Pratama");

    await rows[1].find('button[title="Salin caption"]').trigger("click");
    expect(toast.warning).toHaveBeenCalledWith("Isi nama tutor sebelum menyalin caption");

    wrapper.unmount();
  });

  it("menyimpan komentar modal per siswa, mendukung custom, dan menyalin feedback tutor", async () => {
    const wrapper = mount(MonthlyFeedbackCustom, {
      global: {
        stubs: { MonthlyFeedbackPDFTemplate: true },
      },
    });
    await flushPromises();

    await wrapper.find(".paste-layout textarea").setValue("Raka Pratama");
    await findButton(wrapper, "Tambahkan Nama").trigger("click");

    let row = wrapper.find("tbody tr");
    await row.find(".comment-summary-button").trigger("click");
    const options = wrapper.findAll(".comment-option input");
    await options[0].setValue(true);
    await findButton(wrapper, "+ Tambah Custom").trigger("click");
    await wrapper.find(".custom-comment-editor textarea").setValue(
      "{{firstname}} menunjukkan perkembangan yang baik.",
    );
    expect(wrapper.find(".comment-limit-badge").text()).toContain("2 / 3");
    await findButton(wrapper, "Simpan Komentar").trigger("click");

    row = wrapper.find("tbody tr");
    expect(row.find(".comment-summary-button").text()).toContain("2/3 komentar");
    expect(row.find(".comment-summary-button").text()).toContain("1 custom");

    await row.find('button[title="Salin komentar tutor"]').trigger("click");
    await flushPromises();
    const copiedFeedback = writeText.mock.calls.at(-1)[0];
    expect(copiedFeedback).toContain("Raka Pratama selalu hadir");
    expect(copiedFeedback).toContain("Raka Pratama menunjukkan perkembangan yang baik.");
    expect(copiedFeedback).toContain("\n\n");
    expect(copiedFeedback).not.toContain("M. Alghifari Setyawan");
    expect(toast.success).toHaveBeenCalledWith("Komentar Raka Pratama berhasil disalin");

    wrapper.unmount();
  });
});
