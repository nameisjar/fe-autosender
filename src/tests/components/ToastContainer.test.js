import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import ToastContainer from '../../components/ToastContainer.vue';

describe('ToastContainer', () => {
  it('runs a toast action and removes the notification when clicked', async () => {
    const onClick = vi.fn();
    const wrapper = mount(ToastContainer, { attachTo: document.body });

    wrapper.vm.addToast({
      message: 'Pesan baru',
      type: 'info',
      duration: 5000,
      onClick,
    });
    await wrapper.vm.$nextTick();

    document.body.querySelector('.toast').click();
    await wrapper.vm.$nextTick();
    expect(onClick).toHaveBeenCalledOnce();
    expect(document.body.querySelector('.toast')).toBeNull();
    wrapper.unmount();
  });

  it('closes without running the toast action when the close button is clicked', async () => {
    const onClick = vi.fn();
    const wrapper = mount(ToastContainer, { attachTo: document.body });

    wrapper.vm.addToast({
      message: 'Pesan baru',
      type: 'info',
      duration: 5000,
      onClick,
    });
    await wrapper.vm.$nextTick();

    document.body.querySelector('.toast-close').click();
    await wrapper.vm.$nextTick();
    expect(onClick).not.toHaveBeenCalled();
    expect(document.body.querySelector('.toast')).toBeNull();
    wrapper.unmount();
  });
});
