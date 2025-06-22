import { useAuthStore } from '../stores/authStore';

/**
 * Global API response handler that automatically logs out users on 401 responses
 */
export async function handleApiResponse<T>(response: Response): Promise<T> {
  // Check for 401 unauthorized responses
  if (response.status === 401) {
    console.warn('401 Unauthorized response detected, logging out user');
    // Get the signout function from auth store
    const { signout } = useAuthStore.getState();
    await signout();
    
    // Return a standardized error response
    return {
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication token is invalid or expired',
      },
    } as T;
  }

  // For other responses, parse JSON normally
  const data = await response.json();
  return data;
}

/**
 * Wrapper for fetch that automatically handles 401 responses
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const response = await fetch(url, options);
  
  // Check for 401 unauthorized responses
  if (response.status === 401) {
    console.warn('401 Unauthorized response detected, logging out user');
    // Get the signout function from auth store
    const { signout } = useAuthStore.getState();
    await signout();
  }
  
  return response;
}