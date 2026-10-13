import React from 'react';
import { X, ExternalLink, Info, CheckCircle2 } from 'lucide-react';

export default function ExerciseModal({ exercise, onClose }) {
  if (!exercise) return null;

  const isVideo = exercise.videoUrl && (exercise.videoUrl.includes('youtube') || exercise.videoUrl.includes('vimeo'));
  const isImage = exercise.videoUrl && (exercise.videoUrl.endsWith('.jpg') || exercise.videoUrl.endsWith('.png') || exercise.videoUrl.includes('free-exercise-db') || exercise.videoUrl.startsWith('http'));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700/80 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/60">
          <div>
            <div className="inline-block text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-amber-400 bg-emerald-50 dark:bg-amber-500/10 px-2.5 py-0.5 rounded-full mb-1 border border-emerald-200/60 dark:border-amber-500/30">
              Guía Técnica Team HD
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              {exercise.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Media Player: Muestra de video o Fotografía Real del Ejercicio */}
        <div className="relative aspect-video w-full bg-slate-100 dark:bg-zinc-950 flex items-center justify-center overflow-hidden">
          {isVideo ? (
            <iframe
              src={exercise.videoUrl}
              title={exercise.name}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : isImage ? (
            <img 
              src={exercise.videoUrl} 
              alt={exercise.name} 
              className="w-full h-full object-contain bg-slate-950"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-zinc-500 gap-2 p-6 text-center">
              <Info className="w-8 h-8 text-emerald-600 dark:text-amber-500" />
              <p className="text-xs text-slate-600 dark:text-zinc-400 font-semibold">Muestra de postura y biomecánica en catálogo</p>
            </div>
          )}
        </div>

        {/* Tips & Instructions */}
        <div className="p-5 space-y-3.5 bg-white dark:bg-zinc-900">
          <div className="bg-slate-50 dark:bg-zinc-800/60 rounded-2xl p-3.5 border border-slate-200/80 dark:border-zinc-700/40">
            <h4 className="text-xs font-bold text-emerald-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-amber-400" />
              Puntos Clave de Ejecución
            </h4>
            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed font-medium">
              {exercise.tips || "Mantén la estabilidad del core, controla la fase excéntrica en 2 a 3 segundos y ejecuta un rango completo de movimiento sin compensaciones articulares."}
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 pt-1 px-1">
            <span>Series programadas: <strong className="text-slate-800 dark:text-white font-bold">{exercise.series || "4x10"}</strong></span>
            <span>Descanso sugerido: <strong className="text-emerald-700 dark:text-amber-400 font-bold">{exercise.restSeconds || 90}s</strong></span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-zinc-950 border-t border-slate-100 dark:border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-black font-extrabold text-xs transition-colors shadow-sm"
          >
            Entendido, volver a la rutina
          </button>
        </div>
      </div>
    </div>
  );
}
