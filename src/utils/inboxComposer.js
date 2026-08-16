const TEXT_ENTRY_TAGS = new Set(['input', 'textarea', 'select']);

export const shouldRedirectInboxTyping = (
  event,
  { conversationOpen, blocked = false, targetIsExternal = false } = {},
) => {
  if (!conversationOpen || blocked || event?.defaultPrevented || event?.isComposing) return false;
  if (event?.ctrlKey || event?.metaKey || event?.altKey) return false;
  if (typeof event?.key !== 'string' || event.key.length !== 1) return false;

  const target = event.target;
  const tagName = String(target?.tagName || '').toLowerCase();
  if ((TEXT_ENTRY_TAGS.has(tagName) || target?.isContentEditable) && !targetIsExternal) {
    return false;
  }
  if ((tagName === 'button' || tagName === 'a') && event.key === ' ') return false;
  return true;
};

export const insertComposerCharacter = (text, character, selectionStart, selectionEnd) => {
  const value = String(text || '');
  const start = Number.isInteger(selectionStart) ? selectionStart : value.length;
  const end = Number.isInteger(selectionEnd) ? selectionEnd : start;
  const safeStart = Math.max(0, Math.min(start, value.length));
  const safeEnd = Math.max(safeStart, Math.min(end, value.length));
  const nextValue = `${value.slice(0, safeStart)}${character}${value.slice(safeEnd)}`;
  return {
    value: nextValue,
    caret: safeStart + character.length,
  };
};
