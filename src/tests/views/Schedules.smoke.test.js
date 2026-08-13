import { beforeEach, describe, expect, it, vi } from "vitest";
import { shallowMount } from "@vue/test-utils";

vi.mock("../../api/http.js", () => ({
  deviceApi: {
    get: vi.fn(),
  },
  userApi: {
    delete: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

vi.mock("../../composables/useToast.js", () => ({
  useToast: () => ({
    error: vi.fn(),
    success: vi.fn(),
  }),
}));

import Schedules from "../../views/Schedules.vue";

describe("Schedules view", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders without a setup error", () => {
    const wrapper = shallowMount(Schedules);

    expect(wrapper.find(".wrapper").exists()).toBe(true);
    wrapper.unmount();
  });
});
