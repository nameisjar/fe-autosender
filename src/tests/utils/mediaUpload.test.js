import { describe, expect, it } from 'vitest';
import {
  MEDIA_ACCEPT,
  MEDIA_ALLOWED_EXTENSIONS,
  MEDIA_MAX_SIZE,
  getMediaFileExtension,
  isSupportedMediaFile,
} from '../../utils/mediaUpload.js';

describe('media upload policy', () => {
  it('uses the same 25 MB limit across upload screens', () => {
    expect(MEDIA_MAX_SIZE).toBe(25 * 1024 * 1024);
  });

  it('exposes every allowed extension to the file picker', () => {
    for (const extension of MEDIA_ALLOWED_EXTENSIONS) {
      expect(MEDIA_ACCEPT.split(',')).toContain(`.${extension}`);
    }
  });

  it('accepts supported files only when MIME and extension both match', () => {
    expect(isSupportedMediaFile({ name: 'Materi Kelas.pdf', type: 'application/pdf' })).toBe(true);
    expect(isSupportedMediaFile({ name: 'Video Kelas.mov', type: 'video/quicktime' })).toBe(true);
    expect(isSupportedMediaFile({ name: 'Data Siswa.xlsx', type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })).toBe(true);
  });

  it('rejects executable or disguised files', () => {
    expect(isSupportedMediaFile({ name: 'virus.exe', type: 'application/octet-stream' })).toBe(false);
    expect(isSupportedMediaFile({ name: 'virus.pdf', type: 'application/octet-stream' })).toBe(false);
    expect(isSupportedMediaFile({ name: 'virus.exe', type: 'application/pdf' })).toBe(false);
  });

  it('normalizes the extension used for validation', () => {
    expect(getMediaFileExtension({ name: 'LAPORAN.PDF' })).toBe('pdf');
    expect(getMediaFileExtension({ name: 'tanpa-ekstensi' })).toBe('');
  });
});
