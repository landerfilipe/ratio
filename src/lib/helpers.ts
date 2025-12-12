// --- Helpers de Formatação (compartilhados entre views) ---

export const formatDurationDetailed = (mins: number): string => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}min`;
  const mString = m.toString().padStart(2, '0');
  return `${h}h${mString}min`;
};

export const formatDurationShort = (mins: number): string => {
  const h = Math.round(mins / 60);
  return `${h}h`;
};

export const formatGoalDuration = (mins: number): string => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (m === 0) return `${h}h`;
  return `${h}h${m}m`;
};

export const formatAxisTick = (mins: number): string => {
  const h = Math.round(mins / 60);
  return `${h}h`;
};

// Separates time into { main: "HH:MM", super: "SS" }
export const formatTimeComponents = (seconds: number): { main: string; super: string } => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  const mStr = m.toString().padStart(2, '0');
  const sStr = s.toString().padStart(2, '0');

  if (h > 0) {
    return { main: `${h}:${mStr}`, super: sStr };
  }
  return { main: mStr, super: sStr };
};

// Normaliza string para comparação (remove acentos, pontuação)
export const normalizeString = (str: string): string =>
  str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.,]/g, '')
    .toLowerCase()
    .trim();

// Trigger haptic feedback
export const triggerHaptic = (): void => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(10);
  }
};

// Get days from TimeRange
export const getDaysFromRange = (range: string): number => {
  if (range === 'day') return 1;
  return parseInt(range.split('_')[0]);
};

// Get range label in Portuguese
export const getRangeLabel = (range: string): string => {
  switch (range) {
    case 'day':
      return 'Hoje';
    case '7_days':
      return '7 Dias';
    case '14_days':
      return '14 Dias';
    case '30_days':
      return '30 Dias';
    case '90_days':
      return '90 Dias';
    case '180_days':
      return '180 Dias';
    case '360_days':
      return '360 Dias';
    default:
      return 'Período';
  }
};
