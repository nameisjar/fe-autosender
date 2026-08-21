import { describe, expect, it } from 'vitest';
import { resolveReactionMemberIdentity } from '../../utils/messageReactions.js';

describe('reaction member identity', () => {
  it('shows a resolved name with its phone number', () => {
    expect(resolveReactionMemberIdentity({
      reactorJid: '6285228000522@s.whatsapp.net',
      reactorDisplayName: 'Rohani Suci',
      reactorPhone: '6285228000522',
    })).toEqual({
      name: 'Rohani Suci',
      phone: '+6285228000522',
    });
  });

  it('does not repeat a phone number when no name is available', () => {
    expect(resolveReactionMemberIdentity({
      reactorJid: '6285228000522@s.whatsapp.net',
      reactorPhone: '6285228000522',
    })).toEqual({
      name: '+6285228000522',
      phone: '',
    });
  });

  it('does not expose a linked-device identifier as a phone number', () => {
    expect(resolveReactionMemberIdentity({
      reactorJid: '123456789@lid',
    })).toEqual({
      name: 'Tidak dikenal',
      phone: '',
    });
  });
});
