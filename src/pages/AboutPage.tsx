import { Suspense, lazy, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader, Trophy } from 'lucide-react';
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

export default function AboutPage() {
  const { details } = useFrontendDetails();
  const [imageError, setImageError] = useState(false);
  const tournamentName = details?.dashboard?.tournamentName ?? 'MPL';
  const seasonLabel = details?.dashboard?.season ?? 'Season 2';
  
  const aboutContent = details?.aboutPage?.description ?? '';
  const aboutImage = useMemo(() => {
    return buildMediaSource(details?.aboutPage?.base64ImageUrl);
  }, [details?.aboutPage?.base64ImageUrl]);

  // Split content into paragraphs if it contains newlines
  const contentParagraphs = useMemo(() => {
    if (!aboutContent) {
      return [];
    }
    return aboutContent.split('\n\n').filter(p => p.trim().length > 0);
  }, [aboutContent]);

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Header />
      
      <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#E6B31E] rounded-full mb-6">
              <Trophy className="w-12 h-12 text-[#041955]" />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#041955] mb-4">
              The Origin Story of {tournamentName}
            </h1>
            <p className="text-xl text-gray-600">
              Milind Nagar Premier League
            </p>
          </div>

          {/* Main Content with Image */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
            <div className="flex flex-col md:flex-row gap-8 md:gap-12">
              {/* Suraj Chavan Image - Passport Size */}
              <div className="flex-shrink-0 flex justify-center md:justify-start">
                {aboutImage && !imageError ? (
                  <div className="relative">
                    <img
                      src={aboutImage}
                      alt="Suraj Chavan - Founder of MPL"
                      className="w-48 h-48 md:w-56 md:h-56 object-cover rounded-lg shadow-xl border-4 border-[#E6B31E]"
                      onError={() => setImageError(true)}
                    />
                    <div className="mt-4 text-center md:text-left">
                      <p className="font-bold text-xl text-[#041955]">Suraj Chavan</p>
                      <p className="text-sm text-gray-600">Founder of MPL</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-48 h-48 md:w-56 md:h-56 mx-auto mb-4 bg-gradient-to-br from-[#041955] to-[#062972] rounded-lg flex items-center justify-center shadow-xl">
                      <Trophy className="w-24 h-24 text-[#E6B31E]" />
                    </div>
                    <div className="mt-4">
                      <p className="font-bold text-xl text-[#041955]">Suraj Chavan</p>
                      <p className="text-sm text-gray-600">Founder of MPL</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Story Content */}
              <div className="flex-1 space-y-6">
                {contentParagraphs.length > 0 ? (
                  <div className="space-y-6">
                    {contentParagraphs.map((paragraph, index) => {
                      // Check if paragraph contains the tournament name or key phrases for special styling
                      const isHighlight = paragraph.includes(tournamentName) || 
                                         paragraph.includes('MPL – Milind Nagar Premier League') ||
                                         paragraph.includes('Season 2');
                      
                      return (
                        <div key={index}>
                          {isHighlight ? (
                            <div className="bg-gradient-to-br from-[#041955] to-[#062972] rounded-lg p-6 text-white">
                              <p className="text-lg leading-relaxed whitespace-pre-line">
                                {paragraph}
                              </p>
                            </div>
                          ) : (
                            <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">
                              {paragraph}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <p className="text-lg text-gray-700 leading-relaxed">
                      The story of {tournamentName} is being written. Check back soon for the complete origin story.
                    </p>
                  </div>
                )}

                {/* Call to Action */}
                <div className="pt-6 border-t border-gray-200 mt-8">
                  <div className="bg-gradient-to-br from-[#E6B31E] to-[#c99a19] rounded-lg p-6 text-center">
                    <h3 className="text-xl font-bold text-[#041955] mb-3">
                      Be Part of {seasonLabel}
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Link
                        to="/register"
                        className="bg-[#041955] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#062972] transition-all duration-300 transform hover:scale-105 inline-block text-center"
                      >
                        Register Now
                      </Link>
                      <Link
                        to="/"
                        className="bg-white text-[#041955] px-6 py-2 rounded-lg font-bold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 inline-block text-center"
                      >
                        Learn More
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </Suspense>
  );
}

