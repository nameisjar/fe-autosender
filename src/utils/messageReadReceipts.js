export const canShowMessageReaders = (message, conversation = null) => Boolean(
  message?.type === 'outgoing'
  && message?.isGroup
  && Number(message?.readCount) > 0
  && (conversation == null || conversation?.isGroup),
);
