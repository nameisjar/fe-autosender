import { describe, expect, it } from 'vitest';
import {
  formatDeviceSummary,
  formatRecipientSelection,
} from '../../utils/broadcastConfirmation.js';

describe('broadcast confirmation formatting', () => {
  it('summarizes recipient selections without claiming expanded contact totals', () => {
    expect(formatRecipientSelection(['all'])).toBe('Semua kontak');
    expect(formatRecipientSelection(['6281', 'label_students'])).toBe('2 pilihan penerima');
    expect(formatRecipientSelection([])).toBe('Belum ada penerima');
  });

  it('combines the active device name and phone', () => {
    expect(formatDeviceSummary({ name: 'Nomor utama', phone: '628123' }))
      .toBe('Nomor utama — 628123');
    expect(formatDeviceSummary(null)).toBe('-');
  });
});
