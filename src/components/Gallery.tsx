import { ChevronLeft, ChevronRight, Image as ImageIcon, Play } from 'lucide-react';
import { useState } from 'react';

const galleryImages = [
  { 
    id: 1, 
    title: 'Opening Ceremony', 
    type: 'image',
    image: '/images/gallery/opening-ceremony.jpeg',
    color: 'from-blue-500 to-blue-700' 
  },
  { 
    id: 2, 
    title: 'Match Action', 
    type: 'video',
    video: '/images/gallery/match-action.mp4',
    image: '/images/gallery/match-action.jpg', // Thumbnail/poster (optional)
    color: 'from-green-500 to-green-700' 
  },
  { 
    id: 3, 
    title: 'Team Celebration', 
    type: 'image',
    image: '/images/gallery/winning-team.jpeg',
    color: 'from-purple-500 to-purple-700' 
  },
  { 
    id: 4, 
    title: 'Award Night', 
    type: 'image',
    image: '/images/gallery/award-night.jpeg',
    color: 'from-yellow-500 to-yellow-700' 
  },
  { 
    id: 5, 
    title: 'Finals Match', 
    type: 'image',
    image: '/images/gallery/finals-match.jpeg',
    color: 'from-red-500 to-red-700' 
  },
  { 
    id: 6, 
    title: 'Trophy Moment', 
    type: 'video',
    video: '/images/gallery/trophy-moment.mp4',
    image: '/images/gallery/trophy-moment.jpg', // Thumbnail/poster
    color: 'from-indigo-500 to-indigo-700' 
  },
];

export default function Gallery() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [videoErrors, setVideoErrors] = useState<Set<number>>(new Set());

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const handleImageError = (imageId: number) => {
    setImageErrors((prev) => new Set(prev).add(imageId));
  };

  const handleVideoError = (videoId: number) => {
    setVideoErrors((prev) => new Set(prev).add(videoId));
  };

  const currentItem = galleryImages[currentIndex];
  const isVideo = currentItem.type === 'video';


  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#041955] mb-4">
            Season 1 Highlights
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Relive the memorable moments from our inaugural season
          </p>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-2xl shadow-2xl mb-8">
            <div className="relative aspect-video bg-gradient-to-br from-[#041955] to-[#062972]">
              {isVideo && !videoErrors.has(currentItem.id) ? (
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
              ) : !isVideo && !imageErrors.has(currentItem.id) ? (
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
              <div className={`absolute inset-0 flex items-center justify-center text-white ${
                isVideo && !videoErrors.has(currentItem.id) ? 'pointer-events-none' : ''
              }`}>
                <div className="text-center">
                  {((isVideo && videoErrors.has(currentItem.id)) || (!isVideo && imageErrors.has(currentItem.id))) && (
                    <ImageIcon className="w-20 h-20 mx-auto mb-4 opacity-50" />
                  )}
                  {isVideo && !videoErrors.has(currentItem.id) && (
                    <Play className="w-16 h-16 mx-auto mb-4 opacity-70" />
                  )}
                  <p className="text-2xl font-bold">{currentItem.title}</p>
                  <p className="text-sm mt-2 opacity-75">Season 1 Memory</p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-[#041955] p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-[#041955] p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="flex justify-center space-x-2">
            {galleryImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-[#E6B31E] w-8'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
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
              {!imageErrors.has(item.id) && item.image && (
                <img
                  src={item.image}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={() => handleImageError(item.id)}
                />
              )}
              <div className={`absolute inset-0 bg-gradient-to-br ${item.color} ${
                imageErrors.has(item.id) ? 'opacity-100' : 'opacity-40'
              }`}></div>
              <div className="absolute inset-0 flex items-center justify-center text-white">
                {item.type === 'video' && (
                  <Play className="w-8 h-8 opacity-75" />
                )}
                {imageErrors.has(item.id) && item.type === 'image' && (
                  <ImageIcon className="w-8 h-8 opacity-75" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
