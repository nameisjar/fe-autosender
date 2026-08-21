import { describe, expect, it } from 'vitest';
import { canShowMessageReaders } from '../../utils/messageReadReceipts.js';

describe('message read receipt visibility', () => {
  it('never shows the reader list in a personal chat', () => {
    expect(canShowMessageReaders(
      { type: 'outgoing', isGroup: false, readCount: 1 },
      { isGroup: false },
    )).toBe(false);
  });

  it('shows readers only for an outgoing group message with readers', () => {
    expect(canShowMessageReaders(
      { type: 'outgoing', isGroup: true, readCount: 2 },
      { isGroup: true },
    )).toBe(true);
    expect(canShowMessageReaders(
      { type: 'incoming', isGroup: true, readCount: 2 },
      { isGroup: true },
    )).toBe(false);
  });
});
