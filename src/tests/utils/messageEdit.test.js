import { describe, expect, it } from 'vitest';
import { isWithinMessageEditWindow } from '../../utils/messageEdit.js';

describe('message edit window', () => {
  const now = new Date('2026-08-20T10:15:00.000Z').getTime();

  it('allows a message that is less than 15 minutes old', () => {
    expect(isWithinMessageEditWindow('2026-08-20T10:00:00.001Z', now)).toBe(true);
  });

  it('rejects a message once it reaches 15 minutes old', () => {
    expect(isWithinMessageEditWindow('2026-08-20T10:00:00.000Z', now)).toBe(false);
  });

  it('rejects missing or invalid timestamps', () => {
    expect(isWithinMessageEditWindow(undefined, now)).toBe(false);
    expect(isWithinMessageEditWindow('not-a-date', now)).toBe(false);
  });
});
