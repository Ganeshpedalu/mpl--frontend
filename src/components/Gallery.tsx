import { ChevronLeft, ChevronRight, Image as ImageIcon, Play } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useFrontendDetails } from '../context/FrontendDetailsContext';

const highlightColors = [
  'from-blue-500 to-blue-700',
  'from-green-500 to-green-700',
  'from-purple-500 to-purple-700',
  'from-yellow-500 to-yellow-700',
  'from-red-500 to-red-700',
  'from-indigo-500 to-indigo-700',
];

type GalleryItem = {
  id: number;
  title: string;
  label?: string;
  type: 'image' | 'video';
  image?: string;
  video?: string;
  color: string;
};

const buildMediaSource = (value?: string | null, mediaKind: 'image' | 'video' = 'image'): string | undefined => {
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

  const prefix = mediaKind === 'video' ? 'data:video/mp4;base64,' : 'data:image/jpeg;base64,';
  return `${prefix}${trimmed}`;
};

export default function Gallery() {
  const { details } = useFrontendDetails();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [videoErrors, setVideoErrors] = useState<Set<number>>(new Set());

  const remoteHighlights = useMemo<GalleryItem[]>(() => {
    const allItems: GalleryItem[] = [];
    let itemIndex = 0;

    // Add winners as previous year highlights
    if (details?.winners && details.winners.length > 0) {
      details.winners.forEach((winner) => {
        if (winner.base64ImageUrl?.trim()) {
          const winnerImage = buildMediaSource(winner.base64ImageUrl, 'image');
          if (winnerImage) {
            allItems.push({
              id: itemIndex + 1,
              title: winner.teamName || winner.description || `Previous Year Winner`,
              label: winner.season || 'Previous Season',
              type: 'image',
              image: winnerImage,
              color: highlightColors[itemIndex % highlightColors.length],
            });
            itemIndex++;
          }
        }
      });
    }

    // Add regular highlights
    if (details?.highlights && details.highlights.length > 0) {
      details.highlights.forEach((item) => {
        const explicitMediaType = item.mediaType ?? item.media_type ?? item.contentType ?? item.format;
        const derivedType =
          typeof explicitMediaType === 'string' && explicitMediaType.toLowerCase() === 'video'
            ? 'video'
            : typeof explicitMediaType === 'string' && explicitMediaType.toLowerCase() === 'image'
            ? 'image'
            : item.base64VideoUrl || item.videoUrl
            ? 'video'
            : 'image';

        const displayTitle =
          (item.description && item.description.trim()) ||
          (item.title && item.title.trim()) ||
          (item.label && item.label.trim()) ||
          (item.type && !['video', 'image'].includes(item.type.toLowerCase()) ? item.type : undefined) ||
          `Highlight ${itemIndex + 1}`;

        const badgeLabel =
          item.type && !['video', 'image'].includes(item.type.toLowerCase()) ? item.type : item.label?.trim();

        const baseColor = item.color ?? highlightColors[itemIndex % highlightColors.length];
        const imageSource = buildMediaSource(item.base64ImageUrl ?? item.imageUrl ?? item.thumbnailBase64, 'image');
        const videoSource = buildMediaSource(item.base64VideoUrl ?? item.videoUrl, 'video');

        const galleryItem: GalleryItem = {
          id: itemIndex + 1,
          title: displayTitle,
          label: badgeLabel,
          type: derivedType as GalleryItem['type'],
          image: derivedType === 'video' ? imageSource ?? buildMediaSource(item.base64ImageUrl, 'image') : imageSource,
          video: derivedType === 'video' ? videoSource : undefined,
          color: baseColor,
        };

        // Only add if it has valid media
        if ((galleryItem.type === 'video' && galleryItem.video) || (galleryItem.type === 'image' && galleryItem.image)) {
          allItems.push(galleryItem);
          itemIndex++;
        }
      });
    }

    return allItems;
  }, [details?.highlights, details?.winners]);

  const galleryImages = remoteHighlights;
  const highlightSeason = details?.winners[0]?.season ?? 'Season Highlights';
  const highlightSubtitle = details?.dashboard?.tournamentName
    ? `Relive the memorable moments from ${details.dashboard.tournamentName}`
    : 'Relive the memorable moments shared by the MPL community';
  const highlightTagline = details?.dashboard?.season ? `${details.dashboard.season} Memory` : 'Season Highlight';
  const hasHighlights = galleryImages.length > 0;

  useEffect(() => {
    setCurrentIndex(0);
    setImageErrors(new Set());
    setVideoErrors(new Set());
  }, [galleryImages.length]);

  const nextSlide = () => {
    if (!hasHighlights || galleryImages.length === 1) return;
    setCurrentIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevSlide = () => {
    if (!hasHighlights || galleryImages.length === 1) return;
    setCurrentIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const handleImageError = (imageId: number) => {
    setImageErrors((prev) => new Set(prev).add(imageId));
  };

  const handleVideoError = (videoId: number) => {
    setVideoErrors((prev) => new Set(prev).add(videoId));
  };

  const currentItem = galleryImages[currentIndex] ?? null;
  const isVideo = currentItem?.type === 'video';

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#041955] mb-4">
            {highlightSeason} Highlights
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{highlightSubtitle}</p>
        </div>

        {!hasHighlights && (
          <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-12 text-center text-gray-500">
            Highlight media will appear here once it is published.
          </div>
        )}

        {hasHighlights && currentItem && (
          <>
            <div className="relative">
              <div className="overflow-hidden rounded-2xl shadow-2xl mb-8">
                <div className="relative aspect-video bg-gradient-to-br from-[#041955] to-[#062972]">
                  {isVideo && currentItem.video && !videoErrors.has(currentItem.id) ? (
                    <video
                      src={currentItem.video}
                      className="absolute inset-0 w-full h-full object-contain bg-black"
                      controls
                      autoPlay
                      loop
                      muted
                      playsInline
                      onError={() => handleVideoError(currentItem.id)}
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : !isVideo && currentItem.image && !imageErrors.has(currentItem.id) ? (
                    <img
                      src={currentItem.image}
                      alt={currentItem.title}
                      className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
                      onError={() => handleImageError(currentItem.id)}
                    />
                  ) : null}

                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${currentItem.color} ${
                      (isVideo && videoErrors.has(currentItem.id)) || (!isVideo && imageErrors.has(currentItem.id))
                        ? 'opacity-100'
                        : isVideo
                        ? 'opacity-0'
                        : 'opacity-30'
                    } transition-all duration-500`}
                  ></div>

                  <div
                    className={`absolute inset-0 flex items-center justify-center text-white ${
                      isVideo && !videoErrors.has(currentItem.id) ? 'pointer-events-none' : ''
                    }`}
                  >
                    <div className="text-center">
                      {((isVideo && videoErrors.has(currentItem.id)) ||
                        (!isVideo && imageErrors.has(currentItem.id))) && (
                        <ImageIcon className="w-20 h-20 mx-auto mb-4 opacity-50" />
                      )}
                      {isVideo && currentItem.video && !videoErrors.has(currentItem.id) && (
                        <Play className="w-16 h-16 mx-auto mb-4 opacity-70" />
                      )}
                      <p className="text-2xl font-bold">{currentItem.title}</p>
                      <p className="text-sm mt-2 opacity-75">{currentItem.label ?? highlightTagline}</p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-[#041955] p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed"
                disabled={galleryImages.length <= 1}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-[#041955] p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed"
                disabled={galleryImages.length <= 1}
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              <div className="flex justify-center space-x-2">
                {galleryImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentIndex ? 'bg-[#E6B31E] w-8' : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to highlight ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mt-12">
              {galleryImages.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentIndex(index)}
                  className={`relative aspect-square rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 ${
                    index === currentIndex ? 'ring-4 ring-[#E6B31E]' : ''
                  }`}
                >
                  {item.image && !imageErrors.has(item.id) && (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={() => handleImageError(item.id)}
                    />
                  )}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${item.color} ${
                      imageErrors.has(item.id) ? 'opacity-100' : 'opacity-40'
                    }`}
                  ></div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-2 text-center">
                    {item.type === 'video' && item.video && <Play className="w-8 h-8 opacity-75 mb-1" />}
                    {imageErrors.has(item.id) && item.type === 'image' && (
                      <ImageIcon className="w-8 h-8 opacity-75 mb-1" />
                    )}
                    <p className="text-xs font-semibold line-clamp-2">{item.title}</p>
                    {item.label && <p className="text-[10px] opacity-80 line-clamp-1">{item.label}</p>}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
