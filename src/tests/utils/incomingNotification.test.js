import { describe, expect, it } from 'vitest';
import {
  buildIncomingNotification,
} from '../../utils/incomingNotification.js';

describe('incoming notification presentation', () => {
  it('prefers a saved contact and personal WhatsApp photo', () => {
    expect(buildIncomingNotification({
      from: '628123456789@s.whatsapp.net',
      message: 'Halo',
      pushName: 'Nama Profil',
      contact: { firstName: 'Nama', lastName: 'Kontak' },
      profilePicUrl: '/profile/contact',
    })).toEqual(expect.objectContaining({
      title: 'Nama Kontak',
      description: 'Halo',
      avatarUrl: '/profile/contact',
      avatarFallback: 'NK',
    }));
  });

  it('uses the group identity while retaining the member name in the preview', () => {
    expect(buildIncomingNotification({
      from: '120363001@g.us',
      participant: '628111@s.whatsapp.net',
      message: 'Besok kelas tetap ada',
      pushName: 'Niko',
      groupName: 'Kelas A',
      groupPicUrl: '/profile/group',
    })).toEqual(expect.objectContaining({
      title: 'Kelas A',
      senderName: 'Niko',
      description: 'Niko: Besok kelas tetap ada',
      avatarUrl: '/profile/group',
    }));
  });

  it('falls back to a formatted WhatsApp number', () => {
    expect(buildIncomingNotification({
      from: '628123456789:7@s.whatsapp.net',
      message: 'Halo',
    }).title).toBe('+628123456789');
  });

  it('uses the poll question instead of a generic message placeholder', () => {
    expect(buildIncomingNotification({
      from: '628123456789@s.whatsapp.net',
      message: '[Pesan]',
      pollData: {
        question: 'Pilih jadwal kelas',
        selectableOptionsCount: 1,
        totalVotes: 0,
        options: [
          { id: 'pagi', name: 'Pagi', voteCount: 0 },
          { id: 'malam', name: 'Malam', voteCount: 0 },
        ],
      },
    }).description).toBe('📊 Polling: Pilih jadwal kelas');
  });

});
