// --- Theme Constants (isolado para reuso entre views) ---

// Cores do tema
export const COLORS = [
  '#EAB308',
  '#CA8A04',
  '#A16207',
  '#854D0E',
  '#713F12',
  '#FEF08A',
  '#FDE047',
  '#FACC15',
  '#F59E0B',
  '#D97706',
  '#B45309',
  '#525252',
];

// Cores do Heatmap por modo
export const getHeatmapColors = (isDarkMode: boolean): string[] =>
  isDarkMode
    ? ['#262626', '#423606', '#715d0b', '#a1860f', '#EAB308']
    : ['#f3f4f6', '#fef9c3', '#fde047', '#eab308', '#ca8a04'];

// Gradiente de texto
export const TEXT_GRADIENT =
  'bg-gradient-to-br from-[#FDE047] to-[#EAB308] bg-clip-text text-transparent';

// Cor sólida para ícones
export const ICON_SOLID_COLOR = '#FACC15';
export const ICON_SOLID_STYLE = { stroke: ICON_SOLID_COLOR };

// Estilo para header (gradiente)
export const ICON_HEADER_STYLE = { stroke: 'url(#gold-gradient)' };

// Função para gerar classes de tema
export const getThemeClasses = (isDarkMode: boolean) => ({
  bg: isDarkMode ? 'bg-neutral-950' : 'bg-slate-50',
  card:
    (isDarkMode
      ? 'bg-neutral-900 border-neutral-800'
      : 'bg-white border-slate-200') + ' transition-colors duration-200',
  text: isDarkMode ? 'text-white' : 'text-slate-800',
  textMuted: isDarkMode ? 'text-neutral-400' : 'text-slate-500',
  input:
    (isDarkMode
      ? 'bg-neutral-900 border-neutral-700 text-white'
      : 'bg-slate-50 border-slate-300 text-slate-800') +
    ' transition-colors duration-200',
  accent: '#EAB308',
  accentText: 'text-[#EAB308]',
  accentBg: 'bg-[#EAB308]',
  danger: 'text-red-500',
  success: 'text-green-500',
});
