import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader, AlertCircle, User, Phone, Shirt, Target, ArrowLeft, Users, ChevronLeft, ChevronRight, X, Crown, ShoppingCart, UserCheck, Mail, Filter, Search, Wallet, Tag } from 'lucide-react';
import { getApiUrl } from '../config/apiConfig';
import LazyImage from '../components/LazyImage';
import { useOwners, type OwnerData } from '../context/OwnersContext';

interface RegistrationImages {
  profileImage: string;
  aadhaarImage: string;
  paymentImage: string;
}

interface CategoryData {
  id: string;
  name: string;
  basePrice: number;
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
  ownerId?: string | OwnerData | null;
  owner?: OwnerData;
  bidAmount?: number;
  categoryId?: {
    _id: string;
    name: string;
    basePrice: number;
  } | null;
  category?: CategoryData;
  isOwner?: boolean;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDirection, setModalDirection] = useState<'left' | 'right' | 'none'>('none');
  
  // Ref to track latest players for closures (reuse players state to reduce memory)
  const playersRef = useRef<PlayerData[]>([]);
  
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
  const { owners, loading: loadingOwners, refresh: refreshOwners } = useOwners();

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

  const requestBodyRef = useRef(requestBody);
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  requestBodyRef.current = requestBody; // Keep ref updated

  // Fetch players function (can be called manually for real-time updates)
  const fetchPlayers = useCallback(async (silent = false, customRequestBody?: typeof requestBody) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      setError(null);

      // Use custom body if provided, otherwise use current requestBody from ref
      const bodyToUse = customRequestBody || requestBodyRef.current;

      const response = await fetch(getApiUrl('players'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyToUse),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch players');
      }

      const result: PlayersApiResponse = await response.json();

      if (result.success && result.data) {
        // Use single players state to reduce memory (removed duplicate allPlayers and cardAnimations)
        setPlayers(result.data);
        playersRef.current = result.data; // Update ref for closures
      } else {
        throw new Error(result.message || 'Failed to fetch players');
      }
    } catch (err) {
      console.error('Error fetching players:', err);
      const errorMsg = err instanceof Error ? err.message : 'Network error. Please check your connection and try again.';
      setError(errorMsg);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []); // Remove requestBody dependency to prevent recreation

  // Note: Categories are fetched from the players API response, no separate fetch needed

  // Fetch players when filters change (no continuous polling)
  useEffect(() => {
    // Fetch with current requestBody
    fetchPlayers(false, requestBody);
  }, [requestBody, fetchPlayers]); // Now fetchPlayers is stable, so this is safe

  // Note: Infinite scroll removed - all filtered results are fetched at once

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }, []);

  // Get base price for a player (from category, default to 0)
  const getBasePrice = useCallback((player: PlayerData | null): number => {
    if (!player) return 0;
    
    // Prefer `category` field (formatted), fallback to `categoryId` (raw)
    if (player.category) {
      return player.category.basePrice;
    } else if (player.categoryId) {
      return player.categoryId.basePrice;
    }
    
    return 0;
  }, []);

  const handlePlayerClick = (playerIndex: number) => {
    const player = players[playerIndex];
    if (!player) return;
    const basePrice = getBasePrice(player);
    setBidAmount(basePrice); // Set counter to base price when opening a player modal
    setSelectedPlayerIndex(playerIndex);
    setIsModalOpen(true);
  };

  const handleCloseModal = useCallback(() => {
    // Clear any pending success timeout
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
      successTimeoutRef.current = null;
    }
    setIsModalOpen(false);
    setSelectedPlayerIndex(null);
    setBidAmount(0);
    setSuccessMessage(null);
  }, []);

  // Helper function to extract category ID from player (memoized)
  const getPlayerCategoryId = useCallback((player: PlayerData): string => {
    if (player.category) {
      return player.category.id;
    } else if (player.categoryId && player.categoryId._id) {
      return player.categoryId._id;
    }
    return 'uncategorized';
  }, []);

  // Helper function to extract category data from player (memoized)
  const getPlayerCategoryData = useCallback((player: PlayerData): CategoryData | null => {
    if (player.category) {
      return player.category;
    } else if (player.categoryId && player.categoryId._id) {
      return {
        id: player.categoryId._id,
        name: player.categoryId.name,
        basePrice: player.categoryId.basePrice
      };
    }
    return null;
  }, []);


  // Group players by category (always, not just when filtering by ownerId)
  const playersGroupedByCategory = useMemo(() => {
    if (players.length === 0) {
      return [];
    }

    const grouped = new Map<string, { category: CategoryData; players: PlayerData[] }>();
    
    // Group players by category using optimized helper
    players.forEach(player => {
      const categoryData = getPlayerCategoryData(player);
      const categoryId = getPlayerCategoryId(player);
      
      if (categoryData) {
        if (!grouped.has(categoryId)) {
          grouped.set(categoryId, {
            category: categoryData,
            players: []
          });
        }
        grouped.get(categoryId)!.players.push(player);
      } else {
        // Players without category go to "Uncategorized"
        if (!grouped.has('uncategorized')) {
          grouped.set('uncategorized', {
            category: { id: 'uncategorized', name: 'Uncategorized', basePrice: 0 },
            players: []
          });
        }
        grouped.get('uncategorized')!.players.push(player);
      }
    });

    // Convert to array and sort by category name
    return Array.from(grouped.values()).sort((a, b) => {
      if (a.category.id === 'uncategorized') return 1;
      if (b.category.id === 'uncategorized') return -1;
      return a.category.name.localeCompare(b.category.name);
    });
  }, [players, getPlayerCategoryId, getPlayerCategoryData]);

  // Map of category ID to players list (for O(1) lookups) - using players instead of allPlayers
  const playersByCategoryMap = useMemo(() => {
    const map = new Map<string, PlayerData[]>();
    players.forEach(player => {
      const categoryId = getPlayerCategoryId(player);
      if (!map.has(categoryId)) {
        map.set(categoryId, []);
      }
      map.get(categoryId)!.push(player);
    });
    return map;
  }, [players, getPlayerCategoryId]);

  // Map of mobile number to index (for O(1) lookups) - using players instead of allPlayers
  const playerIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    players.forEach((player, index) => {
      map.set(player.mobileNumber, index);
    });
    return map;
  }, [players]);

  // Find next/previous player in SAME category only (not across categories) - OPTIMIZED
  const findNextPlayerInCategoryOrder = useCallback((currentIndex: number, direction: 'next' | 'prev'): number | null => {
    if (players.length === 0 || currentIndex < 0 || currentIndex >= players.length) {
      return null;
    }
    
    // Find current player
    const currentPlayer = players[currentIndex];
    if (!currentPlayer) return null;
    
    // Get current player's category ID using helper
    const currentCategoryId = getPlayerCategoryId(currentPlayer);
    
    // Get all players in the SAME category only using pre-computed map (O(1) lookup)
    const playersInSameCategory = playersByCategoryMap.get(currentCategoryId);
    if (!playersInSameCategory || playersInSameCategory.length === 0) {
      return null;
    }
    
    // Find current player's index in the same category
    const currentIndexInCategory = playersInSameCategory.findIndex(p => p.mobileNumber === currentPlayer.mobileNumber);
    if (currentIndexInCategory === -1) return null;
    
    if (direction === 'next') {
      // Go to next player in SAME category only
      if (currentIndexInCategory < playersInSameCategory.length - 1) {
        const nextPlayer = playersInSameCategory[currentIndexInCategory + 1];
        // Use pre-computed index map for O(1) lookup
        return playerIndexMap.get(nextPlayer.mobileNumber) ?? null;
      }
      return null; // No next player in this category
    } else {
      // Go to previous player in SAME category only
      if (currentIndexInCategory > 0) {
        const prevPlayer = playersInSameCategory[currentIndexInCategory - 1];
        // Use pre-computed index map for O(1) lookup
        return playerIndexMap.get(prevPlayer.mobileNumber) ?? null;
      }
      return null; // No previous player in this category
    }
  }, [players, playersByCategoryMap, playerIndexMap, getPlayerCategoryId]);

  const handlePreviousPlayer = useCallback(() => {
    if (selectedPlayerIndex !== null) {
      const prevIndex = findNextPlayerInCategoryOrder(selectedPlayerIndex, 'prev');
      if (prevIndex !== null && prevIndex >= 0) {
        const prevPlayer = players[prevIndex];
        if (!prevPlayer) return;
        const basePrice = getBasePrice(prevPlayer);
        setBidAmount(basePrice);
        // Update index immediately, then set direction for animation
        setSelectedPlayerIndex(prevIndex);
        setModalDirection('right');
        // Reset direction after animation
        setTimeout(() => {
          setModalDirection('none');
        }, 300);
      }
    }
  }, [selectedPlayerIndex, players, getBasePrice, findNextPlayerInCategoryOrder]);

  const handleNextPlayer = useCallback(() => {
    if (selectedPlayerIndex !== null) {
      const nextIndex = findNextPlayerInCategoryOrder(selectedPlayerIndex, 'next');
      if (nextIndex !== null && nextIndex < players.length) {
        const nextPlayer = players[nextIndex];
        if (!nextPlayer) return;
        const basePrice = getBasePrice(nextPlayer);
        setBidAmount(basePrice);
        // Update index immediately, then set direction for animation
        setSelectedPlayerIndex(nextIndex);
        setModalDirection('left');
        // Reset direction after animation
        setTimeout(() => {
          setModalDirection('none');
        }, 300);
      }
    }
  }, [selectedPlayerIndex, players, getBasePrice, findNextPlayerInCategoryOrder]);

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
        // Find the owner from the owners array (use memoized map for O(1) lookup)
        const assignedOwner = assignedOwnerMap.get(ownerId);
        
        // Store the NEXT player's mobile number BEFORE refetch (remember the next slide)
        const currentPlayerMobile = selectedPlayer.mobileNumber;
        const currentCategoryId = getPlayerCategoryId(selectedPlayer);
        
        // Get all players in the same category BEFORE refetch using pre-computed map
        const playersInSameCategoryBefore = playersByCategoryMap.get(currentCategoryId) || [];
        
        // Find current player's index in category BEFORE refetch
        const currentIndexInCategory = playersInSameCategoryBefore.findIndex(p => p.mobileNumber === currentPlayerMobile);
        
        // Store the NEXT player's mobile number (the one we want to navigate to)
        const nextPlayerMobile = currentIndexInCategory !== -1 && currentIndexInCategory < playersInSameCategoryBefore.length - 1
          ? playersInSameCategoryBefore[currentIndexInCategory + 1]?.mobileNumber
          : null;
        
        // Refetch players and owners to get updated data from server (real-time update)
        await Promise.all([
          fetchPlayers(true), // Silent fetch to avoid loading state
          refreshOwners() // Refresh owners to get updated purse values
        ]);
        
        // Show congratulations message
        if (assignedOwner) {
          setSuccessMessage({
            ownerName: assignedOwner.name,
            playerName: `${selectedPlayer.firstName} ${selectedPlayer.lastName}`,
            amount: bidAmount,
          });
          
          // Note: Don't reset bid amount here - it will be set to next player's base price when navigating
          
          // Clear any existing timeout
          if (successTimeoutRef.current) {
            clearTimeout(successTimeoutRef.current);
          }
          
          // Auto-advance to next player after 4 seconds (using remembered next player)
          successTimeoutRef.current = setTimeout(() => {
            setSuccessMessage(null);
            
            // Get the latest players list from ref (always up-to-date)
            const latestPlayers = playersRef.current;
            
            // Find the remembered next player in the updated list using Map for O(1) lookup
            if (nextPlayerMobile) {
              // Use findIndex (could be optimized with a Map, but this is fine for typical dataset sizes)
              const nextIndex = latestPlayers.findIndex(p => p.mobileNumber === nextPlayerMobile);
              
              if (nextIndex !== -1) {
                const nextPlayer = latestPlayers[nextIndex];
                const nextBasePrice = getBasePrice(nextPlayer);
                setBidAmount(nextBasePrice);
                // Update index immediately, then set direction for animation
                setSelectedPlayerIndex(nextIndex);
                setModalDirection('left');
                // Reset direction after animation
                setTimeout(() => {
                  setModalDirection('none');
                }, 300);
              } else {
                // Next player not found in updated list (might have been filtered out), close modal
                handleCloseModal();
              }
            } else {
              // No next player in category, close modal
              handleCloseModal();
            }
            successTimeoutRef.current = null; // Clear ref after execution
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

  // Memoize selected player to avoid unnecessary recalculations
  const selectedPlayer = useMemo(() => {
    return selectedPlayerIndex !== null && players.length > 0 && selectedPlayerIndex < players.length
      ? players[selectedPlayerIndex] 
      : null;
  }, [selectedPlayerIndex, players]);

  // Get current player's base price
  const currentBasePrice = useMemo(() => {
    return getBasePrice(selectedPlayer);
  }, [selectedPlayer, getBasePrice]);

  // Handle keyboard navigation, body scroll lock, and arrow keys for bid amount
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Up arrow key: increment bid amount by 500 (works everywhere on the page)
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const basePrice = currentBasePrice;
        setBidAmount(prev => {
          // If current amount is below base price, set to base price first
          const currentAmount = prev < basePrice ? basePrice : prev;
          return currentAmount + 500;
        });
        return;
      }
      
      // Down arrow key: decrement bid amount by 500 (works everywhere on the page)
      // But don't go below base price
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const basePrice = currentBasePrice;
        setBidAmount(prev => Math.max(basePrice, prev - 500));
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
  }, [isModalOpen, selectedPlayerIndex, players.length, currentBasePrice, handleCloseModal, handlePreviousPlayer, handleNextPlayer]);

  // Initialize bid amount to base price when selected player changes (optimized)
  useEffect(() => {
    if (selectedPlayer && isModalOpen) {
      const basePrice = getBasePrice(selectedPlayer);
      // Only update if different to avoid unnecessary state updates
      setBidAmount(prev => prev !== basePrice ? basePrice : prev);
    }
  }, [selectedPlayer?.mobileNumber, isModalOpen, getBasePrice]); // Use mobileNumber as dependency instead of whole object


  // Memoize owner slices to avoid recalculating on every render
  const ownerSlices = useMemo(() => {
    const midPoint = Math.ceil(owners.length / 2);
    return {
      left: owners.slice(0, midPoint),
      right: owners.slice(midPoint),
    };
  }, [owners]);

  // Memoize assigned owner lookup
  const assignedOwnerMap = useMemo(() => {
    const map = new Map<string, OwnerData>();
    owners.forEach(owner => map.set(owner.id, owner));
    return map;
  }, [owners]);

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
                {players.length > 0 && `${players.length} player${players.length !== 1 ? 's' : ''} found`}
              </p>
            </div>
            <button
              onClick={() => navigate('/check-balance')}
              className="flex items-center gap-2 bg-[#041955] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#062972] transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Wallet className="w-5 h-5" />
              <span>Show Balance</span>
            </button>
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
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
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

        {/* Players Grid - Always Grouped by Category */}
        {playersGroupedByCategory.length > 0 ? (
          <div className="space-y-8">
            {playersGroupedByCategory.map((group, groupIndex) => (
              <div key={group.category.id} className="animate-fade-in" style={{ animationDelay: `${groupIndex * 100}ms` }}>
                {/* Category Header */}
                <div className="mb-6 flex items-center justify-between bg-gradient-to-r from-[#041955] to-[#062972] rounded-xl p-4 md:p-6 shadow-lg">
                  <div className="flex items-center space-x-4">
                    <div className="bg-[#E6B31E] p-3 rounded-lg">
                      <Tag className="w-6 h-6 md:w-8 md:h-8 text-[#041955]" />
                    </div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold text-white">
                        Category {group.category.name}
                      </h2>
                      <p className="text-sm md:text-base text-gray-300 mt-1">
                        Base Price: ₹{group.category.basePrice.toLocaleString('en-IN')} • {group.players.length} player{group.players.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Players in this category */}
                {group.players.length === 0 ? (
                  <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl p-8 md:p-12 text-center border-2 border-dashed border-gray-300">
                    <ShoppingCart className="w-16 h-16 md:w-20 md:h-20 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl md:text-2xl font-bold text-gray-600 mb-2">
                      All Players Sold
                    </h3>
                    <p className="text-gray-500 text-sm md:text-base">
                      All players in Category {group.category.name} have been sold.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {group.players.map((player, cardIndex) => {
                    const arrayIndex = players.findIndex(p => p.mobileNumber === player.mobileNumber);
                    return (
                      <div
                        key={player.mobileNumber}
                        onClick={() => arrayIndex >= 0 && handlePlayerClick(arrayIndex)}
                        className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-500 cursor-pointer transform relative opacity-100 hover:shadow-2xl hover:-translate-y-2 hover:scale-105 animate-fadeIn"
                        style={{
                          animationDelay: `${cardIndex * 30}ms`
                        }}
                      >

                        {/* Status Badges */}
                        <div className="absolute top-2 right-2 z-10 flex flex-col gap-2">
                          {player.isIconPlayer && (
                            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-bold text-xs px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                              <Crown className="w-3 h-3" />
                              Icon
                            </div>
                          )}
                          {player.isOwner && (
                            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold text-xs px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                              <User className="w-3 h-3" />
                              Owner
                            </div>
                          )}
                          {player.isSold && !player.isOwner && !player.isIconPlayer && (
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
                )}
              </div>
            ))}
          </div>
        ) : (
          // No players to display
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">No players found</p>
          </div>
        )}

        {/* Legacy regular grid view - removed, always use category grouping */}
        {false && players.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {players.map((player, cardIndex) => {
            const arrayIndex = players.findIndex(p => p.mobileNumber === player.mobileNumber);
            return (
              <div
                key={player.mobileNumber}
                onClick={() => arrayIndex >= 0 && handlePlayerClick(arrayIndex)}
                className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-500 cursor-pointer transform relative opacity-100 hover:shadow-2xl hover:-translate-y-2 hover:scale-105 animate-fadeIn"
                style={{
                  animationDelay: `${cardIndex * 30}ms`
                }}
              >

                {/* Status Badges */}
                <div className="absolute top-2 right-2 z-10 flex flex-col gap-2">
                  {player.isIconPlayer && (
                    <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-bold text-xs px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      Icon
                    </div>
                  )}
                  {player.isOwner && (
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold text-xs px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <User className="w-3 h-3" />
                      Owner
                    </div>
                  )}
                  {player.isSold && !player.isOwner && !player.isIconPlayer && (
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
        )}

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
                    {(() => {
                      const ownerId = typeof selectedPlayer.ownerId === 'string' 
                        ? selectedPlayer.ownerId 
                        : selectedPlayer.ownerId?.id;
                      const owner = ownerId ? assignedOwnerMap.get(ownerId) : null;
                      return owner?.teamName && (
                        <p className="text-lg md:text-xl text-[#041955]/80 mt-2">
                          ({owner.teamName})
                        </p>
                      );
                    })()}
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
                w-full h-full max-w-[100vw] md:max-w-[95vw] max-h-[100vh] md:max-h-[95vh] 
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
                className="absolute top-2 right-2 md:top-4 md:right-4 z-20 bg-white rounded-full p-2 md:p-2 shadow-lg hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation"
                aria-label="Close"
              >
                <X className="w-5 h-5 md:w-6 md:h-6 text-[#041955]" />
              </button>

              {/* Navigation Arrows - Will be positioned relative to center section */}

              {/* Main Layout: Owners on sides (desktop), stacked (mobile), Player in center */}
              <div className="flex flex-col md:flex-row items-center justify-center h-full gap-2 md:gap-6 px-2 md:px-4 overflow-y-auto">
                {/* Mobile: Owners Section Above Player (Scrollable) - Only show for unsold players */}
                {!selectedPlayer.isSold && (
                <div className="md:hidden w-full order-1 mb-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 max-h-[200px] overflow-y-auto">
                    <h3 className="text-white font-bold text-sm mb-3 text-center">Select Owner</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {loadingOwners ? (
                        <div className="col-span-2 flex justify-center items-center py-4">
                          <Loader className="w-6 h-6 animate-spin text-white" />
                        </div>
                      ) : owners.length === 0 ? (
                        <div className="col-span-2 text-center py-4 text-white/50">
                          <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-xs">No owners available</p>
                        </div>
                      ) : (
                        owners.map((owner) => {
                          const isSelected = selectedPlayer.owner?.id === owner.id;
                          const isUpdating = updatingOwner === owner.id;
                          
                          return (
                            <button
                              key={owner.id}
                              onClick={() => handleOwnerSelect(owner.id)}
                              disabled={isUpdating || isSelected}
                              className={`
                                relative bg-white rounded-lg p-2 shadow-md 
                                transition-all duration-300 transform active:scale-95
                                ${isSelected 
                                  ? 'ring-2 ring-[#E6B31E] bg-gradient-to-br from-[#E6B31E]/10 to-[#E6B31E]/5' 
                                  : ''
                                }
                                ${isUpdating ? 'opacity-50' : ''}
                              `}
                            >
                              {isUpdating && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-lg z-10">
                                  <Loader className="w-4 h-4 animate-spin text-[#041955]" />
                                </div>
                              )}
                              
                              {isSelected && (
                                <div className="absolute top-1 right-1 bg-[#E6B31E] text-[#041955] rounded-full p-1 shadow-lg z-10">
                                  <UserCheck className="w-3 h-3" />
                                </div>
                              )}
                              
                              <div className="flex flex-col items-center space-y-1">
                                {owner.imageUrl ? (
                                  <img
                                    src={owner.imageUrl}
                                    alt={owner.name}
                                    className={`w-10 h-10 rounded-full object-cover border-2 ${
                                      isSelected ? 'border-[#E6B31E] border-2' : 'border-gray-300'
                                    }`}
                                  />
                                ) : (
                                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-[#041955] to-[#062972] flex items-center justify-center border-2 ${
                                    isSelected ? 'border-[#E6B31E] border-2' : 'border-gray-300'
                                  }`}>
                                    <Users className="w-5 h-5 text-white" />
                                  </div>
                                )}
                                
                                <div className="text-center w-full">
                                  <h4 className="font-bold text-[#041955] text-xs truncate">
                                    {owner.name}
                                  </h4>
                                  {owner.teamName && (
                                    <p className="text-[10px] text-gray-600 truncate">
                                      {owner.teamName}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
                )}

                {/* Left Side Owners - Hidden on mobile, shown on desktop - Only show for unsold players */}
                {!selectedPlayer.isSold && (
                <div className="hidden md:flex flex-1 max-w-[250px] lg:max-w-[300px] h-full flex-col justify-center">
                  <div className="space-y-4 pr-2">
                    {loadingOwners ? (
                      <div className="flex justify-center items-center py-8">
                        <Loader className="w-8 h-8 animate-spin text-white" />
                      </div>
                    ) : ownerSlices.left.length === 0 ? (
                      <div className="text-center py-8 text-white/50">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      </div>
                    ) : (
                      ownerSlices.left.map((owner) => {
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
                </div>
                )}

                {/* Center: Player Details */}
                <div className="flex-shrink-0 w-full max-w-4xl order-2 md:order-none relative">
                  {/* Navigation Arrows - Positioned relative to center section */}
                  {selectedPlayerIndex !== null && findNextPlayerInCategoryOrder(selectedPlayerIndex, 'prev') !== null && (
                    <button
                      onClick={handlePreviousPlayer}
                      className="absolute left-1 md:-left-12 lg:-left-16 top-1/2 -translate-y-1/2 z-30 bg-white/95 backdrop-blur-sm rounded-full p-2 md:p-3 shadow-xl hover:bg-white transition-all hover:scale-110 active:scale-95"
                      aria-label="Previous Player"
                    >
                      <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-[#041955]" />
                    </button>
                  )}

                  {selectedPlayerIndex !== null && findNextPlayerInCategoryOrder(selectedPlayerIndex, 'next') !== null && (
                    <button
                      onClick={handleNextPlayer}
                      className="absolute right-1 md:-right-12 lg:-right-16 top-1/2 -translate-y-1/2 z-30 bg-white/95 backdrop-blur-sm rounded-full p-2 md:p-3 shadow-xl hover:bg-white transition-all hover:scale-110 active:scale-95"
                      aria-label="Next Player"
                    >
                      <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-[#041955]" />
                    </button>
                  )}

                  <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-6 lg:p-10 max-h-[85vh] md:max-h-[90vh] overflow-y-auto">
                    {/* Header with Index */}
                    <div className="text-center mb-4 md:mb-8 animate-fade-in">
                      <div className="inline-block bg-gradient-to-r from-[#E6B31E] to-[#d4a017] text-[#041955] font-bold text-base sm:text-lg md:text-xl lg:text-2xl px-4 py-2 md:px-6 md:py-3 rounded-full mb-3 md:mb-4 shadow-lg transform hover:scale-105 transition-transform animate-pulse-slow">
                        #{selectedPlayerIndex !== null ? selectedPlayerIndex + 1 : ''} of {players.length}
                      </div>
                      {/* Status Badges */}
                      <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
                        {selectedPlayer.isIconPlayer && (
                          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-bold text-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                            <Crown className="w-4 h-4" />
                            Icon Player
                          </div>
                        )}
                        {selectedPlayer.isOwner && (
                          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold text-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Owner
                          </div>
                        )}
                        {selectedPlayer.isSold && !selectedPlayer.isOwner && !selectedPlayer.isIconPlayer && (
                          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                            <ShoppingCart className="w-4 h-4" />
                            Sold
                          </div>
                        )}
                      </div>
                      
                      {/* Bid Amount Counter - Small Tile - Only show for unsold players */}
                      {!selectedPlayer.isSold && (
                      <div className="mt-4 md:mt-6 flex justify-center">
                        <div className="bg-gradient-to-br from-[#E6B31E] to-[#d4a017] rounded-xl px-4 py-3 md:px-6 md:py-4 shadow-lg transform hover:scale-105 transition-transform">
                          <div className="text-center">
                            <p className="text-[10px] sm:text-xs text-[#041955] font-semibold mb-1">Bid Amount</p>
                            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-[#041955]">
                              ₹{bidAmount.toLocaleString('en-IN')}
                            </p>
                            <div className="flex items-center justify-center gap-1 md:gap-2 mt-1 md:mt-2 text-[10px] sm:text-xs text-[#041955]/70">
                              <span>↑ +₹500</span>
                              <span>•</span>
                              <span>↓ -₹500</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      )}
                      
                      {/* Sold Message - Show for sold players */}
                      {selectedPlayer.isSold && (
                      <div className="mt-4 md:mt-6 flex justify-center">
                        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl px-6 py-4 md:px-8 md:py-5 shadow-lg">
                          <div className="text-center text-white">
                            <ShoppingCart className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-2" />
                            <p className="text-lg md:text-xl font-bold mb-1">Player Already Sold</p>
                            <p className="text-sm md:text-base opacity-90">Bidding is not available for this player</p>
                            {selectedPlayer.owner && typeof selectedPlayer.owner === 'object' && selectedPlayer.owner.name && (
                              <p className="text-sm md:text-base mt-2 opacity-75">
                                Owner: {selectedPlayer.owner.name}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      )}
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
                          <img
                            key={selectedPlayer.mobileNumber} // Force remount when player changes
                            src={selectedPlayer.images.profileImage}
                            alt={`${selectedPlayer.firstName} ${selectedPlayer.lastName}`}
                            className="w-32 h-32 sm:w-40 sm:h-40 md:w-56 md:h-56 rounded-full border-4 border-[#E6B31E] object-cover shadow-2xl transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 relative z-10"
                            loading="eager"
                            onError={(e) => {
                              // Fallback if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                            }}
                          />
                        </div>
                        <div className="flex-1 text-center md:text-left animate-slide-up" style={{ animationDelay: '0.2s' }}>
                          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 md:mb-4 transform transition-all duration-300 hover:scale-105">
                            {selectedPlayer.firstName} {selectedPlayer.lastName}
                          </h2>
                          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-4 text-sm md:text-lg">
                            <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 md:px-4 md:py-2 rounded-lg backdrop-blur-sm">
                              <Phone className="w-4 h-4 md:w-5 md:h-5" />
                              <span className="text-xs md:text-base">{selectedPlayer.mobileNumber}</span>
                            </div>
                            <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 md:px-4 md:py-2 rounded-lg backdrop-blur-sm">
                              <Shirt className="w-4 h-4 md:w-5 md:h-5" />
                              <span className="text-xs md:text-base">#{selectedPlayer.tshirtNumber}</span>
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
                          className="w-full bg-gradient-to-r from-[#041955] to-[#062972] text-white px-4 py-3 md:px-8 md:py-4 rounded-xl font-bold text-sm md:text-lg hover:from-[#062972] hover:to-[#041955] transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg touch-manipulation"
                        >
                          View Full Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side Owners - Hidden on mobile, shown on desktop - Only show for unsold players */}
                {!selectedPlayer.isSold && (
                <div className="hidden md:flex flex-1 max-w-[250px] lg:max-w-[300px] h-full flex-col justify-center">
                  <div className="space-y-4 pl-2">
                    {loadingOwners ? (
                      <div className="flex justify-center items-center py-8">
                        <Loader className="w-8 h-8 animate-spin text-white" />
                      </div>
                    ) : ownerSlices.right.length === 0 ? (
                      <div className="text-center py-8 text-white/50">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      </div>
                    ) : (
                      ownerSlices.right.map((owner) => {
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
                </div>
                )}
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

