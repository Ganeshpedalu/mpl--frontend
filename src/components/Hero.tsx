import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useFrontendDetails } from '../context/FrontendDetailsContext';

export default function Hero() {
  const { details } = useFrontendDetails();
  const dashboard = details?.dashboard;
  const tournamentName = dashboard?.tournamentName ?? 'MPL';
  const seasonLabel = dashboard?.season ?? 'Season 2';
  const registrationFee = dashboard?.registrationFee ?? 300;
  const seasonYear = dashboard?.seasonYear;

  const lastDateShort = useMemo(() => {
    if (!dashboard?.lastDate) {
      return 'Dec 1';
    }
    const date = new Date(dashboard.lastDate);
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  }, [dashboard?.lastDate]);

  const auctionDateShort = useMemo(() => {
    if (!dashboard?.auctionDate) {
      return 'NA';
    }
    const date = new Date(dashboard.auctionDate);
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  }, [dashboard?.auctionDate]);

  
  const lastDateLong = useMemo(() => {
    if (!dashboard?.lastDate) {
      return '1st December';
    }
    const date = new Date(dashboard.lastDate);
    return date.toLocaleDateString('en-IN', { month: 'long', day: 'numeric' });
  }, [dashboard?.lastDate]);

  const heroTitle = `${tournamentName} ${seasonLabel}`.trim();

  return (
    <section id="home" className="relative bg-gradient-to-br from-[#041955] via-[#062972] to-[#041955] text-white py-20 md:py-32">
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-[#E6B31E] rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#E6B31E] rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          <div className="inline-block bg-[#E6B31E] text-[#041955] px-6 py-2 rounded-full font-bold mb-6 animate-pulse">
            Registration Open Now!
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            {heroTitle}
            <br />
            <span className="text-[#E6B31E]">Player Registration</span>
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl mb-4 text-gray-300 max-w-3xl mx-auto">
            Join the most exciting cricket tournament in Milind Nagar
          </p>

          <p className="text-base sm:text-lg mb-10 text-[#E6B31E] font-semibold">
            Register before {lastDateLong} to participate in the auction
          </p>

          <Link
            to="/register"
            className="inline-block bg-[#E6B31E] text-[#041955] px-10 py-4 rounded-full text-xl font-bold hover:bg-white transition-all duration-300 transform hover:scale-110 shadow-2xl hover:shadow-[#E6B31E]/50"
          >
            Register Now
          </Link>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-[#E6B31E]/30">
              <div className="text-4xl font-bold text-[#E6B31E] mb-2">₹{registrationFee}</div>
              <div className="text-sm text-gray-300">Registration Fee</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-[#E6B31E]/30">
              <div className="text-4xl font-bold text-[#E6B31E] mb-2">{lastDateShort}</div>
              <div className="text-sm text-gray-300">Last Date</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-[#E6B31E]/30">
              <div className="text-4xl font-bold text-[#E6B31E] mb-2">{auctionDateShort}</div>
              <div className="text-sm text-gray-300">Auction Date</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-[#E6B31E]/30">
              <div className="text-4xl font-bold text-[#E6B31E] mb-2">
                {seasonYear ?? seasonLabel}
              </div>
              <div className="text-sm text-gray-300">{seasonYear ? 'Season Year' : 'Season'}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
