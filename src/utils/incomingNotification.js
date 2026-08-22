import { getPollPreview } from './messagePoll.js';

const cleanText = value => String(value || '').trim();

export const formatNotificationPhone = jid => {
  const normalized = cleanText(jid).toLowerCase();
  if (!normalized) return '';
  if (normalized.endsWith('@lid') || normalized.endsWith('@hosted.lid')) return '';
  if (normalized.endsWith('@g.us')) return '';

  const phone = normalized.split('@')[0].split(':')[0].replace(/\D/g, '');
  return phone ? `+${phone}` : '';
};

const getContactName = contact => {
  if (!contact) return '';
  return [contact.firstName, contact.lastName].map(cleanText).filter(Boolean).join(' ');
};

const getInitials = value => {
  const words = cleanText(value).split(/\s+/).filter(Boolean);
  if (!words.length) return '?';
  return words.slice(0, 2).map(word => word.charAt(0).toUpperCase()).join('');
};

export const buildIncomingNotification = data => {
  const isGroup = Boolean(data?.isGroup || cleanText(data?.from).endsWith('@g.us'));
  const contactName = getContactName(data?.contact);
  const profileName = cleanText(data?.pushName);
  const conversationPhone = formatNotificationPhone(data?.from);
  const participantPhone = formatNotificationPhone(data?.participant);
  const groupName = cleanText(data?.groupName) || 'Grup WhatsApp';
  const senderName = contactName
    || profileName
    || participantPhone
    || conversationPhone
    || (isGroup ? 'Anggota grup' : 'Kontak WhatsApp');
  const title = isGroup ? groupName : senderName;
  const preview = (
    getPollPreview(data?.pollData)
    || cleanText(data?.message)
    || 'Media/File'
  ).slice(0, 100);
  const description = isGroup ? `${senderName}: ${preview}` : preview;
  const avatarUrl = cleanText(isGroup ? data?.groupPicUrl : data?.profilePicUrl);
  const avatarKind = isGroup ? 'group' : 'personal';

  return {
    isGroup,
    title,
    senderName,
    preview,
    description,
    avatarUrl,
    avatarKind,
    defaultAvatarUrl: `/default-avatar-${avatarKind}.svg`,
    avatarFallback: getInitials(title),
  };
};
