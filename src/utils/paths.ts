/**
 * Utility functions for handling paths with base URL
 * Ensures paths work correctly in both development and production
 */

/**
 * Get the base URL from Vite's environment
 * In production with GitHub Pages, this will be '/mpl--frontend/'
 * In development, this will be '/'
 */
export const getBaseUrl = (): string => {
  return import.meta.env.BASE_URL || '/';
};

/**
 * Get a full path for an asset (image, video, etc.)
 * Automatically prepends the base URL in production
 * 
 * @param path - Path starting with '/' (e.g., '/images/gallery/image.jpeg')
 * @returns Full path with base URL if needed
 * 
 * @example
 * getAssetPath('/images/gallery/image.jpeg')
 * // Development: '/images/gallery/image.jpeg'
 * // Production: '/mpl--frontend/images/gallery/image.jpeg'
 */
export const getAssetPath = (path: string): string => {
  // If path already starts with base URL, return as is
  const baseUrl = getBaseUrl();
  if (path.startsWith(baseUrl)) {
    return path;
  }
  
  // Ensure path starts with '/'
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // In production, baseUrl will be '/mpl--frontend/', so we need to combine
  // In development, baseUrl is '/', so it's just the path
  return `${baseUrl}${normalizedPath.slice(1)}`;
};

/**
 * Get image path - convenience function for images
 */
export const getImagePath = (path: string): string => {
  return getAssetPath(path);
};

/**
 * Get video path - convenience function for videos
 */
export const getVideoPath = (path: string): string => {
  return getAssetPath(path);
};

