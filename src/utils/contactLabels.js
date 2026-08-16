export const getContactLabelNames = (contact) => {
  const contactLabels = Array.isArray(contact?.ContactLabel) ? contact.ContactLabel : [];
  const names = [];
  const seen = new Set();

  for (const contactLabel of contactLabels) {
    const name = String(contactLabel?.label?.name || '').trim();
    const key = name.toLocaleLowerCase();

    if (!name || key.startsWith('device_') || seen.has(key)) continue;

    seen.add(key);
    names.push(name);
  }

  return names;
};
