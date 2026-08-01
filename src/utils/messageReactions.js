const messageTargetIds = message =>
  [message?.waMessageId, message?.id, message?.tempId].filter(Boolean);

export const getMessageReactionTargetId = message => {
  if (message?.type === 'outgoing') {
    return message?.waMessageId || message?.tempId || message?.id || null;
  }
  return message?.id || null;
};

export const findOwnMessageReaction = (message, reactions) => {
  const targetFromMe = message?.type === 'outgoing';
  const targetIds = messageTargetIds(message);
  return (Array.isArray(reactions) ? reactions : []).find(reaction =>
    reaction?.reactorJid === 'me' &&
    Boolean(reaction.targetFromMe) === targetFromMe &&
    targetIds.includes(reaction.targetMessageId)
  ) || null;
};

export const sameConversationJid = (left, right) => {
  if (!left || !right) return false;
  if (left === right) return true;

  const identity = value => {
    const normalized = String(value).trim().toLowerCase();
    if (normalized.endsWith('@g.us')) return normalized;
    return normalized.split('@')[0].split(':')[0].replace(/\D/g, '');
  };
  return Boolean(identity(left)) && identity(left) === identity(right);
};

export const applyMessageReactionEvent = (current, event) => {
  if (!event?.targetMessageId || !event?.reactorJid) return current;

  const reactions = Array.isArray(current) ? current : [];
  const withoutPrevious = reactions.filter(reaction => !(
    reaction.targetMessageId === event.targetMessageId &&
    reaction.reactorJid === event.reactorJid
  ));

  if (event.removed || !event.emoji) return withoutPrevious;
  return [...withoutPrevious, event];
};

export const groupMessageReactions = (message, reactions) => {
  const targetFromMe = message?.type === 'outgoing';
  const targetIds = messageTargetIds(message);
  const grouped = new Map();

  for (const reaction of Array.isArray(reactions) ? reactions : []) {
    if (
      !reaction?.emoji ||
      Boolean(reaction.targetFromMe) !== targetFromMe ||
      !targetIds.includes(reaction.targetMessageId)
    ) {
      continue;
    }

    const current = grouped.get(reaction.emoji) || {
      emoji: reaction.emoji,
      count: 0,
    };
    current.count += 1;
    grouped.set(reaction.emoji, current);
  }

  return [...grouped.values()].map(group => ({
    ...group,
    title: group.count === 1 ? '1 reaksi' : `${group.count} reaksi`,
  }));
};
