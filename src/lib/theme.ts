// --- Theme Constants (isolado para reuso entre views) ---
import type React from 'react';

// Cores do tema
export const COLORS = [
  '#EAB308E6',
  '#CA8A04E6',
  '#A16207E6',
  '#854D0EE6',
  '#713F12E6',
  '#FEF08AE6',
  '#FDE047E6',
  '#FACC15E6',
  '#F59E0BE6',
  '#D97706E6',
  '#B45309E6',
  '#525252',
];

// Cores do Heatmap por modo
export const getHeatmapColors = (isDarkMode: boolean): string[] =>
  isDarkMode
    ? ['#262626', '#423606E6', '#715d0bE6', '#a1860fE6', '#EAB308E6']
    : ['#f3f4f6', '#fef9c3E6', '#fde047E6', '#eab308E6', '#ca8a04E6'];

// Gradiente de texto
export const TEXT_GRADIENT =
  'bg-gradient-to-br from-[#FDE047E6] to-[#EAB308E6] bg-clip-text text-transparent';

// Cor sólida para ícones
export const ICON_SOLID_COLOR = '#FACC15E6';
export const ICON_SOLID_STYLE = { stroke: ICON_SOLID_COLOR };

// Estilo para header (gradiente)
export const ICON_HEADER_STYLE = { stroke: 'url(#gold-gradient)' };

// Escala de cor por Δ% em relação à meta
export const getPercentColor = (delta: number): string => {
  if (delta <= -50) return '#e03535';
  if (delta <= -25) return '#f08020';
  if (delta < 0)    return '#EAB308E6';
  if (delta < 50)   return '#3dc455';
  return '#1ac8c5';
};

export const getPercentStyle = (delta: number): React.CSSProperties => ({
  color: getPercentColor(delta),
});

// Função para gerar classes de tema
export const getThemeClasses = (isDarkMode: boolean) => ({
  bg: isDarkMode ? 'bg-neutral-950' : 'bg-slate-50',
  card:
    (isDarkMode
      ? 'bg-neutral-900 border-neutral-800'
      : 'bg-white border-slate-200') + ' transition-colors duration-200',
  text: isDarkMode ? 'text-neutral-300' : 'text-slate-800',
  textMuted: isDarkMode ? 'text-neutral-400' : 'text-slate-500',
  input:
    (isDarkMode
      ? 'bg-neutral-900 border-neutral-700 text-neutral-300'
      : 'bg-slate-50 border-slate-300 text-slate-800') +
    ' transition-colors duration-200',
  accent: '#EAB308E6',
  accentText: 'text-[#EAB308E6]',
  accentBg: 'bg-[#EAB308E6]',
  danger: 'text-red-500',
  success: 'text-green-500',
});
