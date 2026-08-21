import { defineComponent, h } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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

const notificationHarness = vi.hoisted(() => ({
  info: vi.fn(),
  update: vi.fn(),
  push: vi.fn(() => Promise.resolve()),
}));

vi.mock('../../api/socket.js', () => ({
  connectSocket: vi.fn(() => socketHarness.socket),
  getSocket: vi.fn(() => socketHarness.socket),
}));

vi.mock('../../api/http.js', () => ({
  API_BASE: '',
  userApi: {
    get: vi.fn(),
  },
}));

vi.mock('../../composables/useToast.js', () => ({
  useToast: () => ({
    info: notificationHarness.info,
    update: notificationHarness.update,
  }),
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: notificationHarness.push }),
}));

import { userApi } from '../../api/http.js';
import { useGlobalNotifications } from '../../composables/useGlobalNotifications.js';

describe('useGlobalNotifications', () => {
  beforeEach(() => {
    socketHarness.listeners.clear();
    socketHarness.socket.on.mockClear();
    socketHarness.socket.off.mockClear();
    notificationHarness.info.mockClear();
    notificationHarness.info.mockReturnValue('toast-1');
    notificationHarness.update.mockClear();
    notificationHarness.push.mockClear();
    localStorage.getItem.mockReturnValue('jwt-token');
    userApi.get.mockResolvedValue({
      data: [{ id: 'device-1', sessionId: 'session-1' }],
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
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

  it('opens the exact Inbox message when an incoming toast is clicked', async () => {
    const wrapper = mount(defineComponent({
      setup() {
        useGlobalNotifications();
        return () => h('div');
      },
    }));

    await flushPromises();
    const [incomingHandler] = socketHarness.listeners.get('incoming:session-1');
    incomingHandler({
      id: 'message-1',
      from: '628123@s.whatsapp.net',
      message: 'Halo',
      pushName: 'Niko',
    });

    expect(notificationHarness.info).toHaveBeenCalledWith(
      'Halo',
      6000,
      expect.objectContaining({
        title: 'Niko',
        description: 'Halo',
        avatarFallback: 'N',
        onClick: expect.any(Function),
        ariaLabel: 'Buka pesan dari Niko',
      }),
    );

    const options = notificationHarness.info.mock.calls[0][2];
    await options.onClick();
    expect(notificationHarness.push).toHaveBeenCalledWith({
      name: 'inbox',
      query: {
        device: 'device-1',
        conversation: '628123@s.whatsapp.net',
        message: 'message-1',
        displayName: 'Niko',
        isGroup: 'false',
        profilePicUrl: '',
      },
    });

    wrapper.unmount();
  });

  it('shows only one toast when the same incoming message event is repeated', async () => {
    const wrapper = mount(defineComponent({
      setup() {
        useGlobalNotifications();
        return () => h('div');
      },
    }));

    await flushPromises();
    const [incomingHandler] = socketHarness.listeners.get('incoming:session-1');
    const message = {
      id: 'duplicate-message-1',
      from: '628123@s.whatsapp.net',
      message: 'Pesan yang sama',
      pushName: 'Alya',
    };

    incomingHandler(message);
    incomingHandler(message);
    incomingHandler(message);

    expect(notificationHarness.info).toHaveBeenCalledTimes(1);
    wrapper.unmount();
  });

  it('keeps the WhatsApp group name when a group notification opens Inbox', async () => {
    const wrapper = mount(defineComponent({
      setup() {
        useGlobalNotifications();
        return () => h('div');
      },
    }));

    await flushPromises();
    const [incomingHandler] = socketHarness.listeners.get('incoming:session-1');
    incomingHandler({
      id: 'group-message-1',
      from: '120363421277671136@g.us',
      message: 'Halo grup',
      pushName: 'Niko',
      groupName: 'IND 1-1 PS2 607',
      groupPicUrl: '/inbox-profile/device-1/group',
    });

    expect(notificationHarness.info).toHaveBeenCalledWith(
      'Niko: Halo grup',
      6000,
      expect.objectContaining({
        title: 'IND 1-1 PS2 607',
        avatarUrl: '/inbox-profile/device-1/group',
      }),
    );
    await notificationHarness.info.mock.calls[0][2].onClick();
    expect(notificationHarness.push).toHaveBeenCalledWith({
      name: 'inbox',
      query: expect.objectContaining({
        conversation: '120363421277671136@g.us',
        displayName: 'IND 1-1 PS2 607',
        isGroup: 'true',
        profilePicUrl: '/inbox-profile/device-1/group',
      }),
    });

    wrapper.unmount();
  });

  it('shows clickable Windows/browser notifications whether the tab is active or hidden', async () => {
    const nativeNotifications = [];
    class FakeNotification {
      static permission = 'granted';

      constructor(title, options) {
        this.title = title;
        this.options = options;
        this.close = vi.fn();
        nativeNotifications.push(this);
      }
    }
    vi.stubGlobal('Notification', FakeNotification);
    let visibilityState = 'visible';
    let hasFocus = true;
    vi.spyOn(document, 'visibilityState', 'get').mockImplementation(() => visibilityState);
    vi.spyOn(document, 'hasFocus').mockImplementation(() => hasFocus);
    const focusSpy = vi.spyOn(window, 'focus').mockImplementation(() => {});

    const wrapper = mount(defineComponent({
      setup() {
        useGlobalNotifications();
        return () => h('div');
      },
    }));
    await flushPromises();

    const [incomingHandler] = socketHarness.listeners.get('incoming:session-1');
    incomingHandler({
      id: 'background-message-1',
      from: '628123@s.whatsapp.net',
      message: 'Pesan latar belakang',
      contact: { firstName: 'Niko', lastName: 'Algonova' },
      profilePicUrl: '/inbox-profile/device-1/niko',
    });

    expect(nativeNotifications).toHaveLength(1);
    expect(nativeNotifications[0].title).toBe('Niko Algonova');
    expect(nativeNotifications[0].options).toEqual(expect.objectContaining({
      body: 'Pesan latar belakang',
      icon: expect.stringContaining('/inbox-profile/device-1/niko'),
    }));

    visibilityState = 'hidden';
    hasFocus = false;
    incomingHandler({
      id: 'hidden-message-1',
      from: '628456@s.whatsapp.net',
      message: 'Pesan saat tab tersembunyi',
      pushName: 'Alya',
      profilePicUrl: '/inbox-profile/device-1/alya',
    });
    expect(nativeNotifications).toHaveLength(2);

    nativeNotifications[0].onclick();
    await flushPromises();
    expect(focusSpy).toHaveBeenCalledOnce();
    expect(notificationHarness.push).toHaveBeenCalledWith(expect.objectContaining({
      name: 'inbox',
    }));
    expect(nativeNotifications[0].close).toHaveBeenCalledOnce();
    wrapper.unmount();
  });

  it('requests browser notification permission after a user gesture only once', async () => {
    class FakeNotification {
      static permission = 'default';
      static requestPermission = vi.fn().mockResolvedValue('granted');
    }
    vi.stubGlobal('Notification', FakeNotification);

    const wrapper = mount(defineComponent({
      setup() {
        useGlobalNotifications();
        return () => h('div');
      },
    }));
    await flushPromises();

    expect(FakeNotification.requestPermission).not.toHaveBeenCalled();
    document.dispatchEvent(new Event('pointerdown'));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    await flushPromises();

    expect(FakeNotification.requestPermission).toHaveBeenCalledOnce();
    wrapper.unmount();
  });

  it('updates a personal or group toast when the profile picture arrives later', async () => {
    const wrapper = mount(defineComponent({
      setup() {
        useGlobalNotifications();
        return () => h('div');
      },
    }));
    await flushPromises();

    const [incomingHandler] = socketHarness.listeners.get('incoming:session-1');
    const [profileHandler] = socketHarness.listeners.get(
      'incoming:session-1:profile-updated',
    );
    incomingHandler({
      id: 'late-avatar-message',
      from: '628123@s.whatsapp.net',
      message: 'Halo',
      pushName: 'Niko',
      profilePicUrl: null,
    });
    profileHandler({
      id: 'late-avatar-message',
      from: '628123@s.whatsapp.net',
      profilePicUrl: '/inbox-profile/device-1/628123',
      profilePictureStatus: 'available',
    });

    expect(notificationHarness.update).toHaveBeenCalledWith('toast-1', {
      avatarUrl: '/inbox-profile/device-1/628123',
      avatarStatus: 'available',
      avatarFallback: 'N',
    });
    wrapper.unmount();
  });
});
