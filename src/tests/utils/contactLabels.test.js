import { describe, expect, it } from 'vitest';
import { getContactLabelNames } from '../../utils/contactLabels.js';

describe('getContactLabelNames', () => {
  it('returns visible label names and removes duplicates', () => {
    expect(
      getContactLabelNames({
        ContactLabel: [
          { label: { name: 'Pelanggan' } },
          { label: { name: ' Prioritas ' } },
          { label: { name: 'pelanggan' } },
        ],
      }),
    ).toEqual(['Pelanggan', 'Prioritas']);
  });

  it('hides internal device labels and ignores malformed entries', () => {
    expect(
      getContactLabelNames({
        ContactLabel: [
          { label: { name: 'device_123' } },
          { label: { name: 'DEVICE_shared' } },
          { label: { name: 'Google Contact' } },
          { label: null },
        ],
      }),
    ).toEqual(['Google Contact']);
  });

  it('returns an empty list when labels are unavailable', () => {
    expect(getContactLabelNames(null)).toEqual([]);
    expect(getContactLabelNames({})).toEqual([]);
  });
});
