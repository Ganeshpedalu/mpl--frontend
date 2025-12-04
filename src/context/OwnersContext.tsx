import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef, ReactNode } from 'react';
import { getApiUrl } from '../config/apiConfig';

export interface OwnerData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  bio?: string;
  teamName?: string;
  season?: string;
  imageUrl?: string;
  purseValue?: number;
} 
 
interface OwnersApiResponse {
  success: boolean;
  data: OwnerData[];
  count: number;
  message?: string;
}

interface OwnersContextValue {
  owners: OwnerData[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const OwnersContext = createContext<OwnersContextValue | undefined>(undefined);

export const OwnersProvider = ({ children }: { children: ReactNode }) => {
  const [owners, setOwners] = useState<OwnerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false); // Prevents double fetch in React 18 dev mode
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchOwners = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      setError(null);
      
      const response = await fetch(getApiUrl('owners'));
      
      if (!response.ok) {
        throw new Error('Failed to fetch owners');
      }

      const result: OwnersApiResponse = await response.json();
      
      if (result.success && result.data) {
        setOwners(result.data);
      }
    } catch (err) {
      console.error('Error fetching owners:', err);
      const message = err instanceof Error ? err.message : 'Failed to fetch owners';
      setError(message);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  // Fetch owners on mount and set up polling for real-time updates
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchOwners();

    // Set up polling every 3 seconds for real-time updates
    pollingIntervalRef.current = setInterval(() => {
      // Only poll if page is visible
      if (!document.hidden) {
        fetchOwners(true); // Silent update (don't show loading)
      }
    }, 3000);

    // Cleanup polling on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [fetchOwners]);

  const contextValue = useMemo(
    () => ({
      owners,
      loading,
      error,
      refresh: fetchOwners,
    }),
    [owners, loading, error, fetchOwners]
  );

  return (
    <OwnersContext.Provider value={contextValue}>
      {children}
    </OwnersContext.Provider>
  );
};

export const useOwners = (): OwnersContextValue => {
  const context = useContext(OwnersContext);
  if (!context) {
    throw new Error('useOwners must be used within an OwnersProvider');
  }
  return context;
};

