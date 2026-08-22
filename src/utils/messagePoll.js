const cleanText = value => String(value || '').trim();

export const normalizeMessagePoll = value => {
  if (!value || typeof value !== 'object') return null;
  const question = cleanText(value.question);
  const options = Array.isArray(value.options)
    ? value.options
        .map((option, index) => ({
          id: cleanText(option?.id) || `option-${index + 1}`,
          name: cleanText(option?.name),
          voteCount: Math.max(0, Number(option?.voteCount) || 0),
          voters: Array.isArray(option?.voters)
            ? option.voters
                .map(voter => ({
                  name: cleanText(voter?.name) || 'Tidak dikenal',
                  phone: cleanText(voter?.phone) || null,
                  profilePicUrl: cleanText(voter?.profilePicUrl) || null,
                  profileStatus: cleanText(voter?.profileStatus) || 'unavailable',
                  votedAt: voter?.votedAt || null,
                  isMe: Boolean(voter?.isMe),
                }))
            : [],
        }))
        .filter(option => option.name)
    : [];
  if (!question || options.length === 0) return null;

  const requestedLimit = Number(value.selectableOptionsCount);
  const optionIds = new Set(options.map(option => option.id));
  return {
    question,
    options,
    selectableOptionsCount:
      Number.isSafeInteger(requestedLimit) && requestedLimit > 0
        ? Math.min(requestedLimit, options.length)
        : 1,
    totalVotes: Math.max(0, Number(value.totalVotes) || 0),
    mySelectedOptionIds: Array.isArray(value.mySelectedOptionIds)
      ? [...new Set(value.mySelectedOptionIds.map(cleanText).filter(id => optionIds.has(id)))]
      : [],
    updatedAt: value.updatedAt || null,
  };
};

export const getPollOptionPercentage = (poll, option) => {
  const normalized = normalizeMessagePoll(poll);
  if (!normalized || normalized.totalVotes <= 0) return 0;
  return Math.min(
    100,
    Math.round((Math.max(0, Number(option?.voteCount) || 0) / normalized.totalVotes) * 100),
  );
};

export const getNextPollVoteSelection = (poll, currentSelection, optionId) => {
  const normalized = normalizeMessagePoll(poll);
  const selectedId = cleanText(optionId);
  if (!normalized || !normalized.options.some(option => option.id === selectedId)) {
    return Array.isArray(currentSelection) ? [...currentSelection] : [];
  }

  const validOptionIds = new Set(normalized.options.map(option => option.id));
  const current = [...new Set(
    (Array.isArray(currentSelection) ? currentSelection : [])
      .map(cleanText)
      .filter(id => validOptionIds.has(id)),
  )];
  if (normalized.selectableOptionsCount === 1) {
    return current.includes(selectedId) ? [] : [selectedId];
  }
  return current.includes(selectedId)
    ? current.filter(id => id !== selectedId)
    : [...current, selectedId].slice(0, normalized.selectableOptionsCount);
};

export const arePollVoteSelectionsEqual = (left, right) => {
  const first = [...new Set((Array.isArray(left) ? left : []).map(cleanText).filter(Boolean))]
    .sort();
  const second = [...new Set((Array.isArray(right) ? right : []).map(cleanText).filter(Boolean))]
    .sort();
  return first.length === second.length
    && first.every((optionId, index) => optionId === second[index]);
};

export const getPollPreview = value => {
  const poll = normalizeMessagePoll(value);
  return poll ? `📊 Polling: ${poll.question}` : '';
};
