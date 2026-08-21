export function formatRecipientSelection(recipients = []) {
  const values = Array.isArray(recipients) ? recipients.filter(Boolean) : [];
  if (values.includes('all')) return 'Semua kontak';
  if (values.length === 0) return 'Belum ada penerima';
  return `${values.length} pilihan penerima`;
}

export function formatDeviceSummary(device) {
  if (!device) return '-';
  const name = String(device.name || 'Device').trim();
  const phone = String(device.phone || '').trim();
  return phone ? `${name} — ${phone}` : name;
}
