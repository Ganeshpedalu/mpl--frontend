import { Suspense, lazy, useMemo, useState } from 'react';
import { Loader, Users, Mail, Phone, Trophy } from 'lucide-react';
import { useFrontendDetails } from '../context/FrontendDetailsContext';

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

const buildMediaSource = (value?: string | null): string | undefined => {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  if (/^(data:|https?:|blob:)/i.test(trimmed)) {
    return trimmed;
  }

  return `data:image/jpeg;base64,${trimmed}`;
};

export default function OwnersPage() {
  const { details } = useFrontendDetails();
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const tournamentName = details?.dashboard?.tournamentName ?? 'MPL';
  const seasonLabel = details?.dashboard?.season ?? 'Season 2';

  const owners = useMemo(() => {
    return details?.owners?.filter(owner => owner.season === seasonLabel) || [];
  }, [details?.owners, seasonLabel]);

  const handleImageError = (index: number) => {
    setImageErrors((prev) => new Set(prev).add(index));
  };

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
              {owners.map((owner, index) => {
                const ownerImage = buildMediaSource(owner.base64ImageUrl);
                const hasImageError = imageErrors.has(index);

                return (
                  <div
                    key={index}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                  >
                    {/* Owner Image */}
                    <div className="relative h-64 bg-gradient-to-br from-[#041955] to-[#062972] flex items-center justify-center">
                      {ownerImage && !hasImageError ? (
                        <img
                          src={ownerImage}
                          alt={owner.name}
                          className="w-full h-full object-cover"
                          onError={() => handleImageError(index)}
                        />
                      ) : null }
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

