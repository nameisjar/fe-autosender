import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import ToastContainer from '../../components/ToastContainer.vue';

describe('ToastContainer', () => {
  const mountToastContainer = options => mount(ToastContainer, {
    attachTo: document.body,
    global: {
      stubs: {
        CachedProfileImage: {
          props: ['src', 'status', 'alt'],
          template: '<img :src="src" :alt="alt" />',
        },
      },
    },
    ...options,
  });

  it('runs a toast action and removes the notification when clicked', async () => {
    const onClick = vi.fn();
    const wrapper = mountToastContainer();

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
    const wrapper = mountToastContainer();

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

  it('renders a WhatsApp avatar, title, and message preview', async () => {
    const wrapper = mountToastContainer();

    const toastId = wrapper.vm.addToast({
      message: 'Halo',
      type: 'info',
      title: 'Niko Algonova',
      description: 'Halo dari WhatsApp',
      avatarUrl: '/profile/niko.jpg',
      avatarFallback: 'NA',
    });
    await wrapper.vm.$nextTick();

    expect(document.body.querySelector('.toast-title').textContent).toBe('Niko Algonova');
    expect(document.body.querySelector('.toast-message').textContent).toBe('Halo dari WhatsApp');
    expect(document.body.querySelector('.toast-avatar img').getAttribute('src'))
      .toBe('/profile/niko.jpg');

    wrapper.vm.updateToast(toastId, {
      avatarUrl: '/profile/niko-updated.jpg',
    });
    await wrapper.vm.$nextTick();
    expect(document.body.querySelector('.toast-avatar img').getAttribute('src'))
      .toBe('/profile/niko-updated.jpg');
    wrapper.unmount();
  });

  it('keeps a background-tab toast until the page becomes visible', async () => {
    vi.useFakeTimers();
    let visibilityState = 'hidden';
    const visibilitySpy = vi.spyOn(document, 'visibilityState', 'get')
      .mockImplementation(() => visibilityState);
    const wrapper = mountToastContainer();

    wrapper.vm.addToast({
      message: 'Pesan saat tab tidak aktif',
      type: 'info',
      duration: 5000,
    });
    await wrapper.vm.$nextTick();

    vi.advanceTimersByTime(10_000);
    await wrapper.vm.$nextTick();
    expect(document.body.querySelector('.toast')).not.toBeNull();

    visibilityState = 'visible';
    document.dispatchEvent(new Event('visibilitychange'));
    vi.advanceTimersByTime(5000);
    await wrapper.vm.$nextTick();
    expect(document.body.querySelector('.toast')).toBeNull();

    wrapper.unmount();
    visibilitySpy.mockRestore();
    vi.useRealTimers();
  });
});
