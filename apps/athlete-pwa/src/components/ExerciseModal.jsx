import React from 'react';
import { X, ExternalLink, Info, CheckCircle2 } from 'lucide-react';

export default function ExerciseModal({ exercise, onClose }) {
  if (!exercise) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950/60">
          <div>
            <div className="inline-block text-[11px] font-semibold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full mb-1">
              Guía Técnica Team HD
            </div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              {exercise.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player or Fallback */}
        <div className="relative aspect-video w-full bg-black">
          {exercise.videoUrl ? (
            <iframe
              src={exercise.videoUrl}
              title={exercise.name}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-2">
              <Info className="w-8 h-8 text-amber-500" />
              <p className="text-sm">Video demostrativo en producción por Coach HD</p>
            </div>
          )}
        </div>

        {/* Tips & Instructions */}
        <div className="p-4 space-y-3 bg-zinc-900">
          <div className="bg-zinc-800/60 rounded-xl p-3 border border-zinc-700/40">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              Puntos Clave de Ejecución
            </h4>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {exercise.tips || "Mantén la estabilidad del core, controla la fase excéntrica en 2 a 3 segundos y ejecuta un rango completo de movimiento sin compensaciones articulares."}
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
            <span>Series programadas: <strong className="text-white">{exercise.series || "4x10"}</strong></span>
            <span>Descanso óptimo: <strong className="text-amber-400">{exercise.restSeconds || 90}s</strong></span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-colors shadow-sm"
          >
            Entendido, volver a la rutina
          </button>
        </div>
      </div>
    </div>
  );
}
