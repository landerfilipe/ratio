// --- Skeleton Components para Loading States (evita CLS) ---
import React from 'react';

interface SkeletonProps {
  isDarkMode: boolean;
}

// Skeleton para Login
export const LoginSkeleton: React.FC<SkeletonProps> = ({ isDarkMode }) => (
  <div
    className={`rounded-2xl shadow-xl p-8 max-w-md w-full border animate-pulse ${
      isDarkMode
        ? 'bg-neutral-900 border-neutral-800'
        : 'bg-white border-slate-200'
    }`}
  >
    <div
      className={`h-12 w-12 mx-auto mb-4 rounded-full ${
        isDarkMode ? 'bg-neutral-800' : 'bg-slate-100'
      }`}
    ></div>
    <div
      className={`h-8 w-32 mx-auto mb-2 rounded ${
        isDarkMode ? 'bg-neutral-800' : 'bg-slate-100'
      }`}
    ></div>
    <div
      className={`h-4 w-48 mx-auto mb-8 rounded ${
        isDarkMode ? 'bg-neutral-800' : 'bg-slate-100'
      }`}
    ></div>
    <div
      className={`h-14 w-full rounded-xl ${
        isDarkMode ? 'bg-neutral-800' : 'bg-slate-100'
      }`}
    ></div>
  </div>
);

// Skeleton genérico para Views (mantém altura estável para evitar CLS)
export const ViewSkeleton: React.FC<SkeletonProps> = ({ isDarkMode }) => (
  <div className="space-y-6 animate-pulse p-4">
    {/* Header card skeleton */}
    <div
      className={`h-16 w-full rounded-2xl ${
        isDarkMode ? 'bg-neutral-900' : 'bg-slate-100'
      }`}
    ></div>
    
    {/* Stats cards skeleton */}
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={`h-24 rounded-2xl ${
            isDarkMode ? 'bg-neutral-900' : 'bg-slate-100'
          }`}
        ></div>
      ))}
    </div>
    
    {/* Main content skeleton */}
    <div
      className={`h-64 w-full rounded-2xl ${
        isDarkMode ? 'bg-neutral-900' : 'bg-slate-100'
      }`}
    ></div>
  </div>
);

// Skeleton para Statistics (gráficos)
export const StatisticsSkeleton: React.FC<SkeletonProps> = ({ isDarkMode }) => (
  <div className="space-y-6 animate-pulse p-4">
    {/* Heatmap skeleton */}
    <div
      className={`h-48 w-full rounded-2xl ${
        isDarkMode ? 'bg-neutral-900' : 'bg-slate-100'
      }`}
    ></div>
    
    {/* Chart skeleton */}
    <div
      className={`h-64 w-full rounded-2xl ${
        isDarkMode ? 'bg-neutral-900' : 'bg-slate-100'
      }`}
    ></div>
    
    {/* Table skeleton */}
    <div
      className={`h-48 w-full rounded-2xl ${
        isDarkMode ? 'bg-neutral-900' : 'bg-slate-100'
      }`}
    ></div>
  </div>
);
