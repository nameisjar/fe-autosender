import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import BroadcastConfirmationModal from '../../components/BroadcastConfirmationModal.vue';

const items = [
  { label: 'Device', value: 'Nomor utama — 628123' },
  { label: 'Estimasi kirim', value: '4 kali' },
];

describe('BroadcastConfirmationModal', () => {
  const mountModal = (props = {}) => mount(BroadcastConfirmationModal, {
    props: {
      modelValue: true,
      items,
      ...props,
    },
    global: { stubs: { Teleport: true } },
  });

  it('shows the delivery summary and only confirms from the primary action', async () => {
    const wrapper = mountModal({ confirmLabel: 'Konfirmasi Jadwalkan' });

    expect(wrapper.text()).toContain('Nomor utama — 628123');
    expect(wrapper.text()).toContain('4 kali');
    await wrapper.get('.primary-button').trigger('click');

    expect(wrapper.emitted('confirm')).toHaveLength(1);
  });

  it('allows review cancellation while idle and locks actions during processing', async () => {
    const wrapper = mountModal();
    await wrapper.get('.secondary-button').trigger('click');
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]]);

    await wrapper.setProps({ loading: true });
    expect(wrapper.get('.primary-button').attributes('disabled')).toBeDefined();
    expect(wrapper.get('.secondary-button').attributes('disabled')).toBeDefined();
  });
});
