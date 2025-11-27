// API Configuration
// Update these values based on your environment

export interface ApiConfig {
  baseUrl: string;
  endpoints: {
    register: string;
    details: string;
    checkMobile: string;
  };
}

// Development API URL (localhost)
const developmentConfig: ApiConfig = {
  baseUrl: 'http://localhost:4000',
  endpoints: {
    register: '/api/register',
    details: '/api/details',
    checkMobile: '/api/check-mobile',
  },
};


const productionConfig: ApiConfig = {
  baseUrl: 'https://mpl-backend-3iiq.onrender.com', // Update this with your production API URL
  endpoints: {
    register: '/api/register',
    details: '/api/details',
    checkMobile: '/api/check-mobile',
  },
};

// Check for environment variable override (VITE_API_URL)
const envApiUrl = import.meta.env.VITE_API_URL;

// Determine which config to use based on environment
// Priority: 1. VITE_API_URL env variable, 2. VITE_USE_LOCALHOST flag, 3. Production (default)
// If VITE_API_URL is set, use it
// If VITE_USE_LOCALHOST=true, use local API
// Otherwise, use production API (default)
const useLocalhost = import.meta.env.VITE_USE_LOCALHOST === 'true' && !envApiUrl;

export const apiConfig: ApiConfig = envApiUrl
  ? {
      baseUrl: envApiUrl,
      endpoints: {
        register: '/api/register',
        details: '/api/details',
        checkMobile: '/api/check-mobile',
      },
    }
  : useLocalhost
  ? developmentConfig
  : productionConfig;

// Helper function to get full API URL
export const getApiUrl = (endpoint: keyof ApiConfig['endpoints']): string => {
  return `${apiConfig.baseUrl}${apiConfig.endpoints[endpoint]}`;
};

// Helper function to get full API URL with query params
export const getApiUrlWithParams = (
  endpoint: keyof ApiConfig['endpoints'],
  params: Record<string, string>
): string => {
  const baseUrl = getApiUrl(endpoint);
  const queryString = new URLSearchParams(params).toString();
  return `${baseUrl}?${queryString}`;
};

// Log API configuration in development (helpful for debugging)
if (import.meta.env.DEV) {
  const environment = envApiUrl 
    ? 'Custom (VITE_API_URL)' 
    : useLocalhost
    ? 'Development (Localhost)'
    : 'Production (Live)';
  
  console.log('🔧 API Configuration:', {
    baseUrl: apiConfig.baseUrl,
    environment: environment,
    endpoints: apiConfig.endpoints,
  });
}

