const MEDIA_EXTENSIONS = {
  image: new Set(['jpg', 'jpeg', 'png', 'gif', 'webp']),
  video: new Set(['mp4', 'mov', 'webm', 'mkv']),
  audio: new Set(['mp3', 'ogg', 'wav', 'm4a', 'aac', 'opus']),
};

export const getInboxMediaExtension = (message) => {
  const path = String(message?.mediaPath || '').split(/[?#]/)[0].toLowerCase();
  if (path.includes('.')) return path.substring(path.lastIndexOf('.') + 1);
  const fileName = String(message?.fileName || '').toLowerCase();
  return fileName.includes('.') ? fileName.substring(fileName.lastIndexOf('.') + 1) : '';
};

export const getInboxMediaType = (message) => {
  if (!message?.mediaPath) return '';

  const explicitType = String(message.mediaType || '').toLowerCase();
  if (['image', 'video', 'audio', 'document'].includes(explicitType)) {
    return explicitType;
  }

  const extension = getInboxMediaExtension(message);
  for (const [mediaType, extensions] of Object.entries(MEDIA_EXTENSIONS)) {
    if (extensions.has(extension)) return mediaType;
  }

  const text = String(
    message?.type === 'outgoing' ? message?.text : message?.message,
  ).trim().toLowerCase();
  if (text === '[gambar]' || text === '[stiker]') return 'image';
  if (text === '[video]') return 'video';
  if (text === '[audio]') return 'audio';
  return 'document';
};

