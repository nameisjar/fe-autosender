import { describe, expect, it } from 'vitest';
import {
  arePollVoteSelectionsEqual,
  getNextPollVoteSelection,
  getPollOptionPercentage,
  getPollPreview,
  normalizeMessagePoll,
} from '../../utils/messagePoll.js';

describe('WhatsApp polling presentation', () => {
  const poll = {
    question: 'Pilih jadwal kelas',
    selectableOptionsCount: 1,
    totalVotes: 4,
    options: [
      {
        id: 'pagi',
        name: 'Pagi',
        voteCount: 3,
        voters: [{
          name: 'Niko',
          phone: '+62812',
          profilePicUrl: '/inbox-profile/device/62812',
          profileStatus: 'available',
          votedAt: '2026-08-22T01:00:00Z',
        }],
      },
      { id: 'malam', name: 'Malam', voteCount: 1 },
    ],
    mySelectedOptionIds: ['pagi'],
  };

  it('normalizes a structured poll and preserves aggregate votes', () => {
    expect(normalizeMessagePoll(poll)).toEqual(expect.objectContaining({
      question: 'Pilih jadwal kelas',
      totalVotes: 4,
      selectableOptionsCount: 1,
    }));
    expect(normalizeMessagePoll(poll).options).toHaveLength(2);
    expect(normalizeMessagePoll(poll).options[0].voters[0].name).toBe('Niko');
    expect(normalizeMessagePoll(poll).options[0].voters[0].profilePicUrl)
      .toBe('/inbox-profile/device/62812');
    expect(normalizeMessagePoll(poll).mySelectedOptionIds).toEqual(['pagi']);
  });

  it('formats poll previews and option percentages', () => {
    expect(getPollPreview(poll)).toBe('📊 Polling: Pilih jadwal kelas');
    expect(getPollOptionPercentage(poll, poll.options[0])).toBe(75);
  });

  it('rejects incomplete poll payloads safely', () => {
    expect(normalizeMessagePoll({ question: 'Tanpa opsi' })).toBeNull();
    expect(getPollOptionPercentage(null, null)).toBe(0);
  });

  it('builds the next single-choice selection for automatic sending', () => {
    expect(getNextPollVoteSelection(poll, [], 'pagi')).toEqual(['pagi']);
    expect(getNextPollVoteSelection(poll, ['pagi'], 'pagi')).toEqual([]);
    expect(getNextPollVoteSelection(poll, ['pagi'], 'malam')).toEqual(['malam']);
  });

  it('toggles multi-choice selections without exceeding the poll limit', () => {
    const multiPoll = {
      ...poll,
      selectableOptionsCount: 2,
      options: [
        ...poll.options,
        { id: 'siang', name: 'Siang', voteCount: 0 },
      ],
    };

    expect(getNextPollVoteSelection(multiPoll, ['pagi'], 'malam')).toEqual(['pagi', 'malam']);
    expect(getNextPollVoteSelection(multiPoll, ['pagi', 'malam'], 'siang'))
      .toEqual(['pagi', 'malam']);
    expect(arePollVoteSelectionsEqual(['malam', 'pagi'], ['pagi', 'malam'])).toBe(true);
  });
});
