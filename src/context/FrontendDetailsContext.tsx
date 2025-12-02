import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { getApiUrl } from "../config/apiConfig";

export interface DashboardDetails {
  tournamentName: string;
  season: string;
  registrationFee: number;
  lastDate: string;
  seasonYear: number;
  auctionDate?: string;
}

export type HighlightMediaType = "image" | "video";

export interface HighlightDetails {
  type: string;
  description?: string;
  title?: string;
  label?: string;
  mediaType?: HighlightMediaType;
  media_type?: HighlightMediaType;
  contentType?: HighlightMediaType;
  format?: HighlightMediaType;
  base64ImageUrl?: string;
  base64VideoUrl?: string;
  thumbnailBase64?: string;
  videoUrl?: string;
  imageUrl?: string;
  color?: string;
}

export interface PaymentDetails {
  upiId: string;
  paytmNumber: string;
  gpayNumber: string;
  phonePeNumber: string;
  qrImageBase64: string;
}

export interface WinnerDetails {
  season: string;
  teamName: string;
  description: string;
  teamCaptainName: string;
  base64ImageUrl?: string;
}

export interface AboutPageDetails {
  description?: string;
  base64ImageUrl?: string;
}

export interface OwnerDetails {
  name: string;
  email?: string;
  phone?: string;
  base64ImageUrl?: string;
  bio?: string;
  teamName?: string;
  season: string;
}

export interface FrontendDetailsData {
  createdAt: string;
  updatedAt: string;
  dashboard: DashboardDetails;
  highlights: HighlightDetails[];
  payment: PaymentDetails;
  whatsapp: { groupLink: string };
  winners: WinnerDetails[];
  aboutPage?: AboutPageDetails;
  owners?: OwnerDetails[];
}

interface FrontendDetailsResponse {
  success: boolean;
  data: FrontendDetailsData;
}

interface FrontendDetailsContextValue {
  details: FrontendDetailsData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const FrontendDetailsContext = createContext<
  FrontendDetailsContextValue | undefined
>(undefined);

export const FrontendDetailsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [details, setDetails] = useState<FrontendDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false); // prevents double fetch in React 18 dev mode

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const url = getApiUrl("frontendDetails");
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to load MPL frontend details");
      }

      const payload: FrontendDetailsResponse = await response.json();
      console.log("API RESPONSE:", payload);

      if (!payload.success || !payload.data) {
        throw new Error("Invalid response from server");
      }

      setDetails(payload.data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load data";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (fetchedRef.current) return; 
    fetchedRef.current = true;
    fetchDetails();
  }, [fetchDetails]);

  const contextValue = useMemo(
    () => ({
      details,
      loading,
      error,
      refresh: fetchDetails,
    }),
    [details, loading, error, fetchDetails]
  );
  return (
    <FrontendDetailsContext.Provider value={contextValue}>
      {children}
    </FrontendDetailsContext.Provider>
  );
};

export const useFrontendDetails = (): FrontendDetailsContextValue => {
  const context = useContext(FrontendDetailsContext);

  if (!context) {
    throw new Error(
      "useFrontendDetails must be used within a FrontendDetailsProvider"
    );
  }

  return context;
};
