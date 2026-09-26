import React from 'react';
import { Play, Pause, RotateCcw, Timer } from 'lucide-react';

const STORAGE_KEY = 'athlete_pwa_rest_timer_target';

export default function RestTimer({ initialSeconds = 90, onFinish }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [secondsLeft, setSecondsLeft] = React.useState(initialSeconds);
  const [isActive, setIsActive] = React.useState(false);

  // Cargar timer activo de localStorage si existe
  React.useEffect(() => {
    const savedTarget = localStorage.getItem(STORAGE_KEY);
    if (savedTarget) {
      const targetTime = parseInt(savedTarget, 10);
      const remaining = Math.max(0, Math.ceil((targetTime - Date.now()) / 1000));
      if (remaining > 0) {
        setSecondsLeft(remaining);
        setIsActive(true);
        setIsOpen(true);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Intervalo de cuenta regresiva
  React.useEffect(() => {
    let interval = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        const savedTarget = localStorage.getItem(STORAGE_KEY);
        if (savedTarget) {
          const targetTime = parseInt(savedTarget, 10);
          const remaining = Math.max(0, Math.ceil((targetTime - Date.now()) / 1000));
          setSecondsLeft(remaining);
          if (remaining <= 0) {
            setIsActive(false);
            localStorage.removeItem(STORAGE_KEY);
            if (onFinish) onFinish();
          }
        } else {
          setSecondsLeft((prev) => {
            if (prev <= 1) {
              setIsActive(false);
              if (onFinish) onFinish();
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft, onFinish]);

  const startTimer = (secs) => {
    setSecondsLeft(secs);
    setIsActive(true);
    setIsOpen(true);
    const target = Date.now() + secs * 1000;
    localStorage.setItem(STORAGE_KEY, target.toString());
  };

  const togglePause = () => {
    if (isActive) {
      setIsActive(false);
      localStorage.removeItem(STORAGE_KEY);
    } else {
      setIsActive(true);
      const target = Date.now() + secondsLeft * 1000;
      localStorage.setItem(STORAGE_KEY, target.toString());
    }
  };

  const resetTimer = (secs = initialSeconds) => {
    setSecondsLeft(secs);
    setIsActive(false);
    localStorage.removeItem(STORAGE_KEY);
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
        onClick={() => startTimer(initialSeconds)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-semibold transition-all hover:scale-105 active:scale-95 shadow-sm"
      >
        <Timer className="w-3.5 h-3.5 animate-pulse text-amber-400" />
        <span>Descanso ({initialSeconds}s)</span>
      </button>
    );
  }

  return (
    <div className="bg-zinc-900/95 border border-amber-500/40 rounded-xl p-3 my-2 shadow-lg shadow-amber-500/5 transition-all">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
            <Timer className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-zinc-200">Rest Timer Persistente</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => startTimer(60)}
            className={`px-2 py-0.5 text-[10px] rounded font-medium ${secondsLeft === 60 ? 'bg-amber-500 text-black font-bold' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
          >
            60s
          </button>
          <button
            onClick={() => startTimer(90)}
            className={`px-2 py-0.5 text-[10px] rounded font-medium ${secondsLeft === 90 ? 'bg-amber-500 text-black font-bold' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
          >
            90s
          </button>
          <button
            onClick={() => startTimer(120)}
            className={`px-2 py-0.5 text-[10px] rounded font-medium ${secondsLeft === 120 ? 'bg-amber-500 text-black font-bold' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
          >
            120s
          </button>
          <button
            onClick={() => {
              setIsOpen(false);
              localStorage.removeItem(STORAGE_KEY);
            }}
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
            {secondsLeft === 0 ? "¡Siguiente serie!" : isActive ? "descansando..." : "pausado"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={togglePause}
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
