import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, ChevronRight } from 'lucide-react';
import type { ConvergenceStep } from '@/types';
import NetworkTopology from './NetworkTopology';

interface SimulationPlayerProps {
  tasks: number[];
  servers: number[];
  convergenceSteps: ConvergenceStep[];
}

export default function SimulationPlayer({ tasks, servers, convergenceSteps }: SimulationPlayerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);

  const totalSteps = convergenceSteps.length;
  const currentAssignment = convergenceSteps[currentStep]?.assignment ?? new Array(tasks.length).fill(0);
  const currentInfo = convergenceSteps[currentStep];

  const nextStep = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, totalSteps - 1));
  }, [totalSteps]);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }, []);

  const reset = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying && currentStep < totalSteps - 1) {
      interval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= totalSteps - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    } else if (currentStep >= totalSteps - 1) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, totalSteps, speed]);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 bg-gray-50 rounded-xl p-4">
        <div className="flex items-center gap-2">
          <button
            onClick={reset}
            className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 transition-colors"
            title="Réinitialiser"
          >
            <RotateCcw className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 transition-colors disabled:opacity-50"
            title="Étape précédente"
          >
            <SkipBack className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-2 rounded-lg transition-colors ${
              isPlaying 
                ? 'bg-red-100 border-red-200 hover:bg-red-200' 
                : 'bg-primary-100 border-primary-200 hover:bg-primary-200'
            } border`}
            title={isPlaying ? 'Pause' : 'Lecture'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 text-red-600" />
            ) : (
              <Play className="w-4 h-4 text-primary-600" />
            )}
          </button>
          <button
            onClick={nextStep}
            disabled={currentStep >= totalSteps - 1}
            className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 transition-colors disabled:opacity-50"
            title="Étape suivante"
          >
            <SkipForward className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Progress */}
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Itération {currentInfo?.iteration ?? 0}</span>
            <span>{totalSteps} étapes</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${totalSteps > 1 ? (currentStep / (totalSteps - 1)) * 100 : 100}%` }}
            />
          </div>
        </div>

        {/* Speed */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Vitesse:</span>
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="text-sm border border-gray-200 rounded-lg px-2 py-1 bg-white"
          >
            <option value={2000}>Lent</option>
            <option value={1000}>Normal</option>
            <option value={500}>Rapide</option>
            <option value={200}>Très rapide</option>
          </select>
        </div>
      </div>

      {/* Step Info */}
      {currentInfo && currentInfo.movedTask !== null && (
        <div className="bg-nash/10 border border-nash/20 rounded-lg p-3 flex items-center gap-3">
          <ChevronRight className="w-5 h-5 text-nash" />
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Itération {currentInfo.iteration}:</span>{' '}
            Tâche <span className="font-mono font-bold">T{currentInfo.movedTask}</span> migre du{' '}
            <span className="font-mono">S{currentInfo.fromServer}</span> vers le{' '}
            <span className="font-mono">S{currentInfo.toServer}</span>
            {' — '}Makespan: <span className="font-bold">{currentInfo.makespan.toFixed(2)}</span>
          </p>
        </div>
      )}

      {currentInfo && currentInfo.movedTask === null && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <p className="text-sm text-green-700 font-medium">
            Équilibre de Nash atteint — Aucune tâche ne peut améliorer son coût unilatéralement
          </p>
        </div>
      )}

      {/* Topology */}
      <div className="border border-gray-200 rounded-xl p-4">
        <NetworkTopology
          tasks={tasks}
          servers={servers}
          assignment={currentAssignment}
          title={`Étape ${currentInfo?.iteration ?? 0}`}
        />
      </div>
    </div>
  );
}
