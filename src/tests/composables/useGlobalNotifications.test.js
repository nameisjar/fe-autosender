import { defineComponent, h } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const socketHarness = vi.hoisted(() => {
  const listeners = new Map();

  const socket = {
    connected: true,
    on: vi.fn((eventName, handler) => {
      const eventHandlers = listeners.get(eventName) || [];
      eventHandlers.push(handler);
      listeners.set(eventName, eventHandlers);
    }),
    off: vi.fn((eventName, handler) => {
      if (!handler) {
        listeners.delete(eventName);
        return;
      }
      const eventHandlers = listeners.get(eventName) || [];
      listeners.set(eventName, eventHandlers.filter(candidate => candidate !== handler));
    }),
  };

  return { listeners, socket };
});

vi.mock('../../api/socket.js', () => ({
  connectSocket: vi.fn(() => socketHarness.socket),
  getSocket: vi.fn(() => socketHarness.socket),
}));

vi.mock('../../api/http.js', () => ({
  userApi: {
    get: vi.fn(),
  },
}));

vi.mock('../../composables/useToast.js', () => ({
  useToast: () => ({ info: vi.fn() }),
}));

import { userApi } from '../../api/http.js';
import { useGlobalNotifications } from '../../composables/useGlobalNotifications.js';

describe('useGlobalNotifications', () => {
  beforeEach(() => {
    socketHarness.listeners.clear();
    socketHarness.socket.on.mockClear();
    socketHarness.socket.off.mockClear();
    localStorage.getItem.mockReturnValue('jwt-token');
    userApi.get.mockResolvedValue({
      data: [{ id: 'device-1', sessionId: 'session-1' }],
    });
  });

  it('keeps other incoming-message listeners registered', async () => {
    const inboxHandler = vi.fn();
    socketHarness.socket.on('incoming:session-1', inboxHandler);

    const wrapper = mount(defineComponent({
      setup() {
        useGlobalNotifications();
        return () => h('div');
      },
    }));

    await flushPromises();

    expect(socketHarness.listeners.get('incoming:session-1')).toContain(inboxHandler);
    expect(socketHarness.listeners.get('incoming:session-1')).toHaveLength(2);

    wrapper.unmount();

    expect(socketHarness.listeners.get('incoming:session-1')).toEqual([inboxHandler]);
  });

  it('starts listening when the user logs in after App is already mounted', async () => {
    let token = null;
    localStorage.getItem.mockImplementation(() => token);
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

    const wrapper = mount(defineComponent({
      setup() {
        useGlobalNotifications();
        return () => h('div');
      },
    }));

    await flushPromises();
    expect(socketHarness.listeners.get('incoming:session-1')).toBeUndefined();

    token = 'jwt-token';
    const loginHandler = addEventListenerSpy.mock.calls.find(
      ([eventName]) => eventName === 'user:logged-in',
    )?.[1];
    expect(loginHandler).toBeTypeOf('function');
    loginHandler();
    await new Promise(resolve => setTimeout(resolve, 150));
    await flushPromises();

    expect(socketHarness.listeners.get('incoming:session-1')).toHaveLength(1);
    wrapper.unmount();
    addEventListenerSpy.mockRestore();
  });
});
