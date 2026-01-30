/**
 * URL validation utilities for security
 */

/**
 * Checks if a URL is safe to use in href attributes (http or https protocol only)
 * Prevents javascript:, data:, and other potentially dangerous protocols
 */
export function isValidHttpUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Returns the URL if it's safe, or null if it's not
 */
export function getSafeUrl(url: string | null | undefined): string | null {
  return isValidHttpUrl(url) ? url : null;
}
