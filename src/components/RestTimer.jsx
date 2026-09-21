import React from 'react';
import { Play, Pause, RotateCcw, Timer } from 'lucide-react';

export default function RestTimer({ initialSeconds = 90, onFinish }) {
  const [secondsLeft, setSecondsLeft] = React.useState(initialSeconds);
  const [isActive, setIsActive] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    let interval = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isActive) {
      setIsActive(false);
      if (onFinish) onFinish();
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft, onFinish]);

  const toggleTimer = () => {
    if (!isOpen) {
      setIsOpen(true);
      setIsActive(true);
    } else {
      setIsActive(!isActive);
    }
  };

  const resetTimer = (secs = initialSeconds) => {
    setSecondsLeft(secs);
    setIsActive(false);
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins}:${remSecs < 10 ? '0' : ''}${remSecs}`;
  };

  const progressPercent = Math.max(0, Math.min(100, ((initialSeconds - secondsLeft) / initialSeconds) * 100));

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          setIsOpen(true);
          setIsActive(true);
        }}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-semibold transition-all hover:scale-105 active:scale-95 shadow-sm"
      >
        <Timer className="w-3.5 h-3.5 animate-pulse text-amber-400" />
        <span>Descanso ({initialSeconds}s)</span>
      </button>
    );
  }

  return (
    <div className="bg-zinc-900/90 border border-amber-500/40 rounded-xl p-3 my-2 shadow-lg shadow-amber-500/5 transition-all">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
            <Timer className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-zinc-200">Rest Timer Inteligente</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => resetTimer(60)}
            className={`px-2 py-0.5 text-[10px] rounded font-medium ${secondsLeft === 60 ? 'bg-amber-500 text-black font-bold' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
          >
            60s
          </button>
          <button
            onClick={() => resetTimer(90)}
            className={`px-2 py-0.5 text-[10px] rounded font-medium ${secondsLeft === 90 ? 'bg-amber-500 text-black font-bold' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
          >
            90s
          </button>
          <button
            onClick={() => resetTimer(120)}
            className={`px-2 py-0.5 text-[10px] rounded font-medium ${secondsLeft === 120 ? 'bg-amber-500 text-black font-bold' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
          >
            120s
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="text-zinc-500 hover:text-zinc-300 ml-1 text-xs px-1"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="text-2xl font-mono font-bold tracking-tight text-white flex items-baseline gap-1">
          <span>{formatTime(secondsLeft)}</span>
          <span className="text-xs text-zinc-500 font-sans">
            {secondsLeft === 0 ? "¡A darle a la siguiente serie!" : isActive ? "descansando..." : "pausado"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTimer}
            className={`p-2 rounded-lg flex items-center justify-center transition-all ${
              isActive 
                ? 'bg-amber-500 text-black hover:bg-amber-400 font-bold' 
                : 'bg-emerald-500 text-black hover:bg-emerald-400 font-bold'
            }`}
            title={isActive ? "Pausar" : "Reanudar"}
          >
            {isActive ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
          </button>

          <button
            onClick={() => resetTimer(initialSeconds)}
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
            title="Reiniciar"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
