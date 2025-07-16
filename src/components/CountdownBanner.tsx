import { useState, useEffect, useRef } from "react";
import "../css/CountdownBanner.css"; // Import CSS file

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
  const targetDateRef = useRef<Date>(new Date());

  useEffect(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    let targetDate = new Date(`${currentYear}-06-25T00:00:00`);
    // If today is after June 25, set target to next year
    if (now > targetDate) {
      targetDate = new Date(`${currentYear + 1}-06-25T00:00:00`);
    }
    targetDateRef.current = targetDate;

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
    <div className="countdown-banner">
      {/* Animated background elements */}


      <div className="countdown-container">
        <div className="countdown-content">
          <div className="countdown-text">
            <h2 className="countdown-heading">
              Đếm ngược ngày thi đại học {targetDateRef.current.getFullYear()}
            </h2>
            <p className="countdown-subheading">
              Kỳ thi dự kiến bắt đầu ngày 25/06/{targetDateRef.current.getFullYear()}
            </p>
          </div>

          <div className="time-boxes">
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
  <div className="time-box-wrapper">
    <div className="time-box">
      <div className="time-value">{value.toString().padStart(2, "0")}</div>
      <div className="time-label">{label}</div>
    </div>
  </div>
);
