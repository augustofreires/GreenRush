import { useState, useRef, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight, FiVolume2, FiVolumeX } from 'react-icons/fi';
import { useTestimonialsVideoStore } from '../../store/useTestimonialsVideoStore';

interface VideoCarouselProps {
  productFilter?: 'cinta' | 'cha' | 'greenrush' | 'slimshot';
}

export const VideoCarousel = ({ productFilter }: VideoCarouselProps = {}) => {
  const testimonialsStore = useTestimonialsVideoStore();

  // Se tem filtro, pega apenas os vídeos daquele produto, senão pega todos
  const videos = productFilter
    ? (testimonialsStore.videos[productFilter] || [])
    : testimonialsStore.getActiveVideos();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mutedStates, setMutedStates] = useState<{ [key: string]: boolean }>({});
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const desktopVideoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  // Initialize all videos as muted (only for new videos)
  useEffect(() => {
    setMutedStates((prevStates) => {
      const newStates = { ...prevStates };
      let hasChanges = false;

      videos.forEach((video) => {
        // Only add if not already in state
        if (!(video.id in newStates)) {
          newStates[video.id] = true;
          hasChanges = true;
        }
      });

      return hasChanges ? newStates : prevStates;
    });
  }, [videos.length]);

  // Auto-play videos when they become visible
  useEffect(() => {
    const playVisibleVideos = () => {
      const isMobile = window.innerWidth < 768;

      videos.forEach((video, index) => {
        // Use the correct ref based on screen size
        const videoElement = isMobile 
          ? videoRefs.current[video.id]
          : desktopVideoRefs.current[video.id];
          
        if (videoElement) {
          if (isMobile) {
            // On mobile, play ONLY current video and pause ALL others
            if (index === currentIndex) {
              setTimeout(() => {
                if (videoElement.paused) {
                  videoElement.play().catch((err) => {
                    console.log("Autoplay bloqueado:", err);
                  });
                }
              }, 100);
            } else {
              if (!videoElement.paused) {
                videoElement.pause();
              }
              videoElement.currentTime = 0;
            }
          } else {
            // On desktop, auto-play all visible videos
            if (videoElement.paused) {
              videoElement.play().catch(() => {});
            }
          }
        }
      });
    };

    playVisibleVideos();
    
    // Cleanup: pause all videos when unmounting or changing
    return () => {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        videos.forEach((video, index) => {
          const videoElement = videoRefs.current[video.id];
          if (videoElement && !videoElement.paused && index !== currentIndex) {
            videoElement.pause();
          }
        });
      }
    };
  }, [currentIndex, videos, videos.length]);
  const handleToggleMute = (videoId: string, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    setMutedStates((prev) => {
      const newMutedState = !prev[videoId];

      // Immediately update the video element
      const videoElement = videoRefs.current[videoId];
      if (videoElement) {
        videoElement.muted = newMutedState;
      }

      return {
        ...prev,
        [videoId]: newMutedState,
      };
    });
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % videos.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);
  };

  const handleVideoLoaded = (videoId: string) => {
    const videoElement = videoRefs.current[videoId];
    if (videoElement) {
      // Ensure video starts muted
      videoElement.muted = mutedStates[videoId] !== false;
    }
  };

  if (videos.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8" style={{ color: '#4a9d4e' }}>
          QUEM USOU, AMOU!
        </h2>

        {/* Mobile Carousel - 1 video at a time */}
        <div className="md:hidden relative">
          <div className="relative overflow-hidden rounded-xl">
            {videos.map((video, index) => (
              <div
                key={video.id}
                className={`transition-all duration-500 ${
                  index === currentIndex ? 'block' : 'hidden'
                }`}
              >
                <div className="relative aspect-[9/16] bg-gray-900 rounded-xl overflow-hidden">
                  <video
                    ref={(el) => {
                      videoRefs.current[video.id] = el;
                    }}
                    src={video.videoUrl}
                    poster={video.thumbnailUrl}
                    loop
                    playsInline
                    onLoadedMetadata={() => handleVideoLoaded(video.id)}
                    muted={mutedStates[video.id] !== false}
                    preload="metadata"
                    className="w-full h-full object-cover"
                  />

                  {/* Video Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <h3 className="text-white font-bold text-lg mb-1">{video.title}</h3>
                    <p className="text-white/80 text-sm">{video.customerName}</p>
                  </div>

                  {/* Mute/Unmute Button - Mobile */}
                  <button
                    onClick={(e) => handleToggleMute(video.id, e)}
                    className="absolute top-4 right-4 p-3 bg-black/60 rounded-full hover:bg-black/80 transition-all z-10"
                    aria-label={mutedStates[video.id] ? "Ativar som" : "Desativar som"}
                  >
                    {mutedStates[video.id] ? (
                      <FiVolumeX className="text-white" size={22} />
                    ) : (
                      <FiVolume2 className="text-white" size={22} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows - Mobile */}
          {videos.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors shadow-lg"
              >
                <FiChevronLeft size={24} style={{ color: '#4a9d4e' }} />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors shadow-lg"
              >
                <FiChevronRight size={24} style={{ color: '#4a9d4e' }} />
              </button>

              {/* Dots Indicator */}
              <div className="flex justify-center gap-2 mt-4">
                {videos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentIndex ? 'w-6' : 'w-2'
                    }`}
                    style={{
                      backgroundColor: index === currentIndex ? '#4a9d4e' : '#d1d5db',
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Desktop Carousel - 4 videos visible */}
        <div className="hidden md:block relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out gap-4"
              style={{ transform: `translateX(-${currentIndex * (100 / 4)}%)` }}
            >
              {videos.map((video) => (
                <div key={video.id} className="relative group flex-shrink-0" style={{ width: 'calc(25% - 12px)' }}>
                  <div className="relative aspect-[9/16] bg-gray-900 rounded-xl overflow-hidden">
                    <video
                      ref={(el) => {
                        desktopVideoRefs.current[video.id] = el;
                      }}
                      src={video.videoUrl}
                      poster={video.thumbnailUrl}
                      loop
                      playsInline
                      muted={mutedStates[video.id] !== false}
                      onLoadedMetadata={() => handleVideoLoaded(video.id)}
                      className="w-full h-full object-cover"
                    />

                    {/* Video Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <h3 className="text-white font-bold text-base mb-1">{video.title}</h3>
                      <p className="text-white/80 text-sm">{video.customerName}</p>
                    </div>

                    {/* Mute/Unmute Button */}
                    <button
                      onClick={(e) => handleToggleMute(video.id, e)}
                      className="absolute top-4 right-4 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100 z-10"
                      aria-label={mutedStates[video.id] ? 'Ativar som' : 'Desativar som'}
                    >
                      {mutedStates[video.id] ? (
                        <FiVolumeX className="text-white" size={18} />
                      ) : (
                        <FiVolume2 className="text-white" size={18} />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows - Desktop */}
          {videos.length > 4 && (
            <>
              <button
                onClick={prevSlide}
                disabled={currentIndex === 0}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 p-3 bg-white rounded-full hover:bg-gray-100 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed z-10"
              >
                <FiChevronLeft size={28} style={{ color: '#4a9d4e' }} />
              </button>
              <button
                onClick={nextSlide}
                disabled={currentIndex >= videos.length - 4}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 p-3 bg-white rounded-full hover:bg-gray-100 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed z-10"
              >
                <FiChevronRight size={28} style={{ color: '#4a9d4e' }} />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
};
