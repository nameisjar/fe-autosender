import { describe, expect, it } from "vitest";
import { buildMonthlyFeedbackCaption } from "../../utils/monthlyFeedbackCaption.js";

describe("buildMonthlyFeedbackCaption", () => {
  it("menyesuaikan seluruh nama siswa dan nama tutor", () => {
    const caption = buildMonthlyFeedbackCaption({
      studentName: "Raka Pratama",
      reportBy: "Niko Muhamad Fajar",
    });

    expect(caption).toContain("Halo, Ayah/Bunda dari Raka Pratama! 👋");
    expect(caption).toContain("Saya Niko Muhamad Fajar, tutor Raka Pratama");
    expect(caption.match(/Raka Pratama/g)).toHaveLength(9);
    expect(caption).not.toContain("Made Rafid Narendra");
  });

  it("memberikan fallback aman untuk nama kosong", () => {
    const caption = buildMonthlyFeedbackCaption();
    expect(caption).toContain("Ayah/Bunda dari Siswa");
    expect(caption).toContain("Saya Tutor, tutor Siswa");
  });
});
