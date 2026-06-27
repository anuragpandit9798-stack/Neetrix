import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';

interface StudyTimerProps {
  onTimeLogged: (seconds: number) => void;
  accumulatedSeconds: number;
}

export default function StudyTimer({ onTimeLogged, accumulatedSeconds }: StudyTimerProps) {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPresetActive, setIsPresetActive] = useState(false);
  const [presetDuration, setPresetDuration] = useState(0);
  const [presetTotal, setPresetTotal] = useState(0);

  const incrementRef = useRef<NodeJS.Timeout | null>(null);

  // Play synthetic audio chime using the Web Audio API
  const playChime = () => {
    if (isMuted) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Chime 1 (Warm lower pitch)
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      gain1.gain.setValueAtTime(0, audioCtx.currentTime);
      gain1.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
      osc1.start(audioCtx.currentTime);
      osc1.stop(audioCtx.currentTime + 0.5);

      // Chime 2 (Harmonic higher pitch)
      setTimeout(() => {
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5
        gain2.gain.setValueAtTime(0, audioCtx.currentTime);
        gain2.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.05);
        gain2.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
        osc2.start(audioCtx.currentTime);
        osc2.stop(audioCtx.currentTime + 0.5);
      }, 150);

    } catch (e) {
      console.warn("AudioContext failed to initialize: ", e);
    }
  };

  useEffect(() => {
    if (isActive) {
      incrementRef.current = setInterval(() => {
        if (isPresetActive) {
          setPresetDuration((prev) => {
            if (prev <= 1) {
              setIsActive(false);
              setIsPresetActive(false);
              playChime();
              onTimeLogged(presetTotal); // Log the full preset duration
              return 0;
            }
            return prev - 1;
          });
          setSeconds((prev) => prev + 1);
        } else {
          setSeconds((prev) => prev + 1);
        }
      }, 1000);
    } else if (incrementRef.current) {
      clearInterval(incrementRef.current);
    }

    return () => {
      if (incrementRef.current) clearInterval(incrementRef.current);
    };
  }, [isActive, isPresetActive, presetTotal, isMuted]);

  const handleStart = () => {
    setIsActive(true);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setIsPresetActive(false);
    setSeconds(0);
    setPresetDuration(0);
    setPresetTotal(0);
  };

  const handleStopAndLog = () => {
    setIsActive(false);
    if (seconds > 0) {
      onTimeLogged(seconds);
      setSeconds(0);
      setIsPresetActive(false);
      setPresetDuration(0);
      setPresetTotal(0);
      playChime();
    }
  };

  const startPreset = (minutes: number) => {
    handleReset();
    const secs = minutes * 60;
    setPresetDuration(secs);
    setPresetTotal(secs);
    setIsPresetActive(true);
    setIsActive(true);
  };

  const formatTime = (totalSecs: number) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatTotalTime = (totalSecs: number) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    if (h > 0) {
      return `${h}h ${m}m`;
    }
    return `${m}m`;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-2xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span> Study Session
        </h2>
        
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          title={isMuted ? 'Unmute chime' : 'Mute chime'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      <div className="flex flex-col items-center">
        {/* Timer Visualization */}
        <div className="relative w-40 h-40 flex items-center justify-center mb-5">
          {/* Outer animated pulses when running */}
          {isActive && (
            <div className="absolute inset-0 rounded-full bg-cyan-500/5 animate-pulse-ring" />
          )}

          {/* SVG Progress Circle */}
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Circle */}
            <circle
              cx="80"
              cy="80"
              r="70"
              className="stroke-slate-950 fill-none"
              strokeWidth="5"
            />
            {/* Foreground progress circle */}
            <circle
              cx="80"
              cy="80"
              r="70"
              className="stroke-cyan-400 fill-none transition-all duration-300"
              strokeWidth="5"
              strokeDasharray="439.8"
              strokeDashoffset={
                isPresetActive && presetTotal > 0
                  ? 439.8 - (presetDuration / presetTotal) * 439.8
                  : isActive
                  ? 439.8 // when stopwatch is running, solid or rotating
                  : 0
              }
              strokeLinecap="round"
            />
          </svg>

          {/* Numeric text */}
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-3xl font-bold font-mono tracking-tighter text-white">
              {formatTime(isPresetActive ? presetDuration : seconds)}
            </span>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">
              {isPresetActive ? 'Pomodoro' : 'Stopwatch'}
            </span>
            {accumulatedSeconds > 0 && (
              <span className="text-[10px] text-cyan-400 font-mono mt-1 bg-cyan-950/40 border border-cyan-900/30 px-2 py-0.5 rounded-full">
                +{formatTotalTime(accumulatedSeconds)} saved
              </span>
            )}
          </div>
        </div>

        {/* Stopwatch Controls */}
        <div className="flex gap-2 w-full mb-5">
          {isActive ? (
            <button
              onClick={handlePause}
              className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold rounded-lg text-xs uppercase hover:bg-orange-400 transition-colors"
            >
              Pause
            </button>
          ) : (
            <button
              onClick={handleStart}
              className="flex-1 py-2 bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs uppercase hover:bg-cyan-400 transition-colors"
            >
              Start
            </button>
          )}

          <button
            onClick={handleStopAndLog}
            disabled={seconds === 0}
            className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-lg text-xs uppercase transition-all"
          >
            Save
          </button>

          <button
            onClick={handleReset}
            className="px-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-400 rounded-lg flex items-center justify-center transition-colors hover:text-white"
            title="Reset timer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="w-full pt-4 border-t border-slate-850">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 text-center">
            Focus Presets
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {[15, 25, 45, 60].map((mins) => (
              <button
                key={mins}
                onClick={() => startPreset(mins)}
                className={`py-1.5 text-[10px] font-bold font-mono rounded-lg border transition-all ${
                  presetTotal === mins * 60 && isPresetActive
                    ? 'bg-cyan-950/40 text-cyan-400 border-cyan-800/80'
                    : 'bg-slate-950 hover:bg-slate-900 text-slate-400 border-slate-850 hover:text-slate-200'
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
