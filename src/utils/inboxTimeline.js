const DAY_MS = 86_400_000;

const asValidDate = value => {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const getLocalCalendarKey = value => {
  const date = asValidDate(value);
  if (!date) return 'unknown';
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
};

const calendarOrdinal = date => Date.UTC(
  date.getFullYear(),
  date.getMonth(),
  date.getDate(),
) / DAY_MS;

const capitalize = value =>
  value ? `${value.charAt(0).toLocaleUpperCase('id-ID')}${value.slice(1)}` : '';

export const formatInboxDateLabel = (value, nowValue = Date.now()) => {
  const date = asValidDate(value);
  const now = asValidDate(nowValue);
  if (!date || !now) return 'Tanggal tidak diketahui';

  const dayDifference = calendarOrdinal(now) - calendarOrdinal(date);
  if (dayDifference === 0) return 'Hari ini';
  if (dayDifference === 1) return 'Kemarin';
  if (dayDifference >= 2 && dayDifference <= 6) {
    return capitalize(new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
    }).format(date));
  }
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

export const formatInboxBubbleTime = value => {
  const date = asValidDate(value);
  if (!date) return '';
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
};
