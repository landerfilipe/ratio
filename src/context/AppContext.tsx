// --- App Context: Estado compartilhado entre views (Code Splitting) ---
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
  signOut,
} from 'firebase/auth';
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  deleteDoc,
  setDoc,
  getDoc,
} from 'firebase/firestore';

import { auth, db, appId } from '../lib/firebase';
import { triggerHaptic, normalizeString } from '../lib/helpers';
import { FIXED_SUBJECTS } from '../lib/subjects';
import type {
  User,
  StudySession,
  UserProfile,
  ViewState,
  TimeRange,
  SortOrder,
  TimerMode,
  BeforeInstallPromptEvent,
} from '../types';

// --- Context Value Interface ---
interface AppContextValue {
  // Auth
  user: User | null;
  loading: boolean;
  authError: string | null;
  handleGoogleLogin: () => Promise<void>;
  handleLogout: () => void;

  // Sessions
  sessions: StudySession[];
  handleAddSession: (
    subject: string,
    durationMinutes: number,
    date: Date
  ) => Promise<boolean>;
  handleDeleteSession: (id: string) => Promise<void>;

  // Profile
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  handleSaveProfile: () => Promise<void>;
  isSavingProfile: boolean;
  handleUpdateGoal: (newGoal: number) => Promise<void>;

  // Theme
  isDarkMode: boolean;
  setIsDarkMode: React.Dispatch<React.SetStateAction<boolean>>;

  // Navigation
  view: ViewState;
  setView: React.Dispatch<React.SetStateAction<ViewState>>;
  handleViewChange: (newView: ViewState) => void;

  // Filters
  timeRange: TimeRange;
  setTimeRange: React.Dispatch<React.SetStateAction<TimeRange>>;
  sortOrder: SortOrder;
  setSortOrder: React.Dispatch<React.SetStateAction<SortOrder>>;

  // PWA
  installPrompt: BeforeInstallPromptEvent | null;
  handleInstallClick: () => Promise<void>;

  // Timer
  timerMode: TimerMode;
  setTimerMode: React.Dispatch<React.SetStateAction<TimerMode>>;
  timerSeconds: number;
  setTimerSeconds: React.Dispatch<React.SetStateAction<number>>;
  timerIsActive: boolean;
  setTimerIsActive: React.Dispatch<React.SetStateAction<boolean>>;
  countdownInitialMinutes: number;
  setCountdownInitialMinutes: React.Dispatch<React.SetStateAction<number>>;

  // Form helpers
  isSubmitting: boolean;
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
}

const AppContext = createContext<AppContextValue | null>(null);

// --- Hook para usar o contexto ---
export const useApp = (): AppContextValue => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

