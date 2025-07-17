// ... existing code ...
import { useState, useEffect, useRef } from 'react';
import '../css/AdmissionMethodsCarousel.css';


interface AdmissionMethodsCarouselProps {
  admissionMethods: any[]; // Replace 'any' with your actual type if available
  loading: boolean;
  error: string;
}

const AdmissionMethodsCarousel = ({
  admissionMethods,
  loading,
  error,
}: AdmissionMethodsCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(4);

  // Add missing ref for carousel
  const carouselRef = useRef<HTMLDivElement>(null);

  // Calculate items per page based on screen size
  const [translatePercent, setTranslatePercent] = useState(100);
  const updateItemsPerPage = () => {
    const width = window.innerWidth;
    if (width <= 480) {
      setItemsPerPage(1);
      setTranslatePercent(90);
    } else if (width <= 768) {
      setItemsPerPage(2);
      setTranslatePercent(100);
    } else if (width <= 1024) {
      setItemsPerPage(3);
      setTranslatePercent(100);
    } else {
      setItemsPerPage(4);
      setTranslatePercent(100);
    }
  };

  useEffect(() => {
    updateItemsPerPage();
    window.addEventListener('resize', updateItemsPerPage);
    return () => window.removeEventListener('resize', updateItemsPerPage);
  }, []);

  useEffect(() => {
    // Reset to first page when items change
    setCurrentIndex(0);
  }, [admissionMethods]);

  const maxIndex = Math.max(0, admissionMethods.length - itemsPerPage);
  const totalPages = Math.ceil(admissionMethods.length / itemsPerPage);

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(Math.max(currentIndex - itemsPerPage, 0));
    }
  };

  const handleNext = () => {
    if (currentIndex < maxIndex) {
      setCurrentIndex(Math.min(currentIndex + itemsPerPage, maxIndex));
    }
  };

  // FIX: Add type for pageIndex
  const handleDotClick = (pageIndex: number) => {
    setCurrentIndex(Math.min(pageIndex * itemsPerPage, maxIndex));
  };

  // Handle keyboard navigation
  useEffect(() => {
    // FIX: Add type for e
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, maxIndex]);

  // Handle touch gestures
  // FIX: Add type for touchStart ref
  const touchStart = useRef<number | null>(null);

  // FIX: Add type for e
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStart.current = e.touches[0].clientX;
  };

  // FIX: Add type for e
  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStart.current === null) return;

    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart.current - touchEnd;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStart.current = null;
  };

  if (loading) {
    return (
      <section className="admission-methods-section">
        <h2 className="features-title">PHƯƠNG THỨC TUYỂN SINH MỚI NHẤT</h2>
        <div className="admission-methods-loading">Đang tải...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="admission-methods-section">
        <h2 className="features-title">PHƯƠNG THỨC TUYỂN SINH MỚI NHẤT</h2>
        <div className="admission-methods-error">{error}</div>
      </section>
    );
  }

  return (
    <section className="admission-methods-section">
      <h2 className="features-title">PHƯƠNG THỨC TUYỂN SINH MỚI NHẤT</h2>

      <div className="admission-methods-carousel">
        {/* Left Navigation Button */}
        <button
          className={`carousel-nav carousel-nav-left ${currentIndex === 0 ? 'disabled' : ''}`}
          onClick={handlePrev}
          disabled={currentIndex === 0}
          aria-label="Previous"
        >
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
          </svg>
        </button>

        {/* Carousel Content */}
        <div
          className="admission-methods-list"
          ref={carouselRef}
          style={{
            transform: `translateX(-${currentIndex * (translatePercent / itemsPerPage)}%)`,
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {admissionMethods.map((method, index) => (
            <div
              className="admission-method-card"
              key={method.id}
              style={{
                flex: `0 0 ${100 / itemsPerPage}%`,
              }}
            >
              <div className="admission-method-icon" style={{ fontSize: '3rem', marginBottom: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '64px' }}>
                {(() => {
                  const icons = ['📄', '🎓', '🧪', '🌐', '📝', '🏫', '📊', '🗂️', '🧠', '💡', '📚', '🧑‍🎓'];
                  return icons[index % icons.length];
                })()}
              </div>
              <div className="admission-method-title">{method.name}</div>
              <div className="admission-method-desc">{method.description}</div>
            </div>
          ))}
        </div>

        {/* Right Navigation Button */}
        <button
          className={`carousel-nav carousel-nav-right ${currentIndex >= maxIndex ? 'disabled' : ''}`}
          onClick={handleNext}
          disabled={currentIndex >= maxIndex}
          aria-label="Next"
        >
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
          </svg>
        </button>
      </div>

      {/* Pagination Dots */}
      {totalPages > 1 && (
        <div className="carousel-pagination">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              className={`pagination-dot ${
                Math.floor(currentIndex / itemsPerPage) === index ? 'active' : ''
              }`}
              onClick={() => handleDotClick(index)}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default AdmissionMethodsCarousel;