"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Pause, Play, RotateCcw, Timer } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface RestTimerProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDuration?: number;
}

const PRESET_TIMES = [30, 60, 90, 120, 180, 300];

export function RestTimer({
  isOpen,
  onClose,
  defaultDuration = 90,
}: RestTimerProps) {
  const [duration, setDuration] = useState(defaultDuration);
  const [timeLeft, setTimeLeft] = useState(defaultDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<number | null>(null);

  /* ------------------------------------------------------------------ */
  /*                              Helpers                               */
  /* ------------------------------------------------------------------ */

  const stopTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const playNotification = () => {
    audioRef.current?.play().catch(() => {
      if ("vibrate" in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    });
  };

  /* ------------------------------------------------------------------ */
  /*                              Effects                               */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    audioRef.current = new Audio("/notification.mp3");
    return () => stopTimer();
  }, [audioRef, stopTimer]);

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          stopTimer();
          playNotification();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return stopTimer;
  }, [isRunning, stopTimer]);

  const resetTimer = (newDuration = duration) => {
    stopTimer();
    setDuration(newDuration);
    setTimeLeft(newDuration);
    setHasStarted(false);
  };

  /* ------------------------------------------------------------------ */
  /*                              Handlers                              */
  /* ------------------------------------------------------------------ */

  const handleStart = () => {
    setHasStarted(true);
    setIsRunning(true);
  };

  const handlePause = () => stopTimer();

  const handleReset = () => resetTimer();

  const handleDurationChange = (value: number) => {
    resetTimer(value);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  /* ------------------------------------------------------------------ */
  /*                               State                                */
  /* ------------------------------------------------------------------ */

  const progress = duration > 0 ? ((duration - timeLeft) / duration) * 100 : 0;

  const isComplete = hasStarted && timeLeft === 0;

  /* ------------------------------------------------------------------ */
  /*                                JSX                                 */
  /* ------------------------------------------------------------------ */

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Rest Timer
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Timer */}
          <div className="relative w-64 h-64 mx-auto">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="120"
                strokeWidth="8"
                fill="none"
                className="text-gray-200"
                stroke="currentColor"
              />
              <circle
                cx="128"
                cy="128"
                r="120"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 120}
                strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
                className={cn(
                  "transition-all duration-1000 ease-linear",
                  isComplete ? "text-green-500" : "text-primary"
                )}
                stroke="currentColor"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div
                className={cn(
                  "text-6xl font-bold tabular-nums",
                  isComplete && "text-green-500"
                )}
              >
                {formatTime(timeLeft)}
              </div>
              {isComplete && (
                <div className="text-green-500 font-semibold mt-2">
                  Rest Complete!
                </div>
              )}
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Rest Duration</label>
            <Select
              value={duration.toString()}
              onValueChange={(v) => handleDurationChange(Number(v))}
              disabled={isRunning}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRESET_TIMES.map((time) => (
                  <SelectItem key={time} value={time.toString()}>
                    {time < 60
                      ? `${time}s`
                      : `${Math.floor(time / 60)}m ${
                          time % 60 ? `${time % 60}s` : ""
                        }`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-3">
            {!isRunning ? (
              <Button size="lg" onClick={handleStart} className="w-32">
                <Play className="h-5 w-5 mr-2" />
                {hasStarted ? "Resume" : "Start"}
              </Button>
            ) : (
              <Button
                size="lg"
                variant="outline"
                onClick={handlePause}
                className="w-32"
              >
                <Pause className="h-5 w-5 mr-2" />
                Pause
              </Button>
            )}

            <Button
              size="lg"
              variant="outline"
              onClick={handleReset}
              disabled={!hasStarted}
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Reset
            </Button>
          </div>

          {/* Quick presets */}
          <div className="grid grid-cols-3 gap-2">
            {[30, 60, 90].map((t) => (
              <Button
                key={t}
                variant="outline"
                size="sm"
                onClick={() => handleDurationChange(t)}
                disabled={isRunning}
              >
                {t < 60 ? `${t}s` : `${t / 60}m`}
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
