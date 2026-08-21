import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import DevicePicker from '../../components/DevicePicker.vue';

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('../../composables/useDevices.js', async () => {
  const { computed, ref } = await import('vue');
  const selectedDeviceId = ref('1');
  const device = {
    id: '1',
    name: 'Nomor utama',
    phone: '628123456789',
    status: 'open',
    isConnected: true,
    isReconnecting: false,
    connectionLabel: 'Terhubung',
    canManage: true,
    health: { healthStatus: 'healthy' },
  };

  return {
    useDevices: () => ({
      selectedDeviceId,
      selectedDevice: computed(() => device),
      availableDevices: computed(() => [device]),
      loading: ref(false),
      loadDevices: vi.fn().mockResolvedValue([device]),
      selectDevice: vi.fn(),
      fetchDeviceHealth: vi.fn().mockResolvedValue(device.health),
      fetchDeviceSignals: vi.fn().mockResolvedValue([]),
      selectedDeviceHealth: computed(() => device.health),
      getHealthBadge: () => ({ label: 'Baik', color: 'green' }),
      pauseDevice: vi.fn(),
      resumeDevice: vi.fn(),
    }),
  };
});

const mountPicker = (variant) => mount(DevicePicker, {
  props: { variant },
  global: {
    stubs: {
      Teleport: true,
      RouterLink: {
        props: ['to'],
        template: '<a :href="to"><slot /></a>',
      },
    },
  },
});

describe('DevicePicker sidebar', () => {
  it('opens the sidebar selector as a scrollable dropdown with a management link', async () => {
    const wrapper = mountPicker('sidebar');

    expect(wrapper.find('[aria-label="Buka detail kesehatan device"]').exists()).toBe(true);
    await wrapper.get('[aria-label="Ganti device aktif"]').trigger('click');

    expect(wrapper.find('.device-list-compact--dropdown').exists()).toBe(true);
    expect(wrapper.text()).toContain('Pilih device');
    expect(wrapper.text()).toContain('Kelola device dan health');
  });
});
