import { Award, Trophy, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFrontendDetails } from '../context/FrontendDetailsContext';

export default function WinnerSection() {
  const { details } = useFrontendDetails();
  const [imageError, setImageError] = useState(false);
  const winner = details?.winners?.[0];
  const teamImage = winner?.base64ImageUrl?.trim();
  const winnerSeasonLabel = winner?.season ?? 'Season 1';
  const championName = winner?.teamName ?? 'Shree Ganesh Welfare Society';
  const championDescription = winner?.description ?? 'MPL Season 1 Champions';
  const captainName = winner?.teamCaptainName ?? 'Manish Rajbhar';
  const tournamentTitle = details?.dashboard?.tournamentName ?? 'MPL';
  const seasonName = details?.dashboard?.season ?? winnerSeasonLabel;
  const testimonialQuote = winner
    ? 'An incredible journey with amazing teammates. Looking forward to defending our title!'
    : 'An incredible journey with amazing teammates. Looking forward to defending our title!';

  useEffect(() => {
    setImageError(false);
  }, [teamImage]);

  return (
    <section id="winner" className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#041955] mb-4">
            {tournamentTitle} {winnerSeasonLabel} Winner
          </h2>
        </div>

        <div className="bg-gradient-to-br from-[#041955] to-[#062972] rounded-2xl overflow-hidden shadow-2xl">
          <div className="grid md:grid-cols-2 gap-8 p-8 md:p-12">
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="absolute -top-6 -right-6 bg-[#E6B31E] rounded-full p-4 z-10">
                  <Trophy className="w-12 h-12 text-[#041955]" />
                </div>
                <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-lg border-8 border-white shadow-2xl overflow-hidden relative bg-gradient-to-br from-[#E6B31E] to-[#c99a19]">
                  {teamImage && !imageError ? (
                    <img
                      src={teamImage}
                      alt={`${championName} - ${winnerSeasonLabel}`}
                      className="w-full h-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#041955]">
                      <div className="text-center">
                        <Trophy className="w-24 h-24 mx-auto mb-4" />
                        <p className="text-2xl font-bold">Team Photo</p>
                        <p className="text-sm">Coming Soon</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center text-white space-y-6">
              <div>
                <p className="text-xl font-semibold">Team:- {championName}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Award className="w-6 h-6 text-[#E6B31E] flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold">{championDescription}</p>
                    <p className="text-sm text-gray-300">Celebrated {winnerSeasonLabel}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Star className="w-6 h-6 text-[#E6B31E] flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold">Team Captain</p>
                    <p className="text-sm text-gray-300">{captainName}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Trophy className="w-6 h-6 text-[#E6B31E] flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold">Presented by {tournamentTitle}</p>
                    <p className="text-sm text-gray-300">{seasonName}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E6B31E]/30">
                <p className="text-sm text-gray-300 italic">
                  "{testimonialQuote}"
                </p>
                <p className="text-sm text-[#E6B31E] mt-2">- Team Captain - {captainName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
