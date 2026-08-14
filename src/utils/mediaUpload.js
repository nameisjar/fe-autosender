export const MEDIA_MAX_SIZE = 25 * 1024 * 1024;

export const MEDIA_ALLOWED_EXTENSIONS = Object.freeze([
  'jpg', 'jpeg', 'png', 'gif', 'webp',
  'mp4', 'mov', 'webm',
  'mp3', 'ogg', 'wav',
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'txt',
  'ppt', 'pptx', 'odt', 'ods', 'odp', 'rtf', 'json',
  'zip', 'rar', '7z',
]);

export const MEDIA_ALLOWED_MIME_TYPES = Object.freeze([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'audio/mpeg',
  'audio/ogg',
  'audio/wav',
  'audio/webm',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-powerpoint',
  'application/vnd.oasis.opendocument.text',
  'application/vnd.oasis.opendocument.spreadsheet',
  'application/vnd.oasis.opendocument.presentation',
  'application/rtf',
  'text/rtf',
  'application/json',
  'application/zip',
  'application/x-zip-compressed',
  'application/vnd.rar',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
  'text/csv',
  'text/plain',
]);

export const MEDIA_ACCEPT = MEDIA_ALLOWED_EXTENSIONS
  .map(extension => `.${extension}`)
  .join(',');

const allowedExtensions = new Set(MEDIA_ALLOWED_EXTENSIONS);
const allowedMimeTypes = new Set(MEDIA_ALLOWED_MIME_TYPES);

export function getMediaFileExtension(file) {
  const fileName = String(file?.name || '').toLowerCase();
  const dotIndex = fileName.lastIndexOf('.');
  return dotIndex >= 0 ? fileName.slice(dotIndex + 1) : '';
}

/** Match the same MIME + extension policy enforced by the backend uploader. */
export function isSupportedMediaFile(file) {
  const mimeType = String(file?.type || '').toLowerCase();
  return allowedMimeTypes.has(mimeType)
    && allowedExtensions.has(getMediaFileExtension(file));
}
