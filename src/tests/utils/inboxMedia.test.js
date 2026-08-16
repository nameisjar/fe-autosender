import { describe, expect, it } from 'vitest';
import {
  getInboxMediaExtension,
  getInboxMediaType,
} from '../../utils/inboxMedia.js';

describe('Inbox media classification', () => {
  it('uses backend metadata for signed URLs without file extensions', () => {
    const message = {
      mediaPath: '/inbox-media/device/message?token=secret',
      mediaType: 'image',
    };

    expect(getInboxMediaExtension(message)).toBe('');
    expect(getInboxMediaType(message)).toBe('image');
  });

  it('keeps extension-based compatibility for older responses', () => {
    expect(getInboxMediaType({ mediaPath: 'media/session/photo.PNG' })).toBe('image');
    expect(getInboxMediaType({ mediaPath: '/signed/path', fileName: 'voice.ogg' })).toBe('audio');
  });

  it('recognizes legacy image placeholders on signed URLs', () => {
    expect(getInboxMediaType({
      mediaPath: '/inbox-media/device/message?token=secret',
      message: '[Gambar]',
      type: 'incoming',
    })).toBe('image');
  });

  it('keeps unknown media as a downloadable document', () => {
    expect(getInboxMediaType({ mediaPath: '/inbox-media/device/message?token=secret' }))
      .toBe('document');
    expect(getInboxMediaType({ mediaPath: '' })).toBe('');
  });
});
