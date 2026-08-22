import { describe, expect, it } from 'vitest';
import {
  buildOutgoingMessagePoll,
  createMessagePollDraft,
  createOptimisticMessagePoll,
  validateMessagePollDraft,
} from '../../utils/messagePollComposer.js';

describe('Inbox poll composer', () => {
  it('creates a valid single-answer poll payload', () => {
    const draft = {
      ...createMessagePollDraft(),
      question: 'Pilih jadwal kelas',
      options: ['Pagi', 'Malam'],
    };

    expect(buildOutgoingMessagePoll(draft)).toEqual({
      poll: {
        name: 'Pilih jadwal kelas',
        values: ['Pagi', 'Malam'],
        selectableCount: 1,
      },
    });
  });

  it('allows multiple answers up to the number of options', () => {
    const draft = {
      question: 'Pilih materi',
      options: ['Python', 'Web', 'Game'],
      allowMultiple: true,
    };
    const optimistic = createOptimisticMessagePoll(draft);

    expect(optimistic.selectableOptionsCount).toBe(3);
    expect(optimistic.options.every(option => option.voteCount === 0)).toBe(true);
  });

  it('rejects empty and duplicate options', () => {
    expect(validateMessagePollDraft({
      question: 'Pilih materi',
      options: ['Python', ''],
    }).error).toBe('Semua pilihan polling wajib diisi');

    expect(validateMessagePollDraft({
      question: 'Pilih materi',
      options: ['Python', ' python '],
    }).error).toBe('Pilihan polling tidak boleh sama');
  });
});
