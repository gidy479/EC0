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

  // If it already starts with http/https, return it as is (if not localhost)
  if (normalizedUrl.startsWith('http') && !normalizedUrl.includes('localhost:5000')) {
    return normalizedUrl;
  }

  // Normalize leading slash for relative paths that aren't full URLs
  let finalPath = normalizedUrl;
  if (finalPath.includes('://localhost:5000')) {
    finalPath = finalPath.split('://localhost:5000')[1];
  }

  // Prepend API_BASE_URL if it's a relative path
  let base = API_BASE_URL;
  if (!base || base === window.location.origin) {
    base = (import.meta.env.MODE === 'development' ? 'http://localhost:5000' : window.location.origin);
  }

  // Ensure trailing slash on base and avoid double slashes in result
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const cleanPath = finalPath.startsWith('/') ? finalPath : `/${finalPath}`;

  return `${cleanBase}${cleanPath}`;
};
