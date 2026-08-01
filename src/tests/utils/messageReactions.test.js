import { describe, expect, it } from 'vitest';
import {
  applyMessageReactionEvent,
  findOwnMessageReaction,
  getMessageReactionTargetId,
  groupMessageReactions,
  sameConversationJid,
} from '../../utils/messageReactions.js';

describe('message reaction helpers', () => {
  it('adds, replaces, and removes one reaction per reactor', () => {
    const first = {
      targetMessageId: 'message-1',
      targetFromMe: true,
      reactorJid: '6281@s.whatsapp.net',
      emoji: '👍',
    };
    const added = applyMessageReactionEvent([], first);
    const replaced = applyMessageReactionEvent(added, { ...first, emoji: '❤️' });
    const removed = applyMessageReactionEvent(replaced, { ...first, emoji: '', removed: true });

    expect(added).toHaveLength(1);
    expect(replaced).toEqual([{ ...first, emoji: '❤️' }]);
    expect(removed).toEqual([]);
  });

  it('groups reactions only on the matching incoming or outgoing message', () => {
    const reactions = [
      { targetMessageId: 'wa-1', targetFromMe: true, reactorJid: 'a', emoji: '😂' },
      { targetMessageId: 'wa-1', targetFromMe: true, reactorJid: 'b', emoji: '😂' },
      { targetMessageId: 'wa-1', targetFromMe: false, reactorJid: 'c', emoji: '👍' },
    ];

    expect(groupMessageReactions({ type: 'outgoing', waMessageId: 'wa-1' }, reactions)).toEqual([
      { emoji: '😂', count: 2, title: '2 reaksi' },
    ]);
    expect(groupMessageReactions({ type: 'incoming', id: 'wa-1' }, reactions)).toEqual([
      { emoji: '👍', count: 1, title: '1 reaksi' },
    ]);
  });

  it('matches equivalent phone JIDs without matching group JIDs loosely', () => {
    expect(sameConversationJid('628123@s.whatsapp.net', '628123:9@s.whatsapp.net')).toBe(true);
    expect(sameConversationJid('123@g.us', '124@g.us')).toBe(false);
  });

  it('resolves a sendable target and the current account reaction', () => {
    const message = { type: 'outgoing', tempId: 'db-1', waMessageId: 'wa-1' };
    const reactions = [
      { targetMessageId: 'wa-1', targetFromMe: true, reactorJid: 'me', emoji: '👍' },
      { targetMessageId: 'wa-1', targetFromMe: true, reactorJid: 'other', emoji: '❤️' },
    ];

    expect(getMessageReactionTargetId(message)).toBe('wa-1');
    expect(findOwnMessageReaction(message, reactions)?.emoji).toBe('👍');
  });
});
