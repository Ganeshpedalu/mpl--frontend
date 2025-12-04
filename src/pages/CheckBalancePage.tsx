import { Suspense, lazy, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader, Wallet, ArrowLeft, AlertCircle, TrendingUp, Users } from 'lucide-react';
import { getApiUrl } from '../config/apiConfig';

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
  email?: string;
  phone?: string;
  imageUrl?: string;
  bio?: string;
  teamName?: string;
  season?: string;
  purseValue?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface OwnersApiResponse {
  success: boolean;
  data: OwnerData[];
  count: number;
  message?: string;
}

export default function CheckBalancePage() {
  const navigate = useNavigate();
  const [owners, setOwners] = useState<OwnerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchOwners = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      setError(null);

      const response = await fetch(getApiUrl('owners'));

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

      if (result.success) {
        // Handle both array and empty data cases
        const ownersData = result.data || [];
        // Sort owners by purse value (highest first)
        const sortedOwners = [...ownersData].sort((a, b) => {
          const aValue = a.purseValue ?? 0;
          const bValue = b.purseValue ?? 0;
          return bValue - aValue;
        });
        setOwners(sortedOwners);
      } else {
        throw new Error(result.message || 'Failed to fetch owners');
      }
    } catch (err) {
      console.error('Error fetching owners:', err);
      const errorMsg = err instanceof Error ? err.message : 'Network error. Please check your connection and try again.';
      setError(errorMsg);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchOwners();
    
    // Set up polling for real-time updates (every 3 seconds)
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

  const totalPurseValue = owners.reduce((sum, owner) => sum + (owner.purseValue ?? 0), 0);
  const averagePurseValue = owners.length > 0 ? totalPurseValue / owners.length : 0;

  if (loading) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="text-center">
            <Loader className="w-12 h-12 animate-spin text-[#041955] mx-auto mb-4" />
            <p className="text-lg text-gray-600">Loading balance information...</p>
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
              onClick={() => fetchOwners()}
              className="bg-[#041955] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#062972] transition-all mr-2"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/players')}
              className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-all"
            >
              <ArrowLeft className="w-5 h-5 inline mr-2" />
              Back to Players
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
          {/* Back Button */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/players')}
              className="flex items-center text-[#041955] hover:text-[#E6B31E] transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="font-semibold">Back to Players</span>
            </button>
          </div>

          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#E6B31E] rounded-full mb-6">
              <Wallet className="w-12 h-12 text-[#041955]" />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#041955] mb-4">
              Owner Balance
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Current purse values for all owners
            </p>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-600">Total Owners</span>
                  <Users className="w-6 h-6 text-[#041955]" />
                </div>
                <p className="text-3xl font-bold text-[#041955]">{owners.length}</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-600">Total Purse Value</span>
                  <TrendingUp className="w-6 h-6 text-[#E6B31E]" />
                </div>
                <p className="text-3xl font-bold text-[#041955]">
                  ₹{totalPurseValue.toLocaleString('en-IN')}
                </p>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-600">Average Balance</span>
                  <Wallet className="w-6 h-6 text-[#041955]" />
                </div>
                <p className="text-3xl font-bold text-[#041955]">
                  ₹{Math.round(averagePurseValue).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>

          {/* Owners Balance Grid */}
          {owners.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {owners.map((owner, index) => {
                const purseValue = owner.purseValue ?? 0;
                const isTopThree = index < 3;
                
                return (
                  <div
                    key={owner.id}
                    className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${
                      isTopThree ? 'ring-2 ring-[#E6B31E]' : ''
                    }`}
                  >
                    {/* Rank Badge */}
                    {isTopThree && (
                      <div className="bg-gradient-to-r from-[#E6B31E] to-[#F4C430] text-[#041955] px-4 py-2 text-center font-bold">
                        #{index + 1} Highest Balance
                      </div>
                    )}

                    {/* Owner Info */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-[#041955] truncate">
                          {owner.name}
                        </h3>
                        {!isTopThree && (
                          <span className="text-sm text-gray-500 font-semibold">
                            #{index + 1}
                          </span>
                        )}
                      </div>
                      
                      {owner.teamName && (
                        <p className="text-sm text-gray-600 mb-4">
                          {owner.teamName}
                        </p>
                      )}

                      {/* Purse Value Display */}
                      <div className="bg-gradient-to-br from-[#041955] to-[#062972] rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-300 mb-1">Current Balance</p>
                        <p className="text-3xl font-bold text-white">
                          ₹{purseValue.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <Wallet className="w-24 h-24 mx-auto mb-6 text-gray-400" />
              <h2 className="text-2xl font-bold text-[#041955] mb-4">
                No Owners Found
              </h2>
              <p className="text-lg text-gray-600">
                Owner balance information will be available once owners are registered.
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </Suspense>
  );
}

