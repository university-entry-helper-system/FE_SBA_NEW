import { useState, useEffect } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const CountdownBanner = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const targetDate = new Date(`${currentYear}-06-25T00:00:00`);

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full py-12 sm:py-16 md:py-20 bg-gradient-to-r from-primary-700 via-primary-600 to-accent-400 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute -top-8 -left-8 w-32 h-32 sm:w-40 sm:h-40 bg-primary-400/30 rounded-full blur-xl animate-float-slow"></div>
        <div className="absolute top-1/2 -right-12 w-40 h-40 sm:w-48 sm:h-48 bg-accent-300/30 rounded-full blur-xl animate-float-medium"></div>
        <div className="absolute -bottom-8 left-1/3 w-28 h-28 sm:w-36 sm:h-36 bg-primary-300/30 rounded-full blur-xl animate-float-fast"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-6">
          <div className="text-center md:text-left space-y-3 md:space-y-4 max-w-xl pg:ml-20 md:ml-10">
            {/* Pulse-glow animation for heading */}
            <style>{`
              @keyframes pulse-glow {
                0%, 100% {
                  transform: scale(1);
                  filter: drop-shadow(0 4px 16px rgba(109, 40, 217, 0.8));
                }
                50% {
                  transform: scale(1.06);
                  filter: drop-shadow(0 6px 24px rgba(109, 40, 217, 1));
                }
              }
              .animate-pulse-glow {
                animation: pulse-glow 1.8s ease-in-out infinite;
              }
            `}</style>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight animate-pulse-glow">
              Đếm ngược ngày thi đại học {new Date().getFullYear()}
            </h2>
            <p className="text-lg sm:text-xl text-primary-100 animate-fade-in-delay">
              Kỳ thi dự kiến bắt đầu ngày 25/06/{new Date().getFullYear()}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-4 md:gap-6 lg:gap-8 w-full max-w-xs sm:max-w-2xl md:max-w-3xl items-center justify-center">
            <TimeBox value={timeLeft.days} label="Ngày" />
            <TimeBox value={timeLeft.hours} label="Giờ" />
            <TimeBox value={timeLeft.minutes} label="Phút" />
            <TimeBox value={timeLeft.seconds} label="Giây" />
          </div>
        </div>
      </div>
    </div>
  );
};

interface TimeBoxProps {
  value: number;
  label: string;
}

const TimeBox = ({ value, label }: TimeBoxProps) => (
  <div className="flex flex-col items-center">
    <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl min-w-[70px] py-6 border border-white/30 w-24 px-2 sm:min-w-0 transition-transform hover:scale-110">
      <div
        className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-widest text-center"
        style={{ textShadow: "0 0 2px rgba(0,0,0,0.3)" }}
      >
        {value.toString().padStart(2, "0")}
      </div>
      <div
        className="text-[10px] sm:text-xs md:text-sm text-white/90 mt-1 font-semibold tracking-wide uppercase text-center"
        style={{ textShadow: "0 0 2px rgba(0,0,0,0.3)" }}
      >
        {label}
      </div>
    </div>
  </div>
);
