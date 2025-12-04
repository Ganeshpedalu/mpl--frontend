import { Suspense, lazy, useState, useEffect, useCallback } from 'react';
import { Loader, Users, Mail, Phone, Trophy, AlertCircle } from 'lucide-react';
import { useFrontendDetails } from '../context/FrontendDetailsContext';
import { getApiUrl, getApiUrlWithParams } from '../config/apiConfig';

const Header = lazy(() => import('../components/Header'));
const Footer = lazy(() => import('../components/Footer'));

const LoadingFallback = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
    <div className="text-center">
      <Loader className="w-12 h-12 animate-spin text-[#041955] mx-auto mb-4" />
      <p className="text-lg text-gray-600">Loading...</p>
    </div>
  </div>
);

interface OwnerData {
  id: string;
  name: string;
  email: string;
  phone: string;
  imageUrl: string;
  bio: string;
  teamName: string;
  season: string;
  createdAt: string;
  updatedAt?: string;
}

interface OwnersApiResponse {
  success: boolean;
  data: OwnerData[];
  count: number;
  message?: string;
}

export default function OwnersPage() {
  const { details } = useFrontendDetails();
  const [owners, setOwners] = useState<OwnerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  
  const tournamentName = details?.dashboard?.tournamentName ?? 'MPL';
  const seasonLabel = details?.dashboard?.season ?? 'Season 2';

  const fetchOwners = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch owners with optional season filter
      const url = seasonLabel 
        ? getApiUrlWithParams('owners', { season: seasonLabel })
        : getApiUrl('owners');

      const response = await fetch(url);

      if (!response.ok) {
        let errorMsg = 'Failed to fetch owners';
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorData.error || errorMsg;
        } catch (parseError) {
          errorMsg = response.statusText || errorMsg;
        }
        throw new Error(errorMsg);
      }

      const result: OwnersApiResponse = await response.json();

      if (result.success && result.data) {
        setOwners(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch owners');
      }
    } catch (err) {
      console.error('Error fetching owners:', err);
      const errorMsg = err instanceof Error ? err.message : 'Network error. Please check your connection and try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [seasonLabel]);

  useEffect(() => {
    fetchOwners();
  }, [fetchOwners]);

  const handleImageError = (ownerId: string) => {
    setImageErrors((prev) => new Set(prev).add(ownerId));
  };

  if (loading) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="text-center">
            <Loader className="w-12 h-12 animate-spin text-[#041955] mx-auto mb-4" />
            <p className="text-lg text-gray-600">Loading owners...</p>
          </div>
        </div>
        <Footer />
      </Suspense>
    );
  }

  if (error) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#041955] mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchOwners}
              className="bg-[#041955] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#062972] transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Header />
      
      <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#E6B31E] rounded-full mb-6">
              <Users className="w-12 h-12 text-[#041955]" />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#041955] mb-4">
              {tournamentName} {seasonLabel} Owners
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              Meet the passionate owners who will participate in the auction
            </p>
            <div className="inline-block bg-[#E6B31E] text-[#041955] px-6 py-2 rounded-full font-bold">
              Total Owners: {owners.length}
            </div>
          </div>

          {/* Owners Grid */}
          {owners.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {owners.map((owner) => {
                const hasImageError = imageErrors.has(owner.id);

                return (
                  <div
                    key={owner.id}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                  >
                    {/* Owner Image */}
                    <div className="relative h-64 bg-gradient-to-br from-[#041955] to-[#062972] flex items-center justify-center overflow-hidden">
                      {owner.imageUrl && !hasImageError ? (
                        <img
                          src={owner.imageUrl}
                          alt={owner.name}
                          className="w-full h-full object-cover"
                          onError={() => handleImageError(owner.id)}
                          loading="lazy"
                        />
                      ) : (
                        <Users className="w-24 h-24 text-white/30" />
                      )}
                    </div>

                    {/* Owner Details */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-[#041955] mb-2">
                        {owner.name}
                      </h3>
                      
                      {owner.bio && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {owner.bio}
                        </p>
                      )}

                      <div className="space-y-2">
                        {owner.email && (
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Mail className="w-4 h-4 text-[#E6B31E]" />
                            <a
                              href={`mailto:${owner.email}`}
                              className="hover:text-[#041955] transition-colors truncate"
                            >
                              {owner.email}
                            </a>
                          </div>
                        )}
                        {owner.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Phone className="w-4 h-4 text-[#E6B31E]" />
                            <a
                              href={`tel:${owner.phone}`}
                              className="hover:text-[#041955] transition-colors"
                            >
                              {owner.phone}
                            </a>
                          </div>
                        )}
                      </div>

                      {owner.teamName && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center gap-2 text-sm">
                            <Trophy className="w-4 h-4 text-[#E6B31E]" />
                            <span className="text-gray-600">Team:</span>
                            <span className="font-semibold text-[#041955]">{owner.teamName}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <Users className="w-24 h-24 mx-auto mb-6 text-gray-400" />
              <h2 className="text-2xl font-bold text-[#041955] mb-4">
                Owners Coming Soon
              </h2>
              <p className="text-lg text-gray-600">
                The list of owners for {seasonLabel} will be announced soon. Stay tuned!
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </Suspense>
  );
}

