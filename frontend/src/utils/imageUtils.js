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

  // If it starts with /uploads, it's a relative path from the backend
  if (url.startsWith('/uploads')) {
    return `${API_BASE_URL}${url}`;
  }

  // If it's a full URL pointing to localhost, replace it with the current API_BASE_URL
  // This helps when the database has hardcoded localhost URLs from previous dev runs
  if (url.includes('://localhost:5000')) {
    const relativePath = url.split('://localhost:5000')[1];
    return `${API_BASE_URL}${relativePath}`;
  }

  // Otherwise, return the URL as is (might be a Cloudinary/S3 link or already correct)
  return url;
};
