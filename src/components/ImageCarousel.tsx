import { useState, useEffect } from "react";
import { CountdownBanner } from "./CountdownBanner";

interface Image {
  id: number;
  url: string;
  alt: string;
}

interface CarouselSlide {
  id: number;
  type: "image" | "countdown";
  content: Image | null;
}

interface ImageCarouselProps {
  images?: Image[];
  interval?: number;
}

export const ImageCarousel = ({
  images: propImages,
  interval = 10000,
}: ImageCarouselProps) => {
  const defaultImages: Image[] = [
    {
      id: 1,
      url: "banner1.jpg",
      alt: "University entrance exam preparation",
    },
    {
      id: 2,
      url: "banner2.jpg",
      alt: "Study tips and guidance",
    },
    {
      id: 3,
      url: "banner3.jpg",
      alt: "Success stories",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [images] = useState<Image[]>(propImages || defaultImages);

  // Create slides array with countdown first, then images
  const slides: CarouselSlide[] = [
    {
      id: 0,
      type: "countdown",
      content: null,
    },
    ...images.map(
      (img): CarouselSlide => ({
        id: img.id,
        type: "image",
        content: img,
      })
    ),
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, interval);

    return () => clearInterval(timer);
  }, [interval, slides.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="relative w-full overflow-hidden ">
      {/* Slides */}
      <div
        className="flex transition-transform duration-3000 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide.id} className="w-full flex-shrink-0">
            {slide.type === "image" && slide.content && (
              <div className="py-10">
                <div className="container mx-auto px-4">
                  <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
                    <img
                      src={slide.content.url}
                      alt={slide.content.alt}
                      className="w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30"></div>
                  </div>
                </div>
              </div>
            )}
            {slide.type === "countdown" && <CountdownBanner />}
          </div>
        ))}
      </div>

      {/* Left/Right Navigation Arrows */}
      <button
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors duration-200 z-20"
        onClick={() =>
          goToSlide((currentIndex - 1 + slides.length) % slides.length)
        }
        aria-label="Previous slide"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <button
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors duration-200 z-20"
        onClick={() => goToSlide((currentIndex + 1) % slides.length)}
        aria-label="Next slide"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  );
};
