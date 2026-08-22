export const POLL_MIN_OPTIONS = 2;
export const POLL_MAX_OPTIONS = 12;
export const POLL_QUESTION_MAX_LENGTH = 255;
export const POLL_OPTION_MAX_LENGTH = 100;

const cleanText = value => String(value || '').trim();

export const createMessagePollDraft = () => ({
  question: '',
  options: ['', ''],
  allowMultiple: false,
});

export const validateMessagePollDraft = draft => {
  const question = cleanText(draft?.question);
  const options = Array.isArray(draft?.options)
    ? draft.options.map(cleanText)
    : [];

  if (!question) return { valid: false, error: 'Pertanyaan polling wajib diisi' };
  if (question.length > POLL_QUESTION_MAX_LENGTH) {
    return { valid: false, error: `Pertanyaan maksimal ${POLL_QUESTION_MAX_LENGTH} karakter` };
  }
  if (options.length < POLL_MIN_OPTIONS || options.length > POLL_MAX_OPTIONS) {
    return {
      valid: false,
      error: `Polling harus memiliki ${POLL_MIN_OPTIONS} sampai ${POLL_MAX_OPTIONS} pilihan`,
    };
  }
  if (options.some(option => !option)) {
    return { valid: false, error: 'Semua pilihan polling wajib diisi' };
  }
  if (options.some(option => option.length > POLL_OPTION_MAX_LENGTH)) {
    return {
      valid: false,
      error: `Setiap pilihan maksimal ${POLL_OPTION_MAX_LENGTH} karakter`,
    };
  }
  if (new Set(options.map(option => option.toLocaleLowerCase('id-ID'))).size !== options.length) {
    return { valid: false, error: 'Pilihan polling tidak boleh sama' };
  }

  return {
    valid: true,
    error: '',
    normalized: {
      question,
      options,
      selectableOptionsCount: draft?.allowMultiple ? options.length : 1,
    },
  };
};

export const buildOutgoingMessagePoll = draft => {
  const result = validateMessagePollDraft(draft);
  if (!result.valid) throw new Error(result.error);
  return {
    poll: {
      name: result.normalized.question,
      values: result.normalized.options,
      selectableCount: result.normalized.selectableOptionsCount,
    },
  };
};

export const createOptimisticMessagePoll = draft => {
  const result = validateMessagePollDraft(draft);
  if (!result.valid) return null;
  return {
    question: result.normalized.question,
    selectableOptionsCount: result.normalized.selectableOptionsCount,
    totalVotes: 0,
    mySelectedOptionIds: [],
    updatedAt: new Date().toISOString(),
    options: result.normalized.options.map((name, index) => ({
      id: `pending-option-${index + 1}`,
      name,
      voteCount: 0,
      voters: [],
    })),
  };
};
