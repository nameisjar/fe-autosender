import { describe, expect, it } from 'vitest';
import {
  insertComposerCharacter,
  shouldRedirectInboxTyping,
} from '../../utils/inboxComposer.js';

describe('Inbox composer keyboard fallback', () => {
  it('redirects a printable key when a conversation is open outside an interactive control', () => {
    expect(shouldRedirectInboxTyping({
      key: 'h',
      target: document.body,
    }, { conversationOpen: true })).toBe(true);
  });

  it('does not interfere with controls, shortcuts, overlays, or composition', () => {
    const input = document.createElement('input');
    const button = document.createElement('button');
    expect(shouldRedirectInboxTyping({ key: 'h', target: input }, { conversationOpen: true })).toBe(false);
    expect(shouldRedirectInboxTyping(
      { key: 'h', target: input },
      { conversationOpen: true, targetIsExternal: true },
    )).toBe(true);
    expect(shouldRedirectInboxTyping({ key: ' ', target: button }, { conversationOpen: true })).toBe(false);
    expect(shouldRedirectInboxTyping({ key: 'c', ctrlKey: true, target: document.body }, { conversationOpen: true })).toBe(false);
    expect(shouldRedirectInboxTyping({ key: 'h', target: document.body }, { conversationOpen: true, blocked: true })).toBe(false);
    expect(shouldRedirectInboxTyping({ key: 'Process', isComposing: true }, { conversationOpen: true })).toBe(false);
  });

  it('inserts the first typed character at the current selection', () => {
    expect(insertComposerCharacter('halo', 'y', 1, 3)).toEqual({
      value: 'hyo',
      caret: 2,
    });
    expect(insertComposerCharacter('', 'a')).toEqual({ value: 'a', caret: 1 });
  });
});
