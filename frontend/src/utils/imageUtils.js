import API_BASE_URL from '../config/apiConfig';

/**
 * Returns a safe, absolute URL for a product image.
 * Handles:
 * 1. Relative paths starting with '/uploads' (prepends API_BASE_URL)
 * 2. Hardcoded 'http://localhost' URLs from seed data (replaces with API_BASE_URL)
 * 3. Already correct absolute URLs (returns as is)
 * 4. Missing images (returns null)
 */
export const getSafeImageUrl = (url) => {
  if (!url) return null;

  // Normalize backslashes from Windows-style paths to forward slashes
  let normalizedUrl = url.replace(/\\/g, '/');

  // If it's a full URL pointing to localhost, replace it with the current API_BASE_URL
  // We do this first in case it's like http://localhost:5000/uploads/...
  if (normalizedUrl.includes('://localhost:5000')) {
    const relativePath = normalizedUrl.split('://localhost:5000')[1];
    return `${API_BASE_URL}${relativePath}`;
  }

  // If it already starts with http/https, return it as is (if not localhost)
  if (normalizedUrl.startsWith('http')) {
    return normalizedUrl;
  }

  // If it starts with /uploads, prepend API_BASE_URL
  if (normalizedUrl.startsWith('/uploads')) {
    return `${API_BASE_URL}${normalizedUrl}`;
  }

  // If it starts with uploads (no leading slash), prepend API_BASE_URL and a slash
  if (normalizedUrl.startsWith('uploads/')) {
    return `${API_BASE_URL}/${normalizedUrl}`;
  }

  // If it's just a filename (no slash, no uploads), assume it's in /uploads/
  if (!normalizedUrl.includes('/')) {
    return `${API_BASE_URL}/uploads/${normalizedUrl}`;
  }

  // Otherwise, fallback to prepending API_BASE_URL if it's a relative path
  if (normalizedUrl.startsWith('/')) {
    return `${API_BASE_URL}${normalizedUrl}`;
  }

  return `${API_BASE_URL}/${normalizedUrl}`;
};