// --- Provider Component ---
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Sessions
  const [sessions, setSessions] = useState<StudySession[]>([]);

  // Profile
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    surname: '',
    birthdate: '',
    location: '',
    bio: '',
    photoUrl: '',
    dailyGoalMinutes: 180,
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Theme
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Navigation
  const [view, setView] = useState<ViewState>('home');

  // Filters
  const [timeRange, setTimeRange] = useState<TimeRange>('day');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // PWA
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  // Timer
  const [timerMode, setTimerMode] = useState<TimerMode>(() => {
    if (typeof localStorage !== 'undefined') {
      return (
        (localStorage.getItem('ratio_timer_mode') as TimerMode) || 'stopwatch'
      );
    }
    return 'stopwatch';
  });

  const [timerSeconds, setTimerSeconds] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('ratio_timer_seconds');
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });

  const [countdownInitialMinutes, setCountdownInitialMinutes] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('ratio_timer_initial');
      return saved ? parseInt(saved, 10) : 30;
    }
    return 30;
  });

  const [timerIsActive, setTimerIsActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Effects ---

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        setLoading(false);
        setAuthError(null);
      } else {
        setUser(null);
        signInAnonymously(auth)
          .then(() => {})
          .catch((error) => {
            console.warn('Login anônimo:', error.code);
            setLoading(false);
            if (error.code === 'auth/admin-restricted-operation') {
              setAuthError("Erro: Ative 'Anônimo' no Console.");
            }
          });
      }
    });
    return () => unsubscribe();
  }, []);

  // Sessions listener
  useEffect(() => {
    if (!user) return;
    const sessionsRef = collection(
      db,
      'artifacts',
      appId,
      'users',
      user.uid,
      'study_sessions'
    );

    const unsubscribe = onSnapshot(
      sessionsRef,
      (snapshot) => {
        const loaded: StudySession[] = [];
        snapshot.docs.forEach((docSnapshot) => {
          const data = docSnapshot.data();
          const dateStr = data.date;
          if (dateStr && !isNaN(new Date(dateStr).getTime())) {
            loaded.push({
              id: docSnapshot.id,
              subject: data.subject || 'Outras',
              durationMinutes: data.durationMinutes || 0,
              date: dateStr,
              timestamp: data.timestamp || new Date(dateStr).getTime(),
            });
          }
        });
        loaded.sort((a, b) => b.timestamp - a.timestamp);
        setSessions(loaded);
      },
      (error) => {
        console.error('Error fetching study sessions:', error);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Fetch profile
  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      try {
        const docRef = doc(
          db,
          'artifacts',
          appId,
          'users',
          user.uid,
          'profile',
          'main'
        );
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfile;
          setProfile((prev) => ({ ...prev, ...data }));
        } else {
          setProfile((prev) => ({
            ...prev,
            name: user.displayName?.split(' ')[0] || '',
            surname: user.displayName?.split(' ').slice(1).join(' ') || '',
            photoUrl: user.photoURL || '',
            dailyGoalMinutes: 180,
          }));
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchProfile();
  }, [user]);

  // PWA Install Listener
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Save Timer State to LocalStorage
  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ratio_timer_seconds', timerSeconds.toString());
      localStorage.setItem('ratio_timer_mode', timerMode);
      localStorage.setItem(
        'ratio_timer_initial',
        countdownInitialMinutes.toString()
      );
    }
  }, [timerSeconds, timerMode, countdownInitialMinutes]);

  // Body background
  useEffect(() => {
    document.body.style.overscrollBehaviorY = 'none';
    document.documentElement.style.overscrollBehaviorY = 'none';
    document.body.style.backgroundColor = isDarkMode ? '#0a0a0a' : '#f8fafc';

    return () => {
      document.body.style.overscrollBehaviorY = 'auto';
      document.documentElement.style.overscrollBehaviorY = 'auto';
      document.body.style.backgroundColor = '';
    };
  }, [isDarkMode]);

  // Timer interval
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (timerIsActive) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (timerMode === 'countdown') {
            if (prev <= 0) {
              setTimerIsActive(false);
              triggerHaptic();
              return 0;
            }
            return prev - 1;
          } else {
            return prev + 1;
          }
        });
      }, 1000);
    } else if (!timerIsActive && timerSeconds !== 0 && interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerIsActive, timerSeconds, timerMode]);

  // --- Handlers ---

  const handleGoogleLogin = useCallback(async () => {
    triggerHaptic();
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (e: unknown) {
      console.error('Erro no Google Login:', e);
      const firebaseError = e as { code?: string; message?: string };
      if (firebaseError.code !== 'auth/popup-closed-by-user') {
        setAuthError(
          `Erro no login: ${firebaseError.message || 'Erro desconhecido'}`
        );
      }
    }
  }, []);

  const handleLogout = useCallback(() => {
    triggerHaptic();
    signOut(auth);
    setSessions([]);
  }, []);

  const handleViewChange = useCallback(
    (newView: ViewState) => {
      if (view !== newView) {
        triggerHaptic();
        setView(newView);
      }
    },
    [view]
  );

  const handleAddSession = useCallback(
    async (
      subject: string,
      durationMinutes: number,
      date: Date
    ): Promise<boolean> => {
      if (!user) return false;

      const cleanInput = normalizeString(subject);
      const exactMatch = FIXED_SUBJECTS.find(
        (s) => normalizeString(s) === cleanInput
      );
      if (!exactMatch) return false;

      setIsSubmitting(true);
      triggerHaptic();

      try {
        await addDoc(
          collection(db, 'artifacts', appId, 'users', user.uid, 'study_sessions'),
          {
            subject: exactMatch,
            durationMinutes,
            date: date.toISOString(),
            timestamp: date.getTime(),
          }
        );
        if (typeof navigator !== 'undefined' && navigator.vibrate)
          navigator.vibrate([30, 50, 30]);
        return true;
      } catch (e) {
        console.error(e);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [user]
  );

  const handleDeleteSession = useCallback(
    async (id: string) => {
      if (user) {
        triggerHaptic();
        await deleteDoc(
          doc(db, 'artifacts', appId, 'users', user.uid, 'study_sessions', id)
        );
      }
    },
    [user]
  );

  const handleSaveProfile = useCallback(async () => {
    if (!user) return;
    setIsSavingProfile(true);
    triggerHaptic();
    try {
      await setDoc(
        doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'main'),
        profile
      );
    } catch (error) {
      console.error(error);
    } finally {
      setIsSavingProfile(false);
    }
  }, [user, profile]);

  const handleUpdateGoal = useCallback(
    async (newGoal: number) => {
      if (!user) return;
      const updatedProfile = { ...profile, dailyGoalMinutes: newGoal };
      setProfile(updatedProfile);
      try {
        await setDoc(
          doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'main'),
          updatedProfile
        );
      } catch (error) {
        console.error(error);
      }
    },
    [user, profile]
  );

  const handleInstallClick = useCallback(async () => {
    if (!installPrompt) return;
    triggerHaptic();
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  }, [installPrompt]);

  // --- Context Value ---
  const value = useMemo<AppContextValue>(
    () => ({
      user,
      loading,
      authError,
      handleGoogleLogin,
      handleLogout,
      sessions,
      handleAddSession,
      handleDeleteSession,
      profile,
      setProfile,
      handleSaveProfile,
      isSavingProfile,
      handleUpdateGoal,
      isDarkMode,
      setIsDarkMode,
      view,
      setView,
      handleViewChange,
      timeRange,
      setTimeRange,
      sortOrder,
      setSortOrder,
      installPrompt,
      handleInstallClick,
      timerMode,
      setTimerMode,
      timerSeconds,
      setTimerSeconds,
      timerIsActive,
      setTimerIsActive,
      countdownInitialMinutes,
      setCountdownInitialMinutes,
      isSubmitting,
      setIsSubmitting,
    }),
    [
      user,
      loading,
      authError,
      handleGoogleLogin,
      handleLogout,
      sessions,
      handleAddSession,
      handleDeleteSession,
      profile,
      handleSaveProfile,
      isSavingProfile,
      handleUpdateGoal,
      isDarkMode,
      view,
      handleViewChange,
      timeRange,
      sortOrder,
      installPrompt,
      handleInstallClick,
      timerMode,
      timerSeconds,
      timerIsActive,
      countdownInitialMinutes,
      isSubmitting,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
