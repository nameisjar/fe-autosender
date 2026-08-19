import { describe, expect, it } from 'vitest';
import {
  formatInboxBubbleTime,
  formatInboxDateLabel,
  getLocalCalendarKey,
} from '../../utils/inboxTimeline.js';

describe('Inbox timeline dates', () => {
  const localDate = (year, month, day, hour = 12, minute = 0) =>
    new Date(year, month - 1, day, hour, minute);

  it('labels today and yesterday using calendar days', () => {
    const now = localDate(2026, 8, 20, 0, 5);
    expect(formatInboxDateLabel(localDate(2026, 8, 20, 0, 1), now)).toBe('Hari ini');
    expect(formatInboxDateLabel(localDate(2026, 8, 19, 23, 59), now)).toBe('Kemarin');
  });

  it('uses a weekday for recent messages and a full date for older messages', () => {
    const now = localDate(2026, 8, 20);
    expect(formatInboxDateLabel(localDate(2026, 8, 18), now)).toBe('Selasa');
    expect(formatInboxDateLabel(localDate(2026, 8, 12), now))
      .toMatch(/Rabu,? 12 Agustus 2026/i);
  });

  it('provides stable local date keys and time-only bubble labels', () => {
    const value = localDate(2026, 8, 20, 4, 27);
    expect(getLocalCalendarKey(value)).toBe('2026-08-20');
    expect(formatInboxBubbleTime(value)).toMatch(/04[.:]27/);
  });
});
