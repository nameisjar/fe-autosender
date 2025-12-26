import { API_BASE } from "../api/http.js";

/**
 * Build absolute URL for media/static files served by the backend.
 * - If `p` is already an absolute URL (http/https) or special scheme (data/blob), it is returned as-is.
 * - Otherwise it is treated as a relative path and prefixed with API_BASE.
 * - Converts Windows backslashes to forward slashes for URL compatibility.
 */
export function mediaUrl(p) {
  if (p == null) return "";

  // Support URL instances
  const raw = p instanceof URL ? p.toString() : String(p);
  const s = raw.trim();
  if (!s) return "";

  const lower = s.toLowerCase();
  // Already absolute or handled by browser
  if (
    lower.startsWith("http://") ||
    lower.startsWith("https://") ||
    lower.startsWith("data:") ||
    lower.startsWith("blob:")
  ) {
    return s;
  }

  // Join API_BASE and relative path safely
  const base = String(API_BASE || "").replace(/\/+$/, "");
  // Convert Windows backslashes to forward slashes and remove leading slashes
  const path = s.replace(/\\/g, "/").replace(/^\/+/, "");

  // If base is empty (dev proxy), just return /<path>
  if (!base) return `/${path}`;

  return `${base}/${path}`;
}
