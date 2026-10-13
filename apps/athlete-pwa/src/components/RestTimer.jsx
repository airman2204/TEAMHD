import React from 'react';
import { Play, Pause, RotateCcw, Timer, Watch, Bell, CheckCircle2 } from 'lucide-react';

const STORAGE_KEY = 'athlete_pwa_rest_timer_target';

// Reproductor de silencio infinito para mantener activo el Bluetooth AVRCP en segundo plano
let silenceAudioElement = null;

function getOrCreateSilenceAudio() {
  if (!silenceAudioElement && typeof window !== 'undefined') {
    silenceAudioElement = new Audio();
    // Archivo de audio WAV silencioso codificado en base64 (1 segundo en bucle)
    silenceAudioElement.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==';
    silenceAudioElement.loop = true;
  }
  return silenceAudioElement;
}

export default function RestTimer({ 
  initialSeconds = 90, 
  exerciseName = "Ejercicio",
  onFinish 
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [secondsLeft, setSecondsLeft] = React.useState(initialSeconds);
  const [isActive, setIsActive] = React.useState(false);
  const [watchSyncEnabled, setWatchSyncEnabled] = React.useState(true);
  const [notificationPermission, setNotificationPermission] = React.useState(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );

  // Solicitar permiso de notificaciones para el reloj
  const requestNotificationAccess = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setNotificationPermission(perm);
      } catch (err) {
        console.warn('Error al solicitar permiso de notificación:', err);
      }
    }
  };

  // Disparar vibración y notificación local hacia el reloj Honor
  const triggerWatchAlarm = (msg = "¡Descanso terminado! A darle a la siguiente serie 🔥") => {
    // 1. Vibración en hardware celular (vibra el reloj si está enlazado)
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([400, 200, 400, 200, 600]);
      } catch (e) {
        console.warn('Vibration API no disponible', e);
      }
    }

    // 2. Notificación push del sistema (reflejada en la pantalla del Honor Watch)
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification("⏱️ Team HD • Tiempo Cumplido", {
          body: `${msg} (${exerciseName})`,
          icon: "/favicon.svg",
          tag: "rest-timer-finish",
          renotify: true
        });
      } catch (e) {
        console.warn('Notification error', e);
      }
    }
  };

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
            handleCompleteTimer();
          }
        } else {
          setSecondsLeft((prev) => {
            if (prev <= 1) {
              handleCompleteTimer();
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft]);

  const handleCompleteTimer = () => {
    setIsActive(false);
    localStorage.removeItem(STORAGE_KEY);
    triggerWatchAlarm();
    if (onFinish) onFinish();
  };

  // =========================================================================
  // INTEGRACIÓN CON HONOR WATCH / MEDIA SESSION BLUETOOTH
  // =========================================================================
  React.useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;

    if (isActive && secondsLeft > 0) {
      // Iniciar sesión multimedia visible en el reproductor de música del Honor Watch
      navigator.mediaSession.metadata = new MediaMetadata({
        title: `Descanso: ${secondsLeft}s`,
        artist: `Team HD Muscle • ${exerciseName}`,
        album: "Control de Entrenamiento en Reloj",
        artwork: [
          { src: "/favicon.svg", sizes: "96x96", type: "image/svg+xml" },
          { src: "/favicon.svg", sizes: "512x512", type: "image/svg+xml" }
        ]
      });

      navigator.mediaSession.playbackState = "playing";

      // Intentar reproducir sonido silencioso para enganchar el control Bluetooth del reloj
      const audio = getOrCreateSilenceAudio();
      audio.play().catch(() => {});

      // Botón Play / Pausa en el Honor Watch
      navigator.mediaSession.setActionHandler('play', () => {
        togglePause();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        togglePause();
      });

      // Botón Siguiente (⏭️) en el reloj: Terminar descanso de inmediato
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        handleCompleteTimer();
      });

      // Botón Anterior (⏮️) en el reloj: Resetear cronómetro
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        resetTimer(initialSeconds);
      });

      // Botón Stop
      navigator.mediaSession.setActionHandler('stop', () => {
        setIsActive(false);
        localStorage.removeItem(STORAGE_KEY);
      });
    } else {
      navigator.mediaSession.playbackState = "paused";
      if (silenceAudioElement) {
        silenceAudioElement.pause();
      }
    }
  }, [isActive, secondsLeft, exerciseName]);

  const startTimer = (secs) => {
    setSecondsLeft(secs);
    setIsActive(true);
    setIsOpen(true);
    const target = Date.now() + secs * 1000;
    localStorage.setItem(STORAGE_KEY, target.toString());

    // Asegurar permiso de notificación
    if (notificationPermission !== 'granted') {
      requestNotificationAccess();
    }
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
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 dark:text-amber-400 border border-emerald-200 dark:border-amber-500/30 rounded-xl text-xs font-bold transition-all hover:scale-102 active:scale-98 shadow-2xs"
      >
        <Timer className="w-3.5 h-3.5 animate-pulse text-emerald-600 dark:text-amber-400" />
        <span>Descanso ({initialSeconds}s)</span>
        <Watch className="w-3 h-3 text-emerald-600/80 dark:text-amber-400/80 ml-0.5" title="Sincronizado con Honor Watch" />
      </button>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900/95 border border-emerald-200/90 dark:border-amber-500/40 rounded-2xl p-4 my-2 shadow-xs transition-all space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-emerald-50 dark:bg-amber-500/20 text-emerald-600 dark:text-amber-400 border border-emerald-200/60 dark:border-transparent">
            <Watch className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-black text-slate-900 dark:text-zinc-100 block">Rest Timer • Reloj Conectado</span>
            <span className="text-[10px] text-slate-500 dark:text-zinc-400 flex items-center gap-1 font-medium">
              Honor Watch / Bluetooth Sync
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => startTimer(60)}
            className={`px-2 py-0.5 text-[10px] rounded-lg font-bold transition-colors ${secondsLeft === 60 ? 'bg-emerald-600 text-white dark:bg-amber-500 dark:text-black' : 'bg-slate-100 text-slate-600 hover:text-slate-900 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:text-white'}`}
          >
            60s
          </button>
          <button
            onClick={() => startTimer(90)}
            className={`px-2 py-0.5 text-[10px] rounded-lg font-bold transition-colors ${secondsLeft === 90 ? 'bg-emerald-600 text-white dark:bg-amber-500 dark:text-black' : 'bg-slate-100 text-slate-600 hover:text-slate-900 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:text-white'}`}
          >
            90s
          </button>
          <button
            onClick={() => startTimer(120)}
            className={`px-2 py-0.5 text-[10px] rounded-lg font-bold transition-colors ${secondsLeft === 120 ? 'bg-emerald-600 text-white dark:bg-amber-500 dark:text-black' : 'bg-slate-100 text-slate-600 hover:text-slate-900 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:text-white'}`}
          >
            120s
          </button>
          <button
            onClick={() => {
              setIsOpen(false);
              localStorage.removeItem(STORAGE_KEY);
            }}
            className="text-slate-400 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-300 ml-1 text-xs px-1"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-amber-500 dark:to-orange-500 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="text-2xl font-mono font-black tracking-tight text-slate-900 dark:text-white flex items-baseline gap-1.5">
          <span>{formatTime(secondsLeft)}</span>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-sans font-medium">
            {secondsLeft === 0 ? "¡Siguiente serie!" : isActive ? "descansando..." : "pausado"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={togglePause}
            className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
              isActive 
                ? 'bg-amber-500 text-black hover:bg-amber-400 font-bold' 
                : 'bg-emerald-600 text-white hover:bg-emerald-500 font-bold'
            }`}
            title={isActive ? "Pausar (o pausa en tu reloj)" : "Reanudar"}
          >
            {isActive ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
          </button>

          <button
            onClick={() => resetTimer(initialSeconds)}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 transition-colors"
            title="Reiniciar"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Badge explicativo de control en el reloj */}
      <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-[10px] text-slate-500 dark:text-zinc-400">
        <span className="flex items-center gap-1 text-emerald-700 dark:text-amber-400/90 font-medium">
          <Watch className="w-3 h-3" />
          Controla con Play/Pausa o Siguiente (⏭️) en tu reloj
        </span>
        {notificationPermission !== 'granted' && (
          <button
            onClick={requestNotificationAccess}
            className="text-amber-600 dark:text-orange-400 underline font-semibold flex items-center gap-0.5"
          >
            <Bell className="w-3 h-3" />
            Activar vibración
          </button>
        )}
      </div>
    </div>
  );
}
