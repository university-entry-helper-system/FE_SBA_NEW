import { useState, useEffect } from "react";
import { CountdownBanner } from "./CountdownBanner";
import "../css/ImageCarousel.css"; // Import CSS file

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
      url: "https://nctu.edu.vn/uploads/admissions/2025_01/tuyensinh_2_thumb.jpg",
      alt: "University entrance exam preparation",
    },
    {
      id: 2,
      url: "https://daihoc.fpt.edu.vn/wp-content/uploads/2021/09/Banner-web-FPTU-2021-tracuu-loctuyen-ccologo.png",
      alt: "Study tips and guidance",
    },
    {
      id: 3,
      url: "https://dhhp.edu.vn/admissions/admission-banner.jpg",
      alt: "Success stories",
    },
    {
      id: 4,
      url: "https://ts.huit.edu.vn/app_web/tttstt/images/slide/thong-tin-tuyen-sinh-dai-hoc-chinh-quy-nam-2025-02.6.2025-web-tuyen-sinh-11.png",
      alt: "Tuyển sinh Đại học Nam Cần Thơ 2025",
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

  // Fallback image for failed loads
  const FALLBACK_IMAGE =
    "https://nctu.edu.vn/uploads/admissions/2025_01/tuyensinh_2_thumb.jpg";

  return (
    <div className="carousel-container">
      {/* Slides */}
      <div
        className="carousel-slides"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide.id} className="carousel-slide">
            {slide.type === "image" && slide.content && (
              <div className="carousel-padding">
                <div className="carousel-inner">
                  <div className="carousel-image-container">
                    <img
                      src={slide.content.url}
                      alt={slide.content.alt}
                      className="carousel-image"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (target.src !== FALLBACK_IMAGE)
                          target.src = FALLBACK_IMAGE;
                      }}
                    />
                    <div className="carousel-overlay"></div>
                  </div>
                </div>
              </div>
            )}
            {slide.type === "countdown" && (
              <div className="carousel-countdown-top">
                <CountdownBanner />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Left/Right Navigation Arrows */}
      <button
        className="carousel-arrow carousel-arrow-left"
        onClick={() =>
          goToSlide((currentIndex - 1 + slides.length) % slides.length)
        }
        aria-label="Previous slide"
      >
        <svg
          className="carousel-arrow-icon"
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
        className="carousel-arrow carousel-arrow-right"
        onClick={() => goToSlide((currentIndex + 1) % slides.length)}
        aria-label="Next slide"
      >
        <svg
          className="carousel-arrow-icon"
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
