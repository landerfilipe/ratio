// --- Types & Interfaces compartilhados entre views ---
import { User } from 'firebase/auth';

export interface StudySession {
  id: string;
  subject: string;
  durationMinutes: number;
  date: string;
  timestamp: number;
}

export interface UserProfile {
  name: string;
  surname: string;
  birthdate: string;
  location: string;
  bio: string;
  photoUrl: string;
  dailyGoalMinutes?: number;
}

export type TimeRange =
  | 'day'
  | '7_days'
  | '14_days'
  | '30_days'
  | '90_days'
  | '180_days'
  | '360_days';

export type SortOrder = 'desc' | 'asc';

export type ViewState =
  | 'home'
  | 'statistics'
  | 'calendar'
  | 'history'
  | 'profile'
  | 'timer';

export type TimerMode = 'stopwatch' | 'countdown';

// Interface para PWA install prompt
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

// Interface para custom ticks do Recharts
export interface CustomTickProps {
  x?: number;
  y?: number;
  payload?: { value: string | number };
  textAnchor?: 'start' | 'middle' | 'end' | 'inherit';
}

// Re-export User type from Firebase
export type { User };
