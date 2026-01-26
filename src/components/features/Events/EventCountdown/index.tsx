"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

interface EventCountdownProps {
  targetDate: string; // ISO string
  onZero?: () => void;
}

export function EventCountdown({ targetDate, onZero }: EventCountdownProps) {
  const t = useTranslations('countdown');
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      } else {
        if (onZero) onZero();
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onZero]);

  if (!timeLeft) return null;

  return (
    <div className="flex gap-4 text-center font-mono">
      <div className="flex flex-col">
        <span className="text-2xl font-bold">{timeLeft.days}</span>
        <span className="text-xs text-gray-500 uppercase">{t('days')}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-bold">{timeLeft.hours.toString().padStart(2, '0')}</span>
        <span className="text-xs text-gray-500 uppercase">{t('hours')}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-bold">{timeLeft.minutes.toString().padStart(2, '0')}</span>
        <span className="text-xs text-gray-500 uppercase">{t('minutes')}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-bold">{timeLeft.seconds.toString().padStart(2, '0')}</span>
        <span className="text-xs text-gray-500 uppercase">{t('seconds')}</span>
      </div>
    </div>
  );
}
