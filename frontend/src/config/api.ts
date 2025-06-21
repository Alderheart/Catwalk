/**
 * Secure API configuration with URL validation
 * Prevents SSRF attacks and ensures only allowed hosts are used
 */

const ALLOWED_HOSTS = [
  'localhost',
  '127.0.0.1',
  '192.168.68.85', // Mark's PC
];

const DEFAULT_API_URL = 'http://localhost:3000/api/v1';

/**
 * Validates if a URL is safe to use for API calls
 */
function validateApiUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    
    // Only allow HTTP and HTTPS protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      console.error('Invalid protocol. Only http and https are allowed.');
      return false;
    }
    
    // Check if hostname is in allowed list
    if (!ALLOWED_HOSTS.includes(parsedUrl.hostname)) {
      console.error(`Host ${parsedUrl.hostname} is not in the allowed hosts list.`);
      return false;
    }
    
    // Ensure port is in valid range (1024-65535 for non-privileged ports)
    const port = parsedUrl.port ? parseInt(parsedUrl.port) : (parsedUrl.protocol === 'https:' ? 443 : 80);
    if (port < 1024 || port > 65535) {
      console.error('Port must be between 1024 and 65535.');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Invalid URL format:', error);
    return false;
  }
}

/**
 * Gets the validated API base URL
 */
function getApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  
  if (envUrl) {
    if (validateApiUrl(envUrl)) {
      return envUrl;
    } else {
      console.warn('Environment API URL failed validation, falling back to default.');
    }
  }
  
  return DEFAULT_API_URL;
}

export const API_BASE_URL = getApiBaseUrl();

// Export for testing purposes
export { validateApiUrl };