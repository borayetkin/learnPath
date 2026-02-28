'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';

const PHASES = [
  { label: 'Analyzing your learning goal', icon: '🎯' },
  { label: 'Researching the best resources', icon: '📚' },
  { label: 'Structuring your learning path', icon: '🗺️' },
  { label: 'Connecting the milestones', icon: '🔗' },
  { label: 'Finalizing your roadmap', icon: '✨' },
];

export default function GeneratePage() {
  const router = useRouter();
  const [phase, setPhase] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dots, setDots] = useState('');
  const hasStarted = useRef(false);

  // Animate the dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '' : d + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Cycle through phases while waiting
  useEffect(() => {
    const interval = setInterval(() => {
      setPhase((p) => (p < PHASES.length - 1 ? p + 1 : p));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Trigger the API call
  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const stored = sessionStorage.getItem('generate-request');
    if (!stored) {
      router.replace('/');
      return;
    }

    const generate = async () => {
      try {
        const data = JSON.parse(stored);
        const response = await fetch('/api/paths/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (result.success) {
          const pathId = `path-${Date.now()}`;
          localStorage.setItem(pathId, JSON.stringify(result.data));
          sessionStorage.removeItem('generate-request');
          router.replace(`/path/${pathId}`);
        } else {
          setError(result.error || 'Failed to generate learning path');
        }
      } catch (err) {
        setError('An error occurred. Please try again.');
      }
    };

    generate();
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-950 via-indigo-950 to-cyan-950">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Generation Failed</h2>
          <p className="text-gray-400 mb-6 text-sm">{error}</p>
          <button
            onClick={() => router.replace('/')}
            className="px-6 py-2.5 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-violet-950 via-indigo-950 to-cyan-950 overflow-hidden relative">
      {/* Background animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/5 animate-float"
            style={{
              width: `${Math.random() * 8 + 4}px`,
              height: `${Math.random() * 8 + 4}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 8}s`,
            }}
          />
        ))}
      </div>

      {/* Animated rings */}
      <div className="relative mb-12">
        <div className="w-28 h-28 rounded-full border-2 border-violet-500/30 animate-spin-slow" />
        <div className="absolute inset-2 rounded-full border-2 border-cyan-500/40 animate-spin-reverse" />
        <div className="absolute inset-4 rounded-full border-2 border-violet-400/50 animate-spin-slow" style={{ animationDuration: '6s' }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Sparkles className="w-7 h-7 text-white animate-pulse" />
          </div>
        </div>
      </div>

      {/* Phase indicator */}
      <div className="text-center z-10 px-4">
        <h2 className="text-2xl font-bold text-white mb-3">
          Building Your Learning Path{dots}
        </h2>

        {/* Current phase */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="text-xl">{PHASES[phase].icon}</span>
          <span className="text-gray-300 text-sm">{PHASES[phase].label}</span>
        </div>

        {/* Phase dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {PHASES.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i < phase
                  ? 'w-8 bg-green-400'
                  : i === phase
                  ? 'w-8 bg-violet-400 animate-pulse'
                  : 'w-4 bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Animated horizontal path preview */}
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full border-2 transition-all duration-700 flex items-center justify-center shrink-0 ${
                    i <= phase
                      ? 'bg-violet-500/30 border-violet-400 scale-110'
                      : 'bg-gray-800/50 border-gray-700'
                  }`}
                  style={{ transitionDelay: `${i * 150}ms` }}
                >
                  {i < phase ? (
                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : i === phase ? (
                    <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-gray-600" />
                  )}
                </div>
                {i < 4 && (
                  <div
                    className={`w-12 sm:w-16 h-0.5 transition-all duration-700 ${
                      i < phase ? 'bg-green-400/60' : 'bg-gray-700'
                    }`}
                    style={{ transitionDelay: `${i * 150 + 100}ms` }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-gray-500 text-xs mt-12 z-10">This usually takes 15-30 seconds</p>

      {/* CSS for custom animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          25% { transform: translateY(-20px) translateX(10px); opacity: 0.6; }
          50% { transform: translateY(-10px) translateX(-10px); opacity: 0.4; }
          75% { transform: translateY(-30px) translateX(5px); opacity: 0.5; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-float { animation: float 8s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
        .animate-spin-reverse { animation: spin-reverse 6s linear infinite; }
      `}</style>
    </div>
  );
}
