import { beforeEach, describe, expect, it } from 'vitest';
import { useInboxUnread } from '../../composables/useInboxUnread.js';

describe('useInboxUnread', () => {
  const unread = useInboxUnread();

  beforeEach(() => {
    unread.setUnreadCount('device-a', 0);
  });

  it('tracks incoming and read messages without going below zero', () => {
    unread.incrementUnreadCount('device-a', 3);
    expect(unread.unreadByDevice.value['device-a']).toBe(3);

    unread.decrementUnreadCount('device-a', 2);
    expect(unread.unreadByDevice.value['device-a']).toBe(1);

    unread.decrementUnreadCount('device-a', 10);
    expect(unread.unreadByDevice.value['device-a']).toBe(0);
  });
});
