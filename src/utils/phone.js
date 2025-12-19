export function normalizePhoneNumber(phone) {
  if (!phone) return "";

  // Convert to string
  let cleaned = phone.toString();

  // Remove all non-digit characters (spaces, dashes, parentheses, plus sign, etc.)
  cleaned = cleaned.replace(/[^\d]/g, "");

  // Handle 08xx format -> 628xx
  if (cleaned.startsWith("08")) {
    cleaned = "62" + cleaned.substring(1);
  }

  // Handle 8xx format -> 628xx (sometimes users just type 812...)
  if (cleaned.startsWith("8") && !cleaned.startsWith("62")) {
    cleaned = "62" + cleaned;
  }

  return cleaned;
}

export function isValidPhoneNumber(phone) {
  if (!phone) return false;

  // Must be digits only (after normalization)
  if (!/^\d+$/.test(phone)) return false;

  // Must start with 62
  if (!phone.startsWith("62")) return false;

  // Length check (usually 10-15 digits for ID numbers)
  if (phone.length < 10 || phone.length > 15) return false;

  return true;
}
