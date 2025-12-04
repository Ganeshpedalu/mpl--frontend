import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader, AlertCircle, User, Phone, Shirt, Target, ArrowLeft, Users, ChevronLeft, ChevronRight, X, Crown, ShoppingCart, UserCheck, Mail, Filter, Search } from 'lucide-react';
import { getApiUrl } from '../config/apiConfig';
import LazyImage from '../components/LazyImage';
import { useOwners, type OwnerData } from '../context/OwnersContext';

interface RegistrationImages {
  profileImage: string;
  aadhaarImage: string;
  paymentImage: string;
}

interface PlayerData {
  mobileNumber: string;
  firstName: string;
  lastName: string;
  tshirtSize: string;
  tshirtName: string;
  tshirtNumber: string;
  role: string;
  images: RegistrationImages;
  createdAt: string;
  isSold?: boolean;
  isIconPlayer?: boolean;
  ownerId?: string | OwnerData;
  owner?: OwnerData;
  bidAmount?: number;
}

interface PlayersApiResponse {
  success: boolean;
  data: PlayerData[];
  count: number;
  message?: string;
}

export default function PlayersPage() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [allPlayers, setAllPlayers] = useState<PlayerData[]>([]); // For modal navigation
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDirection, setModalDirection] = useState<'left' | 'right' | 'none'>('none');
  const [cardAnimations, setCardAnimations] = useState<boolean[]>([]);
  
  // Filter states
  const [filters, setFilters] = useState({
    isSold: 'false' as 'true' | 'false' | 'all',
    isIconPlayer: 'false' as 'true' | 'false' | 'all',
    ownerId: '' as string,
    search: '' as string,
    maxBidAmount: false as boolean,
  });
  const [searchInput, setSearchInput] = useState('');
  const [updatingOwner, setUpdatingOwner] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<{ ownerName: string; playerName: string; amount: number } | null>(null);
  const [bidAmount, setBidAmount] = useState<number>(0);
  
  // Use owners from context (cached, no repeated API calls)
  const { owners, loading: loadingOwners } = useOwners();
  
  // Ref to prevent unnecessary API calls
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  // Memoized request body to avoid unnecessary API calls
  const requestBody = useMemo(() => {
    const body: Record<string, any> = {};
    
    if (filters.isSold !== 'all') {
      body.isSold = filters.isSold === 'true';
    }
    if (filters.isIconPlayer !== 'all') {
      body.isIconPlayer = filters.isIconPlayer === 'true';
    }
    if (filters.ownerId) {
      body.ownerId = filters.ownerId;
    }
    if (filters.search.trim()) {
      body.search = filters.search.trim();
    }
    if (filters.maxBidAmount) {
      body.maxBidAmount = true;
    }
    
    return body;
  }, [filters.isSold, filters.isIconPlayer, filters.ownerId, filters.search, filters.maxBidAmount]);

  // Fetch players function (can be called manually for real-time updates)
  const fetchPlayers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(getApiUrl('players'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch players');
      }

      const result: PlayersApiResponse = await response.json();

      if (result.success && result.data) {
        setTotalCount(result.count);
        setAllPlayers(result.data);
        setPlayers(result.data);
        // Initialize card animations
        setCardAnimations(new Array(result.data.length).fill(false));
        // Trigger staggered animations
        setTimeout(() => {
          setCardAnimations(new Array(result.data.length).fill(true));
        }, 100);
      } else {
        throw new Error(result.message || 'Failed to fetch players');
      }
    } catch (err) {
      console.error('Error fetching players:', err);
      const errorMsg = err instanceof Error ? err.message : 'Network error. Please check your connection and try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [requestBody]);

  // Fetch players when filters change
  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  // Note: Infinite scroll removed - all filtered results are fetched at once

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }, []);

  const handlePlayerClick = (playerIndex: number) => {
    setBidAmount(0); // Reset counter when opening a player modal
    setSelectedPlayerIndex(playerIndex);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlayerIndex(null);
  };

  const handlePreviousPlayer = () => {
    if (selectedPlayerIndex !== null && selectedPlayerIndex > 0) {
      setBidAmount(0); // Reset counter when moving to previous player
      setModalDirection('right');
      setTimeout(() => {
        setSelectedPlayerIndex(selectedPlayerIndex - 1);
        setModalDirection('none');
      }, 300);
    }
  };

  const handleNextPlayer = () => {
    if (selectedPlayerIndex !== null && selectedPlayerIndex < allPlayers.length - 1) {
      setBidAmount(0); // Reset counter when moving to next player
      setModalDirection('left');
      setTimeout(() => {
        setSelectedPlayerIndex(selectedPlayerIndex + 1);
        setModalDirection('none');
      }, 300);
    }
  };

  const handleFilterChange = (key: keyof typeof filters, value: string | 'true' | 'false' | 'all' | boolean) => {
    setFilters(prev => ({
      ...prev,
      [key]: value as any,
    }));
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    setFilters(prev => ({
      ...prev,
      search: searchInput,
    }));
  };

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters(prev => ({
        ...prev,
        search: searchInput,
      }));
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  const clearFilters = () => {
    setFilters({
      isSold: 'false',
      isIconPlayer: 'false',
      ownerId: '',
      search: '',
      maxBidAmount: false,
    });
    setSearchInput('');
  };

  const handleOwnerSelect = async (ownerId: string) => {
    if (!selectedPlayer) return;

    try {
      setUpdatingOwner(ownerId);
      
      // API call to update player's ownerId
      // Expected endpoint: PUT /api/players/:mobileNumber
      // Body: { ownerId: string, bidAmount: number }
      const response = await fetch(`${getApiUrl('players')}/${selectedPlayer.mobileNumber}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ownerId, bidAmount }),
      });

      if (!response.ok) {
        let errorMsg = 'Failed to assign owner';
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorData.error || errorMsg;
        } catch (parseError) {
          errorMsg = response.statusText || errorMsg;
        }
        throw new Error(errorMsg);
      }

      const result = await response.json();

      if (result.success) {
        // Find the owner from the owners array
        const assignedOwner = owners.find(o => o.id === ownerId);
        
        // Refetch players to get updated data from server (real-time update)
        await fetchPlayers();
        
        // Show congratulations message
        if (assignedOwner) {
          const currentIndex = selectedPlayerIndex;
          setSuccessMessage({
            ownerName: assignedOwner.name,
            playerName: `${selectedPlayer.firstName} ${selectedPlayer.lastName}`,
            amount: bidAmount,
          });
          
          // Reset bid amount after assignment
          setBidAmount(0);
          
          // Auto-advance to next player after 4 seconds
          setTimeout(() => {
            setSuccessMessage(null);
            // Refetch again to ensure we have latest data before navigating
            fetchPlayers().then(() => {
              if (currentIndex !== null && currentIndex < allPlayers.length - 1) {
                setBidAmount(0); // Reset counter when auto-advancing to next player
                setModalDirection('left');
                setTimeout(() => {
                  setSelectedPlayerIndex(currentIndex + 1);
                  setModalDirection('none');
                }, 300);
              }
            });
          }, 4000);
        }
      } else {
        throw new Error(result.message || result.error || 'Failed to assign owner');
      }
    } catch (err) {
      console.error('Error updating owner:', err);
      alert(err instanceof Error ? err.message : 'Failed to assign owner. Please try again.');
    } finally {
      setUpdatingOwner(null);
    }
  };

  // Handle keyboard navigation, body scroll lock, and arrow keys for bid amount
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Up arrow key: increment bid amount by 500 (works everywhere on the page)
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setBidAmount(prev => Math.max(0, prev + 500));
        return;
      }
      
      // Down arrow key: decrement bid amount by 500 (works everywhere on the page)
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setBidAmount(prev => Math.max(0, prev - 500));
        return;
      }
      
      // Modal-specific keyboard shortcuts
      if (!isModalOpen) return;
      
      if (e.key === 'Escape') {
        handleCloseModal();
      } else if (e.key === 'ArrowLeft') {
        handlePreviousPlayer();
      } else if (e.key === 'ArrowRight') {
        handleNextPlayer();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen, selectedPlayerIndex, allPlayers.length]);

  const getPlayerIndex = (player: PlayerData) => {
    const index = allPlayers.findIndex(p => p.mobileNumber === player.mobileNumber);
    return index >= 0 ? index + 1 : 0;
  };

  const selectedPlayer = selectedPlayerIndex !== null && allPlayers.length > 0 
    ? allPlayers[selectedPlayerIndex] 
    : null;

  if (loading && players.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-[#041955] mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading players...</p>
        </div>
      </div>
    );
  }

  if (error && players.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#041955] mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-[#041955] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#062972] transition-all"
          >
            <ArrowLeft className="w-5 h-5 inline mr-2" />
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-[#041955] hover:text-[#E6B31E] transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="font-semibold">Back to Home</span>
          </button>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#041955] mb-2 flex items-center animate-fade-in">
                <Users className="w-10 h-10 mr-3 animate-pulse" />
                All Players
              </h1>
              <p className="text-lg text-gray-600">
                {totalCount > 0 && `${totalCount} player${totalCount !== 1 ? 's' : ''} found`}
              </p>
            </div>
          </div>

          {/* Filters Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#041955] flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </h2>
              <button
                onClick={clearFilters}
                className="text-sm text-[#041955] hover:text-[#E6B31E] font-semibold transition-colors"
              >
                Clear All
              </button>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="mb-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search by name, mobile number, or team..."
                  className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-gray-300 focus:border-[#E6B31E] focus:outline-none transition-colors"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput('');
                      handleFilterChange('search', '');
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </form>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Is Sold Filter */}
              <div>
                <label className="block text-sm font-semibold text-[#041955] mb-2">
                  Sold Status
                </label>
                <select
                  value={filters.isSold}
                  onChange={(e) => handleFilterChange('isSold', e.target.value as 'true' | 'false' | 'all')}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-[#E6B31E] focus:outline-none transition-colors"
                >
                  <option value="all">All Players</option>
                  <option value="false">Unsold</option>
                  <option value="true">Sold</option>
                </select>
              </div>

              {/* Is Icon Player Filter */}
              <div>
                <label className="block text-sm font-semibold text-[#041955] mb-2">
                  Icon Player
                </label>
                <select
                  value={filters.isIconPlayer}
                  onChange={(e) => handleFilterChange('isIconPlayer', e.target.value as 'true' | 'false' | 'all')}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-[#E6B31E] focus:outline-none transition-colors"
                >
                  <option value="all">All Players</option>
                  <option value="false">Regular Players</option>
                  <option value="true">Icon Players</option>
                </select>
              </div>

              {/* Owner Filter */}
              <div>
                <label className="block text-sm font-semibold text-[#041955] mb-2">
                  Owner
                </label>
                <select
                  value={filters.ownerId}
                  onChange={(e) => handleFilterChange('ownerId', e.target.value)}
                  disabled={loadingOwners}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-[#E6B31E] focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">All Owners</option>
                  {owners.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.name} {owner.teamName ? `(${owner.teamName})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Maximum Bid Amount Filter */}
              <div>
                <label className="block text-sm font-semibold text-[#041955] mb-2">
                  Maximum Bid
                </label>
                <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-3 border-2 border-gray-300 hover:border-[#E6B31E] transition-colors">
                  <input
                    type="checkbox"
                    id="maxBidAmount"
                    checked={filters.maxBidAmount}
                    onChange={(e) => handleFilterChange('maxBidAmount', e.target.checked)}
                    className="w-5 h-5 text-[#E6B31E] border-gray-300 rounded focus:ring-[#E6B31E] focus:ring-2 cursor-pointer"
                  />
                  <label htmlFor="maxBidAmount" className="text-sm text-[#041955] font-medium cursor-pointer flex-1">
                    Highest Bid Amount
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {players.map((player, cardIndex) => {
            const playerIndex = getPlayerIndex(player);
            const arrayIndex = allPlayers.findIndex(p => p.mobileNumber === player.mobileNumber);
            const isAnimated = cardAnimations[cardIndex] || false;
            return (
              <div
                key={player.mobileNumber}
                onClick={() => arrayIndex >= 0 && handlePlayerClick(arrayIndex)}
                className={`
                  bg-white rounded-xl shadow-lg overflow-hidden 
                  transition-all duration-500 cursor-pointer 
                  transform relative
                  ${isAnimated 
                    ? 'opacity-100 translate-y-0 scale-100' 
                    : 'opacity-0 translate-y-10 scale-95'
                  }
                  hover:shadow-2xl hover:-translate-y-2 hover:scale-105
                `}
                style={{
                  animationDelay: `${cardIndex * 50}ms`,
                  transitionDelay: `${cardIndex * 30}ms`
                }}
              >
                {/* Index Badge */}
                {playerIndex > 0 && (
                  <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-[#E6B31E] to-[#d4a017] text-[#041955] font-bold text-sm px-3 py-1 rounded-full shadow-lg transform hover:scale-110 transition-transform animate-pulse-slow">
                    #{playerIndex}
                  </div>
                )}

                {/* Status Badges */}
                <div className="absolute top-2 right-2 z-10 flex flex-col gap-2">
                  {player.isIconPlayer && (
                    <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-bold text-xs px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      Icon
                    </div>
                  )}
                  {player.isSold && (
                    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-xs px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <ShoppingCart className="w-3 h-3" />
                      Sold
                    </div>
                  )}
                </div>
                
                {/* Player Card */}
                <div className="relative">
                  <div className="bg-gradient-to-r from-[#041955] to-[#062972] p-4 pb-8 relative overflow-hidden">
                    {/* Animated background effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#E6B31E]/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="flex flex-col items-center relative z-10">
                      <div className="relative group">
                        <LazyImage
                          src={player.images.profileImage}
                          alt={`${player.firstName} ${player.lastName}`}
                          className="w-24 h-24 rounded-full border-4 border-[#E6B31E] object-cover shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                        />
                        <div className="absolute inset-0 rounded-full bg-[#E6B31E] opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></div>
                      </div>
                      <div className="mt-4 text-center">
                        <h3 className="text-xl font-bold text-white transform transition-all duration-300 group-hover:scale-105">
                          {player.firstName} {player.lastName}
                        </h3>
                        <p className="text-sm text-gray-300 mt-1">#{player.tshirtNumber}</p>
                      </div>
                    </div>
                  </div>

                {/* Player Details */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <Target className="w-4 h-4 text-[#E6B31E]" />
                    <span className="text-gray-700 font-medium">{player.role}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <Shirt className="w-4 h-4 text-[#E6B31E]" />
                    <span className="text-gray-700">
                      Size: <span className="font-semibold">{player.tshirtSize}</span>
                    </span>
                  </div>

                  {player.tshirtName && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Shirt className="w-4 h-4 text-[#E6B31E]" />
                      <span className="text-gray-700">
                        Name: <span className="font-semibold">{player.tshirtName}</span>
                      </span>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="w-4 h-4 text-[#E6B31E]" />
                    <span className="text-gray-600">{player.mobileNumber}</span>
                  </div>

                  {/* Bid Amount - Show if player is sold */}
                  {player.isSold && player.bidAmount !== undefined && (
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex items-center space-x-2 text-xs mb-2">
                        <ShoppingCart className="w-4 h-4 text-[#E6B31E]" />
                        <span className="text-gray-600 font-semibold">Sold For:</span>
                      </div>
                      <div className="pl-6">
                        <p className="text-lg font-bold text-[#041955]">
                          ₹{player.bidAmount.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Owner Information */}
                  {player.owner && (
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex items-center space-x-2 text-xs mb-2">
                        <UserCheck className="w-4 h-4 text-[#E6B31E]" />
                        <span className="text-gray-600 font-semibold">Owner:</span>
                      </div>
                      <div className="pl-6 space-y-1">
                        <p className="text-sm font-bold text-[#041955]">{player.owner.name}</p>
                        {player.owner.teamName && (
                          <p className="text-xs text-gray-600">{player.owner.teamName}</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Registered: {formatDate(player.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            );
          })}
        </div>

        {/* Modal for Player Details */}
        {isModalOpen && selectedPlayer && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4 animate-fade-in"
            onClick={handleCloseModal}
          >
            {/* Congratulations Message Overlay */}
            {successMessage && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-black bg-opacity-90 animate-fade-in">
                <div className="bg-gradient-to-br from-[#E6B31E] to-[#d4a017] rounded-2xl p-8 md:p-12 text-center shadow-2xl max-w-2xl mx-4" style={{ animation: 'scaleIn 0.3s ease-out forwards' }}>
                  <div className="mb-6">
                    <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center mb-4 animate-bounce">
                      <UserCheck className="w-12 h-12 text-[#E6B31E]" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-[#041955] mb-4">
                      🎉 Congratulations! 🎉
                    </h2>
                    <p className="text-2xl md:text-3xl font-semibold text-[#041955] mb-2">
                      {successMessage.playerName}
                    </p>
                    <p className="text-xl md:text-2xl text-[#041955]">
                      has been picked by
                    </p>
                    <p className="text-2xl md:text-3xl font-bold text-[#041955] mt-2">
                      {successMessage.ownerName}
                    </p>
                    {owners.find(o => o.id === selectedPlayer.ownerId)?.teamName && (
                      <p className="text-lg md:text-xl text-[#041955]/80 mt-2">
                        ({owners.find(o => o.id === selectedPlayer.ownerId)?.teamName})
                      </p>
                    )}
                    <div className="mt-6 pt-6 border-t-2 border-[#041955]/20">
                      <p className="text-xl md:text-2xl text-[#041955] mb-2">
                        Bid Amount
                      </p>
                      <p className="text-3xl md:text-4xl font-bold text-[#041955]">
                        ₹{successMessage.amount.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-[#041955]/70 animate-pulse">
                    Moving to next player...
                  </div>
                </div>
              </div>
            )}

            <div 
              className={`
                w-full h-full max-w-[95vw] max-h-[95vh] 
                relative transform transition-all duration-500
                ${modalDirection === 'left' ? 'translate-x-full opacity-0' : ''}
                ${modalDirection === 'right' ? '-translate-x-full opacity-0' : ''}
                ${modalDirection === 'none' ? 'translate-x-0 opacity-100' : ''}
                animate-slide-in
              `}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 z-20 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X className="w-6 h-6 text-[#041955]" />
              </button>

              {/* Navigation Arrows */}
              {selectedPlayerIndex !== null && selectedPlayerIndex > 0 && (
                <button
                  onClick={handlePreviousPlayer}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-colors"
                  aria-label="Previous Player"
                >
                  <ChevronLeft className="w-6 h-6 text-[#041955]" />
                </button>
              )}

              {selectedPlayerIndex !== null && selectedPlayerIndex < allPlayers.length - 1 && (
                <button
                  onClick={handleNextPlayer}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-colors"
                  aria-label="Next Player"
                >
                  <ChevronRight className="w-6 h-6 text-[#041955]" />
                </button>
              )}

              {/* Main Layout: Owners on sides, Player in center */}
              <div className="flex items-center justify-center h-full gap-6 px-4">
                {/* Left Side Owners */}
                <div className="flex-1 max-w-[300px] h-full flex flex-col justify-center">
                  {(() => {
                    const midPoint = Math.ceil(owners.length / 2);
                    const leftOwners = owners.slice(0, midPoint);
                    
                    return (
                      <div className="space-y-4 pr-2">
                        {loadingOwners ? (
                          <div className="flex justify-center items-center py-8">
                            <Loader className="w-8 h-8 animate-spin text-white" />
                          </div>
                        ) : leftOwners.length === 0 ? (
                          <div className="text-center py-8 text-white/50">
                            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          </div>
                        ) : (
                          leftOwners.map((owner) => {
                            const isSelected = selectedPlayer.owner?.id === owner.id;
                            const isUpdating = updatingOwner === owner.id;
                            
                            return (
                              <button
                                key={owner.id}
                                onClick={() => handleOwnerSelect(owner.id)}
                                disabled={isUpdating || isSelected}
                                className={`
                                  w-full relative bg-white rounded-xl p-4 shadow-lg 
                                  transition-all duration-300 transform
                                  ${isSelected 
                                    ? 'ring-4 ring-[#E6B31E] scale-105 bg-gradient-to-br from-[#E6B31E]/10 to-[#E6B31E]/5' 
                                    : 'hover:shadow-2xl hover:scale-105 hover:-translate-x-2 active:scale-95'
                                  }
                                  ${isUpdating ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
                                  ${isSelected ? 'cursor-default' : ''}
                                `}
                              >
                                {isUpdating && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-xl z-10">
                                    <Loader className="w-6 h-6 animate-spin text-[#041955]" />
                                  </div>
                                )}
                                
                                {isSelected && (
                                  <div className="absolute top-2 right-2 bg-[#E6B31E] text-[#041955] rounded-full p-1.5 shadow-lg z-10">
                                    <UserCheck className="w-4 h-4" />
                                  </div>
                                )}
                                
                                <div className="flex items-center space-x-3">
                                  {owner.imageUrl ? (
                                    <img
                                      src={owner.imageUrl}
                                      alt={owner.name}
                                      className={`w-16 h-16 rounded-full object-cover border-2 flex-shrink-0 transition-all ${
                                        isSelected ? 'border-[#E6B31E] border-4' : 'border-gray-300 hover:border-[#E6B31E]'
                                      }`}
                                    />
                                  ) : (
                                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-[#041955] to-[#062972] flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                                      isSelected ? 'border-[#E6B31E] border-4' : 'border-gray-300 hover:border-[#E6B31E]'
                                    }`}>
                                      <Users className="w-8 h-8 text-white" />
                                    </div>
                                  )}
                                  
                                  <div className="flex-1 text-left min-w-0">
                                    <h4 className="font-bold text-[#041955] text-sm mb-1 truncate">
                                      {owner.name}
                                    </h4>
                                    {owner.teamName && (
                                      <p className="text-xs text-gray-600 truncate">
                                        {owner.teamName}
                                      </p>
                                    )}
                                    {isSelected && (
                                      <p className="text-xs text-[#E6B31E] font-semibold mt-1 animate-pulse">
                                        ✓ Assigned
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Center: Player Details */}
                <div className="flex-shrink-0 w-full max-w-4xl">
                  <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-10 max-h-[90vh] overflow-y-auto">
                    {/* Header with Index */}
                    <div className="text-center mb-8 animate-fade-in">
                      <div className="inline-block bg-gradient-to-r from-[#E6B31E] to-[#d4a017] text-[#041955] font-bold text-xl md:text-2xl px-6 py-3 rounded-full mb-4 shadow-lg transform hover:scale-105 transition-transform animate-pulse-slow">
                        #{selectedPlayerIndex !== null ? selectedPlayerIndex + 1 : ''} of {totalCount}
                      </div>
                      {/* Status Badges */}
                      <div className="flex items-center justify-center gap-3 mt-4">
                        {selectedPlayer.isIconPlayer && (
                          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-bold text-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                            <Crown className="w-4 h-4" />
                            Icon Player
                          </div>
                        )}
                        {selectedPlayer.isSold && (
                          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                            <ShoppingCart className="w-4 h-4" />
                            Sold
                          </div>
                        )}
                      </div>
                      
                      {/* Bid Amount Counter - Small Tile */}
                      <div className="mt-6 flex justify-center">
                        <div className="bg-gradient-to-br from-[#E6B31E] to-[#d4a017] rounded-xl px-6 py-4 shadow-lg transform hover:scale-105 transition-transform">
                          <div className="text-center">
                            <p className="text-xs text-[#041955] font-semibold mb-1">Bid Amount</p>
                            <p className="text-2xl md:text-3xl font-bold text-[#041955]">
                              ₹{bidAmount.toLocaleString('en-IN')}
                            </p>
                            <div className="flex items-center justify-center gap-2 mt-2 text-xs text-[#041955]/70">
                              <span>↑ +₹500</span>
                              <span>•</span>
                              <span>↓ -₹500</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Profile Section */}
                    <div className="bg-gradient-to-r from-[#041955] to-[#062972] p-8 md:p-10 text-white rounded-xl mb-6 relative overflow-hidden animate-slide-up">
                      {/* Animated background pattern */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-64 h-64 bg-[#E6B31E] rounded-full blur-3xl animate-float"></div>
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#E6B31E] rounded-full blur-3xl animate-float-delayed"></div>
                      </div>
                      
                      <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8 relative z-10">
                        <div className="relative group">
                          <div className="absolute inset-0 bg-[#E6B31E] rounded-full blur-2xl opacity-50 animate-pulse"></div>
                          <LazyImage
                            src={selectedPlayer.images.profileImage}
                            alt={`${selectedPlayer.firstName} ${selectedPlayer.lastName}`}
                            className="w-40 h-40 md:w-56 md:h-56 rounded-full border-4 border-[#E6B31E] object-cover shadow-2xl transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 relative z-10"
                          />
                        </div>
                        <div className="flex-1 text-center md:text-left animate-slide-up" style={{ animationDelay: '0.2s' }}>
                          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 transform transition-all duration-300 hover:scale-105">
                            {selectedPlayer.firstName} {selectedPlayer.lastName}
                          </h2>
                          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-lg">
                            <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                              <Phone className="w-5 h-5" />
                              <span>{selectedPlayer.mobileNumber}</span>
                            </div>
                            <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                              <Shirt className="w-5 h-5" />
                              <span>#{selectedPlayer.tshirtNumber}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid md:grid-cols-2 gap-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                      <div className="space-y-4">
                        <h3 className="text-2xl md:text-3xl font-bold text-[#041955] mb-6 flex items-center transform transition-all duration-300 hover:scale-105">
                          <User className="w-6 h-6 mr-3 text-[#E6B31E]" />
                          Personal Information
                        </h3>
                        
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="bg-[#E6B31E] p-2 rounded-lg">
                              <Target className="w-6 h-6 text-[#041955]" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 font-medium">Playing Role</p>
                              <p className="text-xl font-bold text-[#041955]">{selectedPlayer.role}</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="bg-[#E6B31E] p-2 rounded-lg">
                              <Shirt className="w-6 h-6 text-[#041955]" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 font-medium">T-Shirt Size</p>
                              <p className="text-xl font-bold text-[#041955]">{selectedPlayer.tshirtSize}</p>
                            </div>
                          </div>
                        </div>

                        {selectedPlayer.tshirtName && (
                          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="bg-[#E6B31E] p-2 rounded-lg">
                                <Shirt className="w-6 h-6 text-[#041955]" />
                              </div>
                              <div>
                                <p className="text-sm text-gray-500 font-medium">Name on T-Shirt</p>
                                <p className="text-xl font-bold text-[#041955]">{selectedPlayer.tshirtName}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="bg-[#E6B31E] p-2 rounded-lg">
                              <Phone className="w-6 h-6 text-[#041955]" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 font-medium">Mobile Number</p>
                              <p className="text-xl font-bold text-[#041955]">{selectedPlayer.mobileNumber}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-2xl md:text-3xl font-bold text-[#041955] mb-6 transform transition-all duration-300 hover:scale-105">
                          Registration Info
                        </h3>
                        
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                          <p className="text-sm text-gray-500 font-medium mb-2">Registration Date</p>
                          <p className="text-xl font-bold text-[#041955]">{formatDate(selectedPlayer.createdAt)}</p>
                        </div>

                        {/* Bid Amount - Show if player is sold */}
                        {selectedPlayer.isSold && selectedPlayer.bidAmount !== undefined && (
                          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 transform transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 border-green-200">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="bg-green-500 p-2 rounded-lg">
                                <ShoppingCart className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <p className="text-sm text-gray-500 font-medium">Sold For</p>
                                <p className="text-2xl font-bold text-[#041955]">
                                  ₹{selectedPlayer.bidAmount.toLocaleString('en-IN')}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Owner Information */}
                        {selectedPlayer.owner && (
                          <div className="bg-gradient-to-br from-[#E6B31E]/10 to-[#E6B31E]/5 rounded-xl p-5 transform transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 border-[#E6B31E]/20">
                            <div className="flex items-center space-x-3 mb-4">
                              <div className="bg-[#E6B31E] p-2 rounded-lg">
                                <UserCheck className="w-6 h-6 text-[#041955]" />
                              </div>
                              <h4 className="text-lg font-bold text-[#041955]">Owner Information</h4>
                            </div>
                            <div className="space-y-3">
                              {selectedPlayer.owner.imageUrl && (
                                <div className="flex items-center space-x-3">
                                  <img
                                    src={selectedPlayer.owner.imageUrl}
                                    alt={selectedPlayer.owner.name}
                                    className="w-16 h-16 rounded-full object-cover border-2 border-[#E6B31E]"
                                  />
                                  <div>
                                    <p className="text-lg font-bold text-[#041955]">{selectedPlayer.owner.name}</p>
                                    {selectedPlayer.owner.teamName && (
                                      <p className="text-sm text-gray-600">{selectedPlayer.owner.teamName}</p>
                                    )}
                                  </div>
                                </div>
                              )}
                              {!selectedPlayer.owner.imageUrl && (
                                <div>
                                  <p className="text-lg font-bold text-[#041955]">{selectedPlayer.owner.name}</p>
                                  {selectedPlayer.owner.teamName && (
                                    <p className="text-sm text-gray-600">{selectedPlayer.owner.teamName}</p>
                                  )}
                                </div>
                              )}
                              {selectedPlayer.owner.email && (
                                <div className="flex items-center space-x-2 text-sm">
                                  <Mail className="w-4 h-4 text-[#E6B31E]" />
                                  <a
                                    href={`mailto:${selectedPlayer.owner.email}`}
                                    className="text-[#041955] hover:underline"
                                  >
                                    {selectedPlayer.owner.email}
                                  </a>
                                </div>
                              )}
                              {selectedPlayer.owner.phone && (
                                <div className="flex items-center space-x-2 text-sm">
                                  <Phone className="w-4 h-4 text-[#E6B31E]" />
                                  <a
                                    href={`tel:${selectedPlayer.owner.phone}`}
                                    className="text-[#041955] hover:underline"
                                  >
                                    {selectedPlayer.owner.phone}
                                  </a>
                                </div>
                              )}
                              {selectedPlayer.owner.bio && (
                                <p className="text-sm text-gray-600 mt-2">{selectedPlayer.owner.bio}</p>
                              )}
                            </div>
                          </div>
                        )}

                        <button
                          onClick={() => {
                            handleCloseModal();
                            navigate(`/details?mobile=${selectedPlayer.mobileNumber}`);
                          }}
                          className="w-full bg-gradient-to-r from-[#041955] to-[#062972] text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-[#062972] hover:to-[#041955] transition-all duration-300 transform hover:scale-105 shadow-lg"
                        >
                          View Full Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side Owners */}
                <div className="flex-1 max-w-[300px] h-full flex flex-col justify-center">
                  {(() => {
                    const midPoint = Math.ceil(owners.length / 2);
                    const rightOwners = owners.slice(midPoint);
                    
                    return (
                      <div className="space-y-4 pl-2">
                        {loadingOwners ? (
                          <div className="flex justify-center items-center py-8">
                            <Loader className="w-8 h-8 animate-spin text-white" />
                          </div>
                        ) : rightOwners.length === 0 ? (
                          <div className="text-center py-8 text-white/50">
                            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          </div>
                        ) : (
                          rightOwners.map((owner) => {
                            const isSelected = selectedPlayer.owner?.id === owner.id;
                            const isUpdating = updatingOwner === owner.id;
                            
                            return (
                              <button
                                key={owner.id}
                                onClick={() => handleOwnerSelect(owner.id)}
                                disabled={isUpdating || isSelected}
                                className={`
                                  w-full relative bg-white rounded-xl p-4 shadow-lg 
                                  transition-all duration-300 transform
                                  ${isSelected 
                                    ? 'ring-4 ring-[#E6B31E] scale-105 bg-gradient-to-br from-[#E6B31E]/10 to-[#E6B31E]/5' 
                                    : 'hover:shadow-2xl hover:scale-105 hover:translate-x-2 active:scale-95'
                                  }
                                  ${isUpdating ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
                                  ${isSelected ? 'cursor-default' : ''}
                                `}
                              >
                                {isUpdating && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-xl z-10">
                                    <Loader className="w-6 h-6 animate-spin text-[#041955]" />
                                  </div>
                                )}
                                
                                {isSelected && (
                                  <div className="absolute top-2 right-2 bg-[#E6B31E] text-[#041955] rounded-full p-1.5 shadow-lg z-10">
                                    <UserCheck className="w-4 h-4" />
                                  </div>
                                )}
                                
                                <div className="flex items-center space-x-3">
                                  {owner.imageUrl ? (
                                    <img
                                      src={owner.imageUrl}
                                      alt={owner.name}
                                      className={`w-16 h-16 rounded-full object-cover border-2 flex-shrink-0 transition-all ${
                                        isSelected ? 'border-[#E6B31E] border-4' : 'border-gray-300 hover:border-[#E6B31E]'
                                      }`}
                                    />
                                  ) : (
                                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-[#041955] to-[#062972] flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                                      isSelected ? 'border-[#E6B31E] border-4' : 'border-gray-300 hover:border-[#E6B31E]'
                                    }`}>
                                      <Users className="w-8 h-8 text-white" />
                                    </div>
                                  )}
                                  
                                  <div className="flex-1 text-left min-w-0">
                                    <h4 className="font-bold text-[#041955] text-sm mb-1 truncate">
                                      {owner.name}
                                    </h4>
                                    {owner.teamName && (
                                      <p className="text-xs text-gray-600 truncate">
                                        {owner.teamName}
                                      </p>
                                    )}
                                    {isSelected && (
                                      <p className="text-xs text-[#E6B31E] font-semibold mt-1 animate-pulse">
                                        ✓ Assigned
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}


        {/* Error Message (if error occurs) */}
        {error && players.length > 0 && (
          <div className="text-center py-4">
            <p className="text-red-500 text-sm">{error}</p>
            <button
              onClick={() => {
                setError(null);
                // Trigger refetch by updating filters (will trigger useEffect)
                setFilters(prev => ({ ...prev }));
              }}
              className="mt-2 text-[#041955] hover:text-[#062972] text-sm font-semibold"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

