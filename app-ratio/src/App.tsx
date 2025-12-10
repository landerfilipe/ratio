import React, { useState, useEffect, useMemo, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously, // Removido signInWithCustomToken pois não é usado localmente
  onAuthStateChanged,
  signOut,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  doc,
  deleteDoc,
  setDoc,
  getDoc,
} from 'firebase/firestore';
import {
  Clock,
  Trash2,
  TrendingUp,
  Plus,
  LogOut,
  BarChart3,
  ChartColumnBig,
  History,
  CheckCircle2,
  CalendarIcon,
  PieChart as PieChartIcon,
  Clipboard,
  ArrowDown,
  ArrowUp,
  Search,
  AlertCircle,
  Home,
  Activity,
  LineChart as LineChartIcon,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
  MapPin,
  Camera,
  Save,
  Hexagon,
  Trophy,
  Moon,
  Sun,
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  ArrowRight,
  Edit2,
  X,
  Check,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minimize2,
  Hourglass,
  Download,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  ComposedChart,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';

// --- Lista Fixa de Disciplinas ---
const FIXED_SUBJECTS = [
  'Administração Financeira Orçamentária (AFO)',
  'Administração Geral',
  'Administração Pública',
  'Administração de Materiais',
  'Análise Técnica',
  'Arquivologia',
  'Artes',
  'Astronomia',
  'Atualidades',
  'Auditoria',
  'Biografia',
  'Biologia',
  'Bíblia',
  'Cibersegurança',
  'Ciência de Dados',
  'Ciências Sociais',
  'Conhecimentos Bancários',
  'Conhecimentos Gerais',
  'Contabilidade Geral',
  'Contabilidade Pública',
  'Criminologia',
  'Direito Administrativo',
  'Direito Ambiental',
  'Direito Civil',
  'Direito Constitucional',
  'Direito Digital',
  'Direito Econômico',
  'Direito Educacional',
  'Direito Eleitoral',
  'Direito Empresarial',
  'Direito Financeiro',
  'Direito Internacional',
  'Direito Penal',
  'Direito Previdenciário',
  'Direito Processual Civil',
  'Direito Processual Penal',
  'Direito Processual do Trabalho',
  'Direito Tributário',
  'Direito da Criança e do Adolescente',
  'Direito do Consumidor',
  'Direito do Trabalho',
  'Direitos Humanos',
  'Economia',
  'Educação Física',
  'Engenharia de Software',
  'Espanhol',
  'Estatística',
  'Farmácia',
  'Filosofia',
  'Finanças',
  'Física',
  'Francês',
  'Geografia',
  'Geopolítica',
  'Gestão de Pessoas',
  'Gestão de Projetos',
  'Grego',
  'Hebraico',
  'História',
  'Informática',
  'Inglês',
  'Inteligência Artificial',
  'Investimentos',
  'Japonês',
  'Latim',
  'Legislação Especial',
  'Legislação Tributária',
  'Legislação de Trânsito',
  'Libras',
  'Licitações e Contratos',
  'Literatura',
  'Lógica',
  'Marketing',
  'Matemática',
  'Matemática Financeira',
  'Medicina',
  'Medicina Legal',
  'Nutrição',
  'Oratória',
  'Português',
  'Produtividade',
  'Programação',
  'Psicologia',
  'Química',
  'Redação',
  'Russo',
  'Sociologia',
  'Teologia',
  'Vendas e Negociação',
  'Xadrez',
  'Ética',
].sort();

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: 'AIzaSyBnlxuas5xmymrPxfhpazArQ0HbtpmGfgM',
  authDomain: 'ratio-5bfb8.firebaseapp.com',
  projectId: 'ratio-5bfb8',
  storageBucket: 'ratio-5bfb8.firebasestorage.app',
  messagingSenderId: '898252667000',
  appId: '1:898252667000:web:52285afd441aae47b0d58d',
  measurementId: 'G-2WCW0LX4T6',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'ratio-5bfb8';

// --- Types & Interfaces ---
interface StudySession {
  id: string;
  subject: string;
  durationMinutes: number;
  date: string;
  timestamp: number;
}

interface UserProfile {
  name: string;
  surname: string;
  birthdate: string;
  location: string;
  bio: string;
  photoUrl: string;
  dailyGoalMinutes?: number;
}

type TimeRange =
  | 'day'
  | '7_days'
  | '14_days'
  | '30_days'
  | '90_days'
  | '180_days'
  | '360_days';
type SortOrder = 'desc' | 'asc';
type ViewState =
  | 'home'
  | 'statistics'
  | 'calendar'
  | 'history'
  | 'profile'
  | 'timer';
type TimerMode = 'stopwatch' | 'countdown';

// --- Helpers de Formatação ---

const formatDurationDetailed = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}min`;
  const mString = m.toString().padStart(2, '0');
  return `${h}h${mString}min`;
};

const formatDurationShort = (mins: number) => {
  const h = Math.round(mins / 60);
  return `${h}h`;
};

const formatGoalDuration = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (m === 0) return `${h}h`;
  return `${h}h${m}m`;
};

const formatAxisTick = (mins: number) => {
  const h = Math.round(mins / 60);
  return `${h}h`;
};

// Separates time into { main: "HH:MM", super: "SS" }
const formatTimeComponents = (seconds: number) => {
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

const SkeletonCard = ({ isDarkMode }: { isDarkMode: boolean }) => (
  <div
    className={`p-6 rounded-2xl border shadow-sm animate-pulse ${
      isDarkMode
        ? 'bg-neutral-900 border-neutral-800'
        : 'bg-white border-slate-200'
    }`}
  >
    <div
      className={`h-4 w-24 mb-4 rounded ${
        isDarkMode ? 'bg-neutral-800' : 'bg-slate-100'
      }`}
    ></div>
    <div
      className={`h-8 w-16 rounded ${
        isDarkMode ? 'bg-neutral-800' : 'bg-slate-100'
      }`}
    ></div>
  </div>
);

const triggerHaptic = () => {
  if (typeof navigator !== 'undefined' && navigator.vibrate)
    navigator.vibrate(10);
};

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [authError, setAuthError] = useState<string | null>(null);

  const [subjectInput, setSubjectInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [duration, setDuration] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

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
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState('180');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [view, setView] = useState<ViewState>('home');
  const [chartType, setChartType] = useState<'pie' | 'radar' | 'bar'>('pie');

  const [timeRange, setTimeRange] = useState<TimeRange>('day');
  const [lineChartRange, setLineChartRange] = useState<TimeRange>('30_days');
  const [dailyRhythmRange, setDailyRhythmRange] =
    useState<TimeRange>('30_days');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const [heatmapYear, setHeatmapYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(new Date());

  // Confirm delete state
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<
    string | null
  >(null);

  // PWA Install State
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  // Timer State with Persistence
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

  const [timerIsActive, setTimerIsActive] = useState(false); // Always paused on load

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const localDate = new Date(now.getTime() - offset * 60 * 1000);
    setSelectedDate(localDate.toISOString().slice(0, 16));
  }, []);

  // PWA Install Listener
  useEffect(() => {
    const handler = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setInstallPrompt(e);
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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [wrapperRef]);

  // Timer Interval Logic
  useEffect(() => {
    let interval: any = null;
    if (timerIsActive) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (timerMode === 'countdown') {
            if (prev <= 0) {
              setTimerIsActive(false);
              triggerHaptic();
              // Optional: Play sound
              return 0;
            }
            return prev - 1;
          } else {
            return prev + 1;
          }
        });
      }, 1000);
    } else if (!timerIsActive && timerSeconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerIsActive, timerSeconds, timerMode]);

  // CORREÇÃO DA AUTENTICAÇÃO
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        setLoading(false);
        setAuthError(null);
      } else {
        // Se não houver usuário, tentar login anônimo
        // Isso falhará se "Anonymous" não estiver ativado no Console do Firebase
        signInAnonymously(auth).catch((error) => {
          console.error('Erro no login anônimo:', error);
          setLoading(false);
          if (
            error.code === 'auth/configuration-not-found' ||
            error.code === 'auth/operation-not-allowed'
          ) {
            setAuthError(
              "Erro: Ative a autenticação 'Anônima' no Console do Firebase."
            );
          } else {
            setAuthError('Erro ao conectar com o servidor.');
          }
        });
      }
    });
    return () => unsubscribe();
  }, []);

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

    // Updated with validation to prevent crashes from invalid dates
    const unsubscribe = onSnapshot(
      sessionsRef,
      (snapshot) => {
        const loaded: StudySession[] = [];
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          // Validation: Check if date exists and is valid
          const dateStr = data.date;
          if (dateStr && !isNaN(new Date(dateStr).getTime())) {
            loaded.push({
              id: doc.id,
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
          if (data.dailyGoalMinutes)
            setTempGoal(data.dailyGoalMinutes.toString());
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

  const normalizeString = (str: string) =>
    str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[.,]/g, '')
      .toLowerCase()
      .trim();

  const filteredSuggestions = useMemo(() => {
    const cleanInput = normalizeString(subjectInput);
    if (!cleanInput) return [];
    const startsWith = FIXED_SUBJECTS.filter((s) =>
      normalizeString(s).startsWith(cleanInput)
    );
    const contains = FIXED_SUBJECTS.filter(
      (s) =>
        normalizeString(s).includes(cleanInput) &&
        !normalizeString(s).startsWith(cleanInput)
    );
    return [...startsWith, ...contains];
  }, [subjectInput]);

  const handleGoogleLogin = async () => {
    triggerHaptic();
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    triggerHaptic();
    signOut(auth);
    setSessions([]);
  };

  // PWA Install Handler
  const handleInstallClick = async () => {
    if (!installPrompt) return;
    triggerHaptic();
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!user || !subjectInput || !duration || !selectedDate) return;

    // Future Date Validation
    const selectedTime = new Date(selectedDate).getTime();
    const now = new Date().getTime();
    if (selectedTime > now) {
      setFormError('Não é possível lançar estudos em datas futuras.');
      return;
    }

    const cleanInput = normalizeString(subjectInput);
    const exactMatch = FIXED_SUBJECTS.find(
      (s) => normalizeString(s) === cleanInput
    );
    if (!exactMatch) {
      setFormError('Disciplina não encontrada.');
      return;
    }

    setIsSubmitting(true);
    triggerHaptic();

    try {
      const d = new Date(selectedDate);
      await addDoc(
        collection(db, 'artifacts', appId, 'users', user.uid, 'study_sessions'),
        {
          subject: exactMatch,
          durationMinutes: parseInt(duration),
          date: d.toISOString(),
          timestamp: d.getTime(),
        }
      );
      setSubjectInput('');
      setDuration('');
      setShowSuggestions(false);
      if (typeof navigator !== 'undefined' && navigator.vibrate)
        navigator.vibrate([30, 50, 30]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveTimerSession = async () => {
    setFormError(null);
    if (!user) return;

    const cleanInput = normalizeString(subjectInput);
    const exactMatch = FIXED_SUBJECTS.find(
      (s) => normalizeString(s) === cleanInput
    );

    if (!exactMatch) {
      setFormError('Selecione uma disciplina válida.');
      return;
    }

    // Calculate elapsed minutes
    let minutesToSave = 0;
    if (timerMode === 'stopwatch') {
      minutesToSave = Math.round(timerSeconds / 60);
    } else {
      // For countdown, save the duration that passed (Initial - Current)
      const elapsed = countdownInitialMinutes * 60 - timerSeconds;
      minutesToSave = Math.round(elapsed / 60);
    }

    if (minutesToSave <= 0) {
      setFormError('Tempo insuficiente.');
      return;
    }

    setIsSubmitting(true);
    triggerHaptic();

    try {
      const d = new Date();
      await addDoc(
        collection(db, 'artifacts', appId, 'users', user.uid, 'study_sessions'),
        {
          subject: exactMatch,
          durationMinutes: minutesToSave,
          date: d.toISOString(),
          timestamp: d.getTime(),
        }
      );

      // Reset Timer State
      setTimerSeconds(0);
      setTimerIsActive(false);
      setSubjectInput('');
      setDuration(''); // Clear duration input as well
      setShowSuggestions(false);
      setView('home'); // Go back to home
      if (typeof navigator !== 'undefined' && navigator.vibrate)
        navigator.vibrate([30, 50, 30]);
    } catch (e) {
      console.error(e);
      setFormError('Erro ao salvar sessão.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSession = async (id: string) => {
    if (user) {
      triggerHaptic();
      await deleteDoc(
        doc(db, 'artifacts', appId, 'users', user.uid, 'study_sessions', id)
      );
      setDeleteConfirmationId(null);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
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
  };

  const handleUpdateGoal = async () => {
    if (!user) return;
    const newGoal = parseInt(tempGoal) || 180;
    const updatedProfile = { ...profile, dailyGoalMinutes: newGoal };
    setProfile(updatedProfile);
    setIsEditingGoal(false);
    try {
      await setDoc(
        doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'main'),
        updatedProfile
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleViewChange = (newView: ViewState) => {
    if (view !== newView) {
      triggerHaptic();
      setView(newView);
    }
  };

  const handleTimerExit = () => {
    // FORCE RESET AND CLOSE - No confirmation
    setTimerIsActive(false);
    if (timerMode === 'countdown') {
      setTimerSeconds(countdownInitialMinutes * 60);
    } else {
      setTimerSeconds(0);
    }
    setView('home');
    triggerHaptic();
  };

  const handleTimerStart = () => {
    if (!timerIsActive) {
      if (timerMode === 'countdown' && timerSeconds === 0) {
        setTimerSeconds(countdownInitialMinutes * 60);
      }
      setTimerIsActive(true);
      triggerHaptic();
    } else {
      setTimerIsActive(false);
      triggerHaptic();
    }
  };

  const handleTimerReset = () => {
    setTimerIsActive(false);
    if (timerMode === 'countdown') {
      setTimerSeconds(countdownInitialMinutes * 60);
    } else {
      setTimerSeconds(0);
    }
    triggerHaptic();
  };

  const handleModeToggle = (mode: TimerMode) => {
    setTimerMode(mode);
    setTimerIsActive(false);
    if (mode === 'countdown') {
      setTimerSeconds(countdownInitialMinutes * 60);
    } else {
      setTimerSeconds(0);
    }
    triggerHaptic();
  };

  // --- Statistics Logic ---
  const stats = useMemo(() => {
    const getDaysInMonth = (year: number, month: number) =>
      new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) =>
      new Date(year, month, 1).getDay();

    const totalMinutes = sessions.reduce(
      (acc, curr) => acc + curr.durationMinutes,
      0
    );
    const uniqueDays = new Set(
      sessions.map((s) => new Date(s.date).toDateString())
    ).size;
    const avgMinutesPerDay =
      uniqueDays > 0 ? Math.round(totalMinutes / uniqueDays) : 0;

    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const todayMinutes = sessions
      .filter((s) => new Date(s.date).toDateString() === now.toDateString())
      .reduce((acc, curr) => acc + curr.durationMinutes, 0);

    const getDaysFromRange = (range: TimeRange) => {
      if (range === 'day') return 1;
      return parseInt(range.split('_')[0]);
    };

    const filteredSessions = sessions.filter((s) => {
      const sDate = new Date(s.date);
      const sDateStart = new Date(
        sDate.getFullYear(),
        sDate.getMonth(),
        sDate.getDate()
      );
      const diffTime = Math.abs(todayStart.getTime() - sDateStart.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (timeRange === 'day')
        return sDate.toDateString() === now.toDateString();
      const days = getDaysFromRange(timeRange);
      return diffDays <= days;
    });
    const rangeMinutes = filteredSessions.reduce(
      (acc, curr) => acc + curr.durationMinutes,
      0
    );

    const bySubject: Record<string, number> = {};
    sessions.forEach(
      (s) =>
        (bySubject[s.subject] = (bySubject[s.subject] || 0) + s.durationMinutes)
    );
    let rawData = Object.entries(bySubject).map(([name, value]) => ({
      name,
      value,
      percentage:
        totalMinutes > 0 ? Math.round((value / totalMinutes) * 100) : 0,
      hours: formatDurationDetailed(value),
    }));

    if (sortOrder === 'desc') rawData.sort((a, b) => b.value - a.value);
    else rawData.sort((a, b) => a.value - b.value);

    // Chart Aggregation (15 + 1)
    const chartSortedData = [...rawData].sort((a, b) => b.value - a.value);
    let aggregatedData = [...chartSortedData];
    if (chartSortedData.length > 16) {
      const top15 = chartSortedData.slice(0, 15);
      const others = chartSortedData.slice(15);
      const othersValue = others.reduce((acc, curr) => acc + curr.value, 0);
      const othersPercentage =
        totalMinutes > 0 ? Math.round((othersValue / totalMinutes) * 100) : 0;
      aggregatedData = [
        ...top15,
        {
          name: 'Outras Matérias',
          value: othersValue,
          percentage: othersPercentage,
          hours: formatDurationDetailed(othersValue),
        },
      ];
    }

    const pieAllData = aggregatedData;
    const radarData = aggregatedData;
    const barChartData = aggregatedData;
    const pieLegendData = aggregatedData;

    const REFERENCE_MINUTES_PER_DAY = profile.dailyGoalMinutes || 180;

    // Line Chart
    const lineChartData: {
      date: string;
      accumulated: number;
      reference: number;
    }[] = [];
    const lineDaysLimit = getDaysFromRange(lineChartRange);
    const lineMap = new Map<string, number>();
    const lineStartDate = new Date(todayStart);
    lineStartDate.setDate(lineStartDate.getDate() - (lineDaysLimit - 1));
    for (let i = 0; i < lineDaysLimit; i++) {
      const d = new Date(lineStartDate);
      d.setDate(d.getDate() + i);
      lineMap.set(d.toISOString().split('T')[0], 0);
    }
    sessions.forEach((s) => {
      const sDateStr = s.date.split('T')[0];
      if (lineMap.has(sDateStr))
        lineMap.set(sDateStr, (lineMap.get(sDateStr) || 0) + s.durationMinutes);
    });
    let runningTotal = 0;
    Array.from(lineMap.entries())
      .sort()
      .forEach(([isoDate, mins], index) => {
        runningTotal += mins;
        const d = new Date(isoDate);
        const adjustedDate = new Date(
          d.getTime() + d.getTimezoneOffset() * 60000
        );
        lineChartData.push({
          date: adjustedDate.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
          }),
          accumulated: runningTotal,
          reference: (index + 1) * REFERENCE_MINUTES_PER_DAY,
        });
      });

    // --- Heatmap Data (Specific Year) ---
    // Fix: Use local date string components for keys to avoid UTC shift
    const heatmapData: {
      date: string;
      count: number;
      level: number;
      isGoalMet: boolean;
    }[] = [];
    const sessionMap = new Map<string, number>();
    sessions.forEach((s) => {
      const dateObj = new Date(s.date);
      const y = dateObj.getFullYear();
      const m = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      const d = `${y}-${m}-${day}`;
      sessionMap.set(d, (sessionMap.get(d) || 0) + s.durationMinutes);
    });

    const startOfYear = new Date(heatmapYear, 0, 1);
    const endOfYear = new Date(heatmapYear, 11, 31);

    for (
      let d = new Date(startOfYear);
      d <= endOfYear;
      d.setDate(d.getDate() + 1)
    ) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const mins = sessionMap.get(dateStr) || 0;
      let level = 0;
      if (mins > 0) level = 1;
      if (mins >= REFERENCE_MINUTES_PER_DAY * 0.33) level = 2;
      if (mins >= REFERENCE_MINUTES_PER_DAY * 0.66) level = 3;
      if (mins >= REFERENCE_MINUTES_PER_DAY) level = 4;
      heatmapData.push({
        date: dateStr,
        count: mins,
        level,
        isGoalMet: mins >= REFERENCE_MINUTES_PER_DAY,
      });
    }

    // Daily Rhythm
    const dailyRhythmData: { date: string; minutes: number; ma: number }[] = [];
    const rhythmDays = getDaysFromRange(dailyRhythmRange);
    const rhythmMap = new Map<string, number>();
    const maWindow = 7;
    const rhythmStart = new Date(todayStart);
    rhythmStart.setDate(rhythmStart.getDate() - (rhythmDays + maWindow));
    for (let i = 0; i < rhythmDays + maWindow + 1; i++) {
      const d = new Date(rhythmStart);
      d.setDate(d.getDate() + i);
      rhythmMap.set(d.toISOString().split('T')[0], 0);
    }
    sessions.forEach((s) => {
      const sDateStr = s.date.split('T')[0];
      if (rhythmMap.has(sDateStr))
        rhythmMap.set(
          sDateStr,
          (rhythmMap.get(sDateStr) || 0) + s.durationMinutes
        );
    });
    const rhythmArray = Array.from(rhythmMap.entries()).sort();
    const displayStartIndex = maWindow;
    let rhythmTotalMinutes = 0;
    let rhythmCount = 0;

    for (let i = displayStartIndex; i < rhythmArray.length; i++) {
      const [isoDate, mins] = rhythmArray[i];
      rhythmTotalMinutes += mins;
      rhythmCount++;
      let sum = 0;
      for (let j = 0; j < maWindow; j++) sum += rhythmArray[i - j][1];
      const ma = Math.round(sum / maWindow);
      const d = new Date(isoDate);
      const adjustedDate = new Date(
        d.getTime() + d.getTimezoneOffset() * 60000
      );
      dailyRhythmData.push({
        date: adjustedDate.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
        }),
        minutes: mins,
        ma: ma,
      });
    }
    const rhythmAverage =
      rhythmCount > 0 ? rhythmTotalMinutes / rhythmCount : 0;
    // Difference from Goal (180)
    const rhythmDeviationPercent =
      REFERENCE_MINUTES_PER_DAY > 0
        ? Math.round(
            ((rhythmAverage - REFERENCE_MINUTES_PER_DAY) /
              REFERENCE_MINUTES_PER_DAY) *
              100
          )
        : 0;

    // Week Data - Removed as per instruction to replace with Comparison
    // const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']; ...

    // Comparison Logic (Generic)
    const calcMinutesInPeriod = (start: Date, end: Date) => {
      const s = start.getTime();
      const e = end.getTime() + 24 * 60 * 60 * 1000;
      return sessions
        .filter((sess) => {
          const t = new Date(sess.date).getTime();
          return t >= s && t < e;
        })
        .reduce((acc, curr) => acc + curr.durationMinutes, 0);
    };

    // Calculate Evolution Report (7, 14, 30, 90, 180, 360)
    const evolutionPeriods = [7, 14, 30, 90, 180, 360];
    const evolutionReport = evolutionPeriods.map((days) => {
      const endCurrent = new Date(todayStart);
      const startCurrent = new Date(todayStart);
      startCurrent.setDate(startCurrent.getDate() - days + 1);

      const endPrev = new Date(startCurrent);
      endPrev.setDate(endPrev.getDate() - 1);
      const startPrev = new Date(endPrev);
      startPrev.setDate(startPrev.getDate() - days + 1);

      const currentMins = calcMinutesInPeriod(startCurrent, endCurrent);
      const prevMins = calcMinutesInPeriod(startPrev, endPrev);

      let percent: number | null = null;
      if (prevMins > 0) {
        percent = Math.round(((currentMins - prevMins) / prevMins) * 100);
      }

      return {
        days,
        label: `${days}d`,
        current: formatDurationDetailed(currentMins),
        prev: formatDurationDetailed(prevMins),
        currentRaw: currentMins,
        prevRaw: prevMins,
        percent,
        trend: percent !== null ? (percent >= 0 ? 'up' : 'down') : 'neutral',
      };
    });

    let currentGoalMinutes = REFERENCE_MINUTES_PER_DAY;
    const daysSelected = getDaysFromRange(timeRange);
    currentGoalMinutes = REFERENCE_MINUTES_PER_DAY * daysSelected;

    // Main header comparison
    const compDays = timeRange === 'day' ? 1 : getDaysFromRange(timeRange);
    const rangeEnd = new Date(todayStart);
    const rangeStart = new Date(todayStart);
    if (timeRange !== 'day')
      rangeStart.setDate(rangeStart.getDate() - compDays + 1);

    const prevRangeEnd = new Date(rangeStart);
    prevRangeEnd.setDate(prevRangeEnd.getDate() - 1);
    const prevRangeStart = new Date(prevRangeEnd);
    if (timeRange !== 'day')
      prevRangeStart.setDate(prevRangeStart.getDate() - compDays + 1);

    const currentPeriodMinutes = calcMinutesInPeriod(rangeStart, rangeEnd);
    const prevPeriodMinutes = calcMinutesInPeriod(prevRangeStart, prevRangeEnd);
    let growthPercent = 0;
    if (prevPeriodMinutes > 0)
      growthPercent = Math.round(
        ((currentPeriodMinutes - prevPeriodMinutes) / prevPeriodMinutes) * 100
      );
    else if (currentPeriodMinutes > 0) growthPercent = 100;

    const goalPercentage =
      currentGoalMinutes > 0
        ? Math.round((rangeMinutes / currentGoalMinutes) * 100)
        : 0;

    // Deviation Logic for Goal Bar (Symbols and Arrows)
    const goalDeviation =
      currentGoalMinutes > 0
        ? Math.round(
            ((rangeMinutes - currentGoalMinutes) / currentGoalMinutes) * 100
          )
        : 0;

    // Deviation for Accumulated Line Chart
    const totalReference =
      getDaysFromRange(lineChartRange) * REFERENCE_MINUTES_PER_DAY;
    const accumulatedTotalMins =
      lineChartData.length > 0
        ? lineChartData[lineChartData.length - 1].accumulated
        : 0;
    const accumulatedDeviationPercent =
      totalReference > 0
        ? Math.round(
            ((accumulatedTotalMins - totalReference) / totalReference) * 100
          )
        : 0;

    // Data for the NEW Comparative Bar Chart (replacing day of week)
    // Structure: [ {name: '7d', prev: X, current: Y}, ... ]
    const comparativeData = evolutionReport.map((item) => ({
      name: item.label,
      Atual: item.currentRaw,
      Anterior: item.prevRaw,
    }));
    // Removed filter to show axes even without data

    return {
      totalMinutes,
      avgMinutesPerDay,
      rangeMinutes,
      listData: rawData,
      todayMinutes,
      pieAllData,
      pieLegendData,
      barChartData,
      radarData,
      heatmapData,
      lineChartData,
      comparativeData,
      dailyRhythmData,
      currentPeriodMinutes,
      growthPercent,
      sessionMap,
      getDaysInMonth,
      getFirstDayOfMonth,
      currentGoalMinutes,
      filteredCount: filteredSessions.length,
      evolutionReport,
      goalPercentage,
      goalDeviation,
      rhythmDeviationPercent,
      accumulatedDeviationPercent,
    };
  }, [
    sessions,
    timeRange,
    lineChartRange,
    dailyRhythmRange,
    sortOrder,
    heatmapYear,
    profile.dailyGoalMinutes,
  ]);

  // --- Theme Colors (GOLD / DARK) ---
  const THEME = {
    bg: isDarkMode ? 'bg-neutral-950' : 'bg-slate-50',
    // Added transition classes to cards for smoother theme switch
    card:
      (isDarkMode
        ? 'bg-neutral-900 border-neutral-800'
        : 'bg-white border-slate-200') + ' transition-colors duration-200',
    text: isDarkMode ? 'text-white' : 'text-slate-800',
    textMuted: isDarkMode ? 'text-neutral-400' : 'text-slate-500',
    // Added transition classes to inputs
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
  };

  // GRADIENT CUSTOMIZADO (DISCRETO) - Uniformizado com os botões
  const TEXT_GRADIENT =
    'bg-gradient-to-br from-[#FDE047] to-[#EAB308] bg-clip-text text-transparent';
  const ICON_GRADIENT_STYLE = { stroke: 'url(#gold-gradient)' };

  const COLORS = [
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
  const HEATMAP_COLORS = isDarkMode
    ? ['#262626', '#423606', '#715d0b', '#a1860f', '#EAB308']
    : ['#f3f4f6', '#fef9c3', '#fde047', '#eab308', '#ca8a04'];

  const getRangeLabel = (range: TimeRange) => {
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

  const CustomYAxisTick = ({ x, y, payload }: any) => {
    const text = payload.value;
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];
    for (let i = 1; i < words.length; i++) {
      if (currentLine.length + words[i].length < 18) {
        currentLine += ' ' + words[i];
      } else {
        lines.push(currentLine);
        currentLine = words[i];
      }
    }
    lines.push(currentLine);
    return (
      <g transform={`translate(${x},${y})`}>
        {lines.map((line, index) => (
          <text
            key={index}
            x={-5}
            y={index * 10 - (lines.length - 1) * 5}
            dy={3}
            textAnchor='end'
            fill={isDarkMode ? '#a3a3a3' : '#64748b'}
            fontSize={10}
          >
            {line}
          </text>
        ))}
      </g>
    );
  };

  const CustomRadarTick = ({
    payload,
    x,
    y,
    textAnchor,
    stroke,
    radius,
  }: any) => {
    const text = payload.value;
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];
    for (let i = 1; i < words.length; i++) {
      if (currentLine.length + words[i].length < 15) {
        currentLine += ' ' + words[i];
      } else {
        lines.push(currentLine);
        currentLine = words[i];
      }
    }
    lines.push(currentLine);

    return (
      <g transform={`translate(${x},${y})`}>
        {lines.map((line, index) => (
          <text
            key={index}
            x={0}
            y={index * 10}
            dy={0}
            textAnchor={textAnchor}
            fill={isDarkMode ? '#e5e5e5' : '#334155'}
            fontSize={9}
            fontWeight={500}
          >
            {line}
          </text>
        ))}
      </g>
    );
  };

  const renderPieLegend = () => (
    <ul
      className={`flex flex-wrap justify-center gap-2 mt-4 text-xs ${THEME.textMuted}`}
    >
      {stats.pieLegendData.map((entry, index) => (
        <li key={index} className='flex items-center gap-1'>
          <span
            className='w-3 h-3 rounded-sm'
            style={{
              backgroundColor:
                entry.name === 'Outras Matérias'
                  ? '#525252'
                  : COLORS[index % COLORS.length],
            }}
          ></span>
          <span className='truncate max-w-[100px]'>{entry.name}</span>
        </li>
      ))}
    </ul>
  );

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = stats.getDaysInMonth(year, month);
    const startDay = stats.getFirstDayOfMonth(year, month);
    const days = [];
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className='h-10 sm:h-12 w-full'></div>);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      // Fix: Construct date string manually to avoid timezone shift issue
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(
        d
      ).padStart(2, '0')}`;
      const mins = stats.sessionMap.get(dateStr) || 0;
      const hasData = mins > 0;
      const dailyGoal = profile.dailyGoalMinutes || 180;
      const isGoalMet = mins >= dailyGoal;

      const isSelected =
        selectedCalendarDate.toDateString() ===
        new Date(year, month, d).toDateString();
      const isToday =
        new Date().toDateString() === new Date(year, month, d).toDateString();

      // Determine dot color based on goal status (Light/Dark Yellow)
      let dotColor = 'bg-[#EAB308]';
      if (hasData) {
        // #FDE047 is lighter yellow (met), #CA8A04 is darker yellow (not met) - Adjusted for contrast
        dotColor = isGoalMet ? 'bg-[#FDE047]' : 'bg-[#CA8A04]';
      }

      days.push(
        <button
          key={d}
          onClick={() => {
            setSelectedCalendarDate(new Date(year, month, d));
            triggerHaptic();
          }}
          className={`h-10 sm:h-12 w-full flex flex-col items-center justify-center relative rounded-lg transition-all active:scale-95 duration-200
            ${
              isSelected
                ? 'bg-gradient-to-br from-[#FDE047] to-[#EAB308] text-black shadow-md font-bold'
                : `hover:bg-neutral-800 ${
                    isDarkMode
                      ? 'text-neutral-300'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`
            } 
            ${
              isToday && !isSelected
                ? `border border-[#EAB308] ${THEME.accentText}`
                : ''
            }`}
        >
          <span className='text-sm font-semibold'>{d}</span>
          {hasData && (
            <span
              className={`w-1.5 h-1.5 rounded-full mt-1 ${
                isSelected ? 'bg-black' : dotColor
              }`}
            ></span>
          )}
        </button>
      );
    }
    return days;
  };

  const selectedDaySessions = sessions.filter(
    (s) =>
      new Date(s.date).toDateString() === selectedCalendarDate.toDateString()
  );
  const selectedDayTotal = selectedDaySessions.reduce(
    (acc, curr) => acc + curr.durationMinutes,
    0
  );
  const dailyGoal = profile.dailyGoalMinutes || 180;
  const selectedDayPercentage =
    dailyGoal > 0 ? Math.round((selectedDayTotal / dailyGoal) * 100) : 0;

  if (!user && !loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center p-4 antialiased ${
          isDarkMode ? 'bg-neutral-950' : 'bg-slate-50'
        }`}
        style={{ fontFamily: "'Urbanist', sans-serif" }}
      >
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@300;400;500;600;700;800;900&display=swap');`}</style>
        {/* SVG Definition for Login Screen */}
        <svg width='0' height='0' className='absolute block'>
          <defs>
            <linearGradient
              id='gold-gradient'
              x1='0%'
              y1='0%'
              x2='100%'
              y2='100%'
            >
              <stop offset='0%' stopColor='#FDE047' />
              <stop offset='100%' stopColor='#EAB308' />
            </linearGradient>
          </defs>
        </svg>
        <div
          className={`${
            isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white'
          } rounded-2xl shadow-xl p-8 max-w-md w-full text-center border`}
        >
          <Activity
            className='h-12 w-12 mx-auto mb-4 animate-pulse'
            style={ICON_GRADIENT_STYLE}
          />
          <h1
            className={`text-4xl font-extrabold ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            } mb-1`}
          >
            Ratio
          </h1>
          <p className='text-xs uppercase tracking-widest text-[#EAB308] font-bold mb-8'>
            Evolução Calculada
          </p>
          <button
            onClick={handleGoogleLogin}
            className={`w-full py-4 px-4 rounded-xl flex items-center justify-center gap-3 transition-transform active:scale-95 shadow-lg ${
              isDarkMode
                ? 'bg-white hover:bg-neutral-200'
                : 'bg-white border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <svg className='w-6 h-6' viewBox='0 0 24 24'>
              <path
                d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                fill='#4285F4'
              />
              <path
                d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                fill='#34A853'
              />
              <path
                d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                fill='#FBBC05'
              />
              <path
                d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                fill='#EA4335'
              />
            </svg>
          </button>

          {authError && (
            <div className='mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-xs font-bold flex items-center gap-2'>
              <AlertCircle className='h-4 w-4 shrink-0' /> {authError}
            </div>
          )}
        </div>
      </div>
    );
  }

  const isZenMode = view === 'timer';

  return (
    <div
      className={`min-h-screen ${THEME.bg} ${THEME.text} font-sans pb-24 antialiased selection:bg-[#EAB308] selection:text-black transition-colors duration-200 ease-in-out`}
      style={{ fontFamily: "'Urbanist', sans-serif" }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@300;400;500;600;700;800;900&display=swap');`}</style>

      {/* SVG Definição do Degradê para Ícones - Uniformizado com os botões (Amarelo Claro -> Ouro) */}
      <svg width='0' height='0' className='absolute block'>
        <defs>
          <linearGradient
            id='gold-gradient'
            x1='0%'
            y1='0%'
            x2='100%'
            y2='100%'
          >
            <stop offset='0%' stopColor='#FDE047' />
            <stop offset='100%' stopColor='#EAB308' />
          </linearGradient>
        </defs>
      </svg>

      {/* Header - HIDDEN IN ZEN MODE */}
      {!isZenMode && (
        <header
          className={`${
            isDarkMode
              ? 'bg-neutral-950/95 border-b border-neutral-800'
              : 'bg-white/95 border-b border-slate-200'
          } backdrop-blur-sm p-4 sticky top-0 z-20 transition-colors duration-200 ease-in-out`}
        >
          <div className='max-w-4xl mx-auto flex justify-between items-center'>
            <div className='flex items-center gap-3'>
              <Activity
                className='h-6 w-6 animate-in fade-in slide-in-from-left-1 duration-300'
                style={ICON_GRADIENT_STYLE}
              />
              <div>
                <h1 className='text-xl font-extrabold tracking-tight leading-none animate-in fade-in slide-in-from-left-1 delay-150 duration-300 fill-mode-backwards'>
                  Ratio
                </h1>
                <p
                  className={`text-[9px] uppercase font-bold tracking-wider animate-in fade-in slide-in-from-left-1 delay-300 duration-300 fill-mode-backwards ${TEXT_GRADIENT}`}
                >
                  Evolução Calculada
                </p>
              </div>
            </div>
            <div className='flex items-center gap-3 animate-in fade-in delay-500 duration-300 fill-mode-backwards'>
              <div
                onClick={() => handleViewChange('profile')}
                className={`w-8 h-8 rounded-full cursor-pointer shadow-sm active:scale-95 transition-transform mr-1 flex items-center justify-center ${
                  profile.photoUrl
                    ? 'bg-gradient-to-tr from-[#FDE047] to-[#B45309] p-[1.5px]'
                    : `bg-transparent border border-solid ${
                        isDarkMode ? 'border-neutral-700' : 'border-slate-300'
                      }`
                }`}
              >
                {profile.photoUrl ? (
                  <div
                    className={`w-full h-full rounded-full p-[1.5px] ${
                      isDarkMode ? 'bg-neutral-950' : 'bg-white'
                    }`}
                  >
                    <div className='w-full h-full rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-800'>
                      <img
                        src={profile.photoUrl}
                        alt='Perfil'
                        className='w-full h-full rounded-full object-cover'
                      />
                    </div>
                  </div>
                ) : (
                  <UserIcon
                    className={`w-4 h-4 ${
                      isDarkMode ? 'text-neutral-400' : 'text-neutral-600'
                    }`}
                  />
                )}
              </div>
              <button
                onClick={() => {
                  setIsDarkMode(!isDarkMode);
                  triggerHaptic();
                }}
                className={`p-2 rounded-full active:scale-90 transition-transform ${
                  isDarkMode
                    ? 'bg-neutral-800 hover:bg-neutral-700'
                    : 'bg-slate-100 hover:bg-slate-200'
                }`}
              >
                {isDarkMode ? (
                  <Sun className='h-4 w-4' />
                ) : (
                  <Moon className='h-4 w-4' />
                )}
              </button>
              <button
                onClick={handleLogout}
                className='text-xs bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-2 rounded-lg flex gap-1 items-center font-bold transition-all active:scale-95'
              >
                <LogOut className='h-3 w-3' />
              </button>
            </div>
          </div>
        </header>
      )}

      <main
        className={`max-w-4xl mx-auto p-4 space-y-6 ${
          isZenMode
            ? 'h-screen p-0 flex flex-col justify-center overflow-y-auto'
            : ''
        }`}
      >
        {/* === HOME VIEW === */}
        {view === 'home' && (
          <div className='space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 ease-out'>
            <div className='flex flex-col gap-4'>
              <div className='flex items-center gap-3'>
                <h2 className={`text-xl font-medium ${THEME.text}`}>
                  Olá,{' '}
                  <span className={`font-bold ${TEXT_GRADIENT}`}>
                    {profile.name ||
                      user?.displayName?.split(' ')[0] ||
                      'Estudante'}
                  </span>
                </h2>
              </div>
              <div
                className={`${
                  isDarkMode
                    ? 'bg-neutral-900 border-neutral-800'
                    : 'bg-white border-slate-200'
                } p-1 rounded-xl border shadow-sm flex text-sm w-full overflow-x-auto gap-1 hide-scrollbar`}
              >
                {(
                  [
                    'day',
                    '7_days',
                    '14_days',
                    '30_days',
                    '90_days',
                    '180_days',
                    '360_days',
                  ] as TimeRange[]
                ).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setTimeRange(r);
                      triggerHaptic();
                    }}
                    className={`px-3 py-2 rounded-lg whitespace-nowrap transition-all font-bold text-xs flex-shrink-0 ${
                      timeRange === r
                        ? 'bg-gradient-to-br from-[#FDE047] to-[#EAB308] text-black shadow-sm'
                        : `${THEME.textMuted} hover:opacity-80`
                    }`}
                  >
                    {r === 'day' ? 'Hoje' : r.replace('_days', 'd')}
                  </button>
                ))}
              </div>
            </div>

            {/* Progress Bar with Editable Goal (Goal Bar Logic SWAPPED: Now has deviation + arrows) */}
            <div className={`${THEME.card} p-4 rounded-2xl shadow-sm border`}>
              <div className='flex justify-between items-center mb-2'>
                <div className='flex items-center gap-2'>
                  <span
                    className={`text-xs font-bold ${THEME.textMuted} uppercase flex items-center gap-1`}
                  >
                    <Trophy className='h-3 w-3' style={ICON_GRADIENT_STYLE} />{' '}
                    META
                  </span>
                  {isEditingGoal ? (
                    <div className='flex items-center gap-1'>
                      <input
                        type='number'
                        value={tempGoal}
                        onChange={(e) => setTempGoal(e.target.value)}
                        className={`w-12 text-xs p-1 rounded ${
                          isDarkMode ? 'bg-neutral-800' : 'bg-slate-100'
                        } outline-none`}
                        autoFocus
                      />
                      <button
                        onClick={handleUpdateGoal}
                        className='text-green-500 hover:text-green-400'
                      >
                        <Check className='h-3 w-3' />
                      </button>
                      <button
                        onClick={() => setIsEditingGoal(false)}
                        className='text-red-500 hover:text-red-400'
                      >
                        <X className='h-3 w-3' />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setIsEditingGoal(true);
                        setTempGoal(
                          (profile.dailyGoalMinutes || 180).toString()
                        );
                      }}
                      className={`text-xs font-bold hover:underline flex items-center gap-1 ${THEME.textMuted}`}
                    >
                      ({formatGoalDuration(stats.currentGoalMinutes)}){' '}
                      <Edit2 className='h-2 w-2' />
                    </button>
                  )}
                </div>
                {/* Deviation for Goal Bar (Symbols + Arrows + Colors) */}
                <span
                  className={`text-xs font-bold animate-in fade-in slide-in-from-bottom-1 duration-300 flex items-center gap-1 ${
                    stats.goalDeviation >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {stats.goalDeviation > 0 ? '+' : ''}
                  {stats.goalDeviation}%
                  {stats.goalDeviation >= 0 ? (
                    <ArrowUp className='h-3 w-3' />
                  ) : (
                    <ArrowDown className='h-3 w-3' />
                  )}
                </span>
              </div>
              <div
                className={`w-full ${
                  isDarkMode ? 'bg-neutral-800' : 'bg-slate-100'
                } rounded-full h-2 overflow-hidden`}
              >
                {/* Barra com gradiente estilo mapa de calor */}
                <div
                  className={`h-2 rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-[#FDE047] to-[#EAB308] shadow-[0_0_10px_rgba(234,179,8,0.3)]`}
                  style={{
                    width: `${Math.min(
                      (stats.rangeMinutes / stats.currentGoalMinutes) * 100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
              <div
                className={`${THEME.card} p-5 rounded-2xl border shadow-sm relative`}
              >
                <div
                  className={`flex items-center gap-2 ${THEME.textMuted} mb-2`}
                >
                  <Clock className='h-4 w-4' style={ICON_GRADIENT_STYLE} />
                  <span className='text-[10px] font-bold uppercase tracking-wider'>
                    {getRangeLabel(timeRange)}
                  </span>
                </div>
                {/* Animação sutil no número principal */}
                <div className='text-2xl font-bold animate-in fade-in slide-in-from-bottom-2 duration-500'>
                  {formatDurationDetailed(stats.rangeMinutes)}
                </div>
                {/* Period Card Logic SWAPPED: Now has ONLY Percentage + Color (No arrows/symbols) */}
                <div
                  className={`absolute top-4 right-4 text-xs font-bold ${
                    stats.goalPercentage >= 100
                      ? 'text-green-500'
                      : 'text-red-500'
                  }`}
                >
                  {stats.goalPercentage}%
                </div>
              </div>
              <div
                className={`${THEME.card} p-5 rounded-2xl border shadow-sm relative overflow-hidden`}
              >
                <div
                  className={`flex items-center gap-2 ${THEME.textMuted} mb-2`}
                >
                  <TrendingUp className='h-4 w-4' style={ICON_GRADIENT_STYLE} />
                  <span className='text-[10px] font-bold uppercase tracking-wider'>
                    Total
                  </span>
                </div>
                {/* Animação sutil no número principal */}
                <div className='text-2xl font-bold animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100'>
                  {formatDurationDetailed(stats.totalMinutes)}
                </div>
              </div>
              <div
                className={`hidden md:block ${THEME.card} p-5 rounded-2xl border shadow-sm`}
              >
                <div
                  className={`flex items-center gap-2 ${THEME.textMuted} mb-2`}
                >
                  <CheckCircle2
                    className='h-4 w-4'
                    style={ICON_GRADIENT_STYLE}
                  />
                  <span className='text-[10px] font-bold uppercase tracking-wider'>
                    Sessões
                  </span>
                </div>
                {/* Animação sutil no número principal */}
                <div className='text-2xl font-bold animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150'>
                  {stats.filteredCount}
                </div>
              </div>
            </div>

            <div className={`${THEME.card} p-6 rounded-2xl border shadow-sm`}>
              <h2
                className={`text-lg font-bold mb-6 flex items-center gap-2 ${THEME.text}`}
              >
                <Plus className='h-5 w-5 bg-gradient-to-br from-[#FDE047] to-[#EAB308] text-black rounded-full p-1 shadow-sm' />{' '}
                Registrar Estudo
              </h2>
              <form onSubmit={handleAddSession} className='flex flex-col gap-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div
                    className='col-span-1 md:col-span-2 relative'
                    ref={wrapperRef}
                  >
                    <label
                      className={`block text-xs font-bold ${THEME.textMuted} uppercase mb-2`}
                    >
                      Disciplina
                    </label>
                    <div className='relative'>
                      <input
                        type='text'
                        value={subjectInput}
                        onChange={(e) => {
                          setSubjectInput(e.target.value);
                          setShowSuggestions(true);
                          setFormError(null);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        placeholder='Pesquise...'
                        className={`w-full rounded-xl border p-4 pl-12 outline-none font-medium transition-all ${
                          THEME.input
                        } focus:border-[#EAB308] ${
                          formError ? 'border-red-500' : ''
                        }`}
                        required
                      />
                      <Search
                        className={`h-5 w-5 absolute left-4 top-4 ${THEME.textMuted}`}
                      />
                    </div>
                    {formError && (
                      <div className='mt-2 text-xs text-red-500 flex items-center gap-1'>
                        <AlertCircle className='h-3 w-3' />
                        {formError}
                      </div>
                    )}
                    {showSuggestions &&
                      subjectInput &&
                      filteredSuggestions.length > 0 && (
                        <div
                          className={`absolute z-50 w-full mt-2 rounded-xl shadow-2xl border max-h-60 overflow-y-auto ${
                            isDarkMode
                              ? 'bg-neutral-900 border-neutral-800'
                              : 'bg-white border-slate-200'
                          }`}
                        >
                          {filteredSuggestions.map((s, i) => (
                            <div
                              key={i}
                              onClick={() => {
                                setSubjectInput(s);
                                setShowSuggestions(false);
                                setFormError(null);
                                triggerHaptic();
                              }}
                              className={`px-4 py-3 cursor-pointer text-sm border-b last:border-0 font-medium ${
                                isDarkMode
                                  ? 'border-neutral-800 hover:bg-neutral-800 text-neutral-200'
                                  : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              {s}
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4 items-end'>
                  <div className='col-span-2 md:col-span-2'>
                    <label
                      className={`block text-xs font-bold ${THEME.textMuted} uppercase mb-2`}
                    >
                      Data
                    </label>
                    <input
                      type='datetime-local'
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className={`w-full rounded-xl border p-4 outline-none font-medium focus:border-[#EAB308] ${THEME.input}`}
                      required
                    />
                  </div>
                  <div className='col-span-2 md:col-span-1'>
                    <label
                      className={`block text-xs font-bold ${THEME.textMuted} uppercase mb-2`}
                    >
                      Minutos
                    </label>
                    <div className='flex gap-2'>
                      <input
                        type='number'
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        placeholder='45'
                        className={`w-full rounded-xl border p-4 outline-none font-medium focus:border-[#EAB308] ${THEME.input}`}
                        required
                      />
                      <button
                        type='button'
                        onClick={() => {
                          setView('timer');
                          triggerHaptic();
                        }}
                        className={`px-3 rounded-xl border flex items-center justify-center transition-all active:scale-95 ${
                          isDarkMode
                            ? 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700'
                            : 'bg-slate-100 border-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        <Timer className={`h-5 w-5 ${THEME.text}`} />
                      </button>
                    </div>
                  </div>
                  <div className='col-span-2 md:col-span-1'>
                    {/* Botão principal com gradiente sutil */}
                    <button
                      type='submit'
                      disabled={isSubmitting}
                      className='w-full bg-gradient-to-br from-[#FDE047] to-[#EAB308] hover:to-[#CA8A04] text-black font-bold py-4 px-4 rounded-xl shadow-lg transition-transform active:scale-95'
                    >
                      {isSubmitting ? '...' : 'Salvar'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* === TIMER VIEW (ZEN MODE) === */}
        {view === 'timer' && (
          <div
            className={`fixed inset-0 z-[60] flex flex-col ${
              isDarkMode ? 'bg-neutral-950' : 'bg-slate-50'
            } animate-in fade-in zoom-in duration-300`}
          >
            {/* ZEN BACKGROUND */}
            {isDarkMode && (
              <div className='absolute inset-0 bg-gradient-to-b from-neutral-900 to-black pointer-events-none'></div>
            )}

            {/* TOP BAR: EXIT & TABS */}
            <div className='relative z-[70] flex justify-between items-start p-6'>
              {/* TABS (Top Left) - Icons Only - MINIMALIST UPDATE */}
              <div className='flex gap-4'>
                <button
                  onClick={() => handleModeToggle('stopwatch')}
                  className={`p-3 transition-all ${
                    timerMode === 'stopwatch'
                      ? 'text-[#EAB308] scale-110'
                      : 'text-neutral-500 hover:text-neutral-400'
                  }`}
                  title='Cronômetro'
                >
                  <Timer className='h-6 w-6' />
                </button>
                <button
                  onClick={() => handleModeToggle('countdown')}
                  className={`p-3 transition-all ${
                    timerMode === 'countdown'
                      ? 'text-[#EAB308] scale-110'
                      : 'text-neutral-500 hover:text-neutral-400'
                  }`}
                  title='Pomodoro'
                >
                  <Hourglass className='h-6 w-6' />
                </button>
              </div>

              {/* EXIT BUTTON (Z-INDEX FIX) - UPDATED TO FORCE CLOSE */}
              <button
                onClick={handleTimerExit}
                className={`p-2 rounded-full transition-colors z-[80] cursor-pointer ${
                  isDarkMode
                    ? 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800'
                    : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                }`}
              >
                <X className='h-6 w-6' />
              </button>
            </div>

            {/* MAIN CONTENT CENTERED */}
            {/* Added pb-20 for mobile visual balance (Circle Up) and overflow-auto for desktop fixes */}
            <div className='relative z-10 flex-1 flex flex-col items-center justify-center p-6 pb-20 w-full overflow-y-auto'>
              {/* CIRCULAR TIMER */}
              <div className='relative mb-8 flex-shrink-0'>
                {/* SVG Circle - Precise ViewBox for Calculation */}
                <svg
                  className='w-64 h-64 sm:w-72 sm:h-72'
                  viewBox='0 0 100 100'
                >
                  {/* Background Circle */}
                  <circle
                    cx='50'
                    cy='50'
                    r='45'
                    stroke={isDarkMode ? '#262626' : '#e2e8f0'}
                    strokeWidth='2'
                    fill='transparent'
                  />

                  {timerMode === 'stopwatch' ? (
                    // STOPWATCH: Trail fills up + Ball at tip
                    <>
                      <defs>
                        <linearGradient
                          id='gold-gradient-def'
                          x1='0%'
                          y1='0%'
                          x2='100%'
                          y2='100%'
                        >
                          <stop offset='0%' stopColor='#FDE047' />
                          <stop offset='100%' stopColor='#EAB308' />
                        </linearGradient>
                      </defs>
                      {/* Yellow Gradient Trail */}
                      <circle
                        cx='50'
                        cy='50'
                        r='45'
                        stroke='url(#gold-gradient-def)'
                        strokeWidth='2'
                        fill='transparent'
                        strokeDasharray={2 * Math.PI * 45} // ~282.74
                        // Rotate -90deg to start top
                        transform='rotate(-90 50 50)'
                        strokeDashoffset={
                          282.74 * (1 - (timerSeconds % 60) / 60)
                        }
                        className='transition-all duration-1000 ease-linear'
                        strokeLinecap='round'
                      />
                      {/* Ball at Tip */}
                      <circle
                        cx={
                          50 +
                          45 *
                            Math.cos(
                              (((timerSeconds % 60) / 60) * 360 - 90) *
                                (Math.PI / 180)
                            )
                        }
                        cy={
                          50 +
                          45 *
                            Math.sin(
                              (((timerSeconds % 60) / 60) * 360 - 90) *
                                (Math.PI / 180)
                            )
                        }
                        r='2'
                        fill='#EAB308'
                        className='transition-all duration-1000 ease-linear shadow-lg'
                      />
                    </>
                  ) : (
                    // POMODORO: Full yellow circle unfilling to reveal grey + Ball at tip
                    <>
                      <defs>
                        <linearGradient
                          id='gold-gradient-def'
                          x1='0%'
                          y1='0%'
                          x2='100%'
                          y2='100%'
                        >
                          <stop offset='0%' stopColor='#FDE047' />
                          <stop offset='100%' stopColor='#EAB308' />
                        </linearGradient>
                      </defs>
                      <circle
                        cx='50'
                        cy='50'
                        r='45'
                        stroke='url(#gold-gradient-def)'
                        strokeWidth='2'
                        fill='transparent'
                        strokeDasharray={2 * Math.PI * 45} // ~282.74
                        transform='rotate(-90 50 50)'
                        // Start full (0 offset). As time goes down, offset increases to max.
                        strokeDashoffset={
                          282.74 *
                          (1 - timerSeconds / (countdownInitialMinutes * 60))
                        }
                        className='transition-all duration-1000 ease-linear'
                        strokeLinecap='round'
                      />
                      {/* Ball at Tip for Pomodoro */}
                      <circle
                        cx={
                          50 +
                          45 *
                            Math.cos(
                              ((timerSeconds / (countdownInitialMinutes * 60)) *
                                360 -
                                90) *
                                (Math.PI / 180)
                            )
                        }
                        cy={
                          50 +
                          45 *
                            Math.sin(
                              ((timerSeconds / (countdownInitialMinutes * 60)) *
                                360 -
                                90) *
                                (Math.PI / 180)
                            )
                        }
                        r='2'
                        fill='#EAB308'
                        className='transition-all duration-1000 ease-linear shadow-lg'
                      />
                    </>
                  )}
                </svg>

                {/* Time Display centered in circle */}
                <div className='absolute inset-0 flex flex-col items-center justify-center'>
                  {/* Power Format: MM:SS (Superscript) */}
                  <div
                    className={`flex items-start justify-center font-bold tabular-nums tracking-tight ${THEME.text}`}
                  >
                    <span className='text-6xl sm:text-7xl'>
                      {formatTimeComponents(timerSeconds).main}
                    </span>
                    <span className='text-xl sm:text-2xl mt-1 sm:mt-2 text-[#EAB308] opacity-90'>
                      {formatTimeComponents(timerSeconds).super}
                    </span>
                  </div>

                  {timerMode === 'countdown' && !timerIsActive && (
                    <div className='flex items-center gap-4 mt-4'>
                      <button
                        onClick={() => {
                          setCountdownInitialMinutes((m) => Math.max(5, m - 5));
                          setTimerSeconds(
                            Math.max(5, countdownInitialMinutes - 5) * 60
                          );
                        }}
                        className={`p-2 rounded-full ${
                          isDarkMode
                            ? 'bg-neutral-800 hover:bg-neutral-700 text-white'
                            : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                        }`}
                      >
                        <ArrowDown className='h-4 w-4' />
                      </button>
                      <span className='text-xl font-bold text-[#EAB308]'>
                        {countdownInitialMinutes}m
                      </span>
                      <button
                        onClick={() => {
                          setCountdownInitialMinutes((m) => m + 5);
                          setTimerSeconds((countdownInitialMinutes + 5) * 60);
                        }}
                        className={`p-2 rounded-full ${
                          isDarkMode
                            ? 'bg-neutral-800 hover:bg-neutral-700 text-white'
                            : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                        }`}
                      >
                        <ArrowUp className='h-4 w-4' />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* CONTROLS (Small & Minimalist) */}
              <div className='flex items-center gap-6 mb-8 flex-shrink-0'>
                <button
                  onClick={handleTimerReset}
                  className={`p-3 rounded-full transition-all active:scale-95 ${
                    isDarkMode
                      ? 'text-neutral-500 hover:text-white hover:bg-neutral-800'
                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200'
                  }`}
                  title='Resetar'
                >
                  <RotateCcw className='h-5 w-5' />
                </button>

                {/* Minimalist Play/Pause Button - Thin ring */}
                <button
                  onClick={handleTimerStart}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all active:scale-95 border ${
                    timerIsActive
                      ? 'border-red-500/50 text-red-500 hover:bg-red-500/10'
                      : `border-neutral-600 ${
                          isDarkMode
                            ? 'text-white hover:border-white hover:bg-white/5'
                            : 'text-slate-700 border-slate-300 hover:border-slate-500 hover:bg-slate-100'
                        }`
                  }`}
                >
                  {timerIsActive ? (
                    <Pause className='h-6 w-6 fill-current' />
                  ) : (
                    <Play className='h-6 w-6 fill-current ml-1' />
                  )}
                </button>
              </div>

              {/* SUBJECT SELECTOR (Centralized Below Clock) - Ensure Visibility on Desktop */}
              <div className='w-full max-w-sm mb-6 relative group z-30 flex-shrink-0'>
                <input
                  type='text'
                  value={subjectInput}
                  onChange={(e) => {
                    setSubjectInput(e.target.value);
                    setShowSuggestions(true);
                    setFormError(null);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder='Selecione a disciplina...'
                  className={`w-full text-sm rounded-xl py-3 pl-10 pr-4 outline-none focus:border-[#EAB308] transition-all text-center shadow-lg backdrop-blur-sm ${
                    isDarkMode
                      ? 'bg-neutral-900/80 border border-neutral-800 text-white placeholder-neutral-600 focus:bg-neutral-900'
                      : 'bg-white/80 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white'
                  }`}
                />
                <Search
                  className={`h-4 w-4 absolute left-3 top-3.5 group-focus-within:text-[#EAB308] transition-colors ${
                    isDarkMode ? 'text-neutral-500' : 'text-slate-400'
                  }`}
                />

                {/* Suggestions Dropdown (Upwards) */}
                {showSuggestions &&
                  subjectInput &&
                  filteredSuggestions.length > 0 && (
                    <div
                      className={`absolute bottom-full mb-2 left-0 right-0 w-full max-h-48 overflow-y-auto rounded-xl shadow-2xl z-40 ${
                        isDarkMode
                          ? 'bg-neutral-900 border border-neutral-800'
                          : 'bg-white border border-slate-200'
                      }`}
                    >
                      {filteredSuggestions.map((s, i) => (
                        <div
                          key={i}
                          onClick={() => {
                            setSubjectInput(s);
                            setShowSuggestions(false);
                            setFormError(null);
                            triggerHaptic();
                          }}
                          className={`px-4 py-3 cursor-pointer text-xs border-b last:border-0 font-medium text-center ${
                            isDarkMode
                              ? 'border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:text-white'
                              : 'border-slate-100 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          {s}
                        </div>
                      ))}
                    </div>
                  )}
              </div>

              {/* SAVE BUTTON (Prominent) */}
              <button
                onClick={handleSaveTimerSession}
                disabled={
                  isSubmitting ||
                  (timerMode === 'stopwatch' && timerSeconds === 0) ||
                  (timerMode === 'countdown' &&
                    timerSeconds === countdownInitialMinutes * 60)
                }
                className='w-full max-w-sm bg-gradient-to-br from-[#FDE047] to-[#EAB308] hover:to-[#CA8A04] text-black font-bold py-4 px-6 rounded-2xl shadow-[0_0_20px_rgba(234,179,8,0.2)] transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 flex-shrink-0'
              >
                <Save className='h-5 w-5' /> SALVAR SESSÃO
              </button>

              {/* ERROR MESSAGE */}
              {formError && (
                <div className='mt-4 text-sm text-red-500 flex items-center gap-1 font-bold animate-pulse'>
                  <AlertCircle className='h-4 w-4' />
                  {formError}
                </div>
              )}
            </div>
          </div>
        )}

        {/* === STATISTICS VIEW === */}
        {view === 'statistics' && (
          <div className='space-y-6 animate-in fade-in duration-300 ease-out'>
            {/* HEATMAP */}
            <div
              className={`${THEME.card} p-5 rounded-2xl border shadow-sm w-full`}
            >
              <div className='flex justify-between items-center mb-6'>
                <h3
                  className={`font-bold ${THEME.text} flex items-center gap-2`}
                >
                  <Activity className='h-5 w-5' style={ICON_GRADIENT_STYLE} />{' '}
                  Frequência de Estudo
                </h3>
                <div
                  className={`flex items-center gap-2 p-1 rounded-lg ${
                    isDarkMode ? 'bg-neutral-900' : 'bg-slate-100'
                  }`}
                >
                  <span className='text-xs font-bold px-2'>{heatmapYear}</span>
                </div>
              </div>

              <div
                className='flex justify-start w-full gap-1 flex-wrap content-start'
                style={{ maxHeight: '200px', overflowY: 'hidden' }}
              >
                {stats.heatmapData.map((day, idx) => (
                  <div
                    key={idx}
                    title={`${new Date(
                      day.date
                    ).toLocaleDateString()}: ${formatDurationDetailed(
                      day.count
                    )}`}
                    className={`w-2 h-2 sm:w-3 sm:h-3 rounded-[1px] transition-all duration-300 hover:scale-125 ${
                      day.isGoalMet
                        ? 'border border-[#EAB308] shadow-[0_0_5px_#EAB308]'
                        : ''
                    }`}
                    style={{ backgroundColor: HEATMAP_COLORS[day.level] }}
                  ></div>
                ))}
              </div>
              <div className='flex items-center justify-between mt-4'>
                <div className='flex items-center gap-2'>
                  <button
                    onClick={() => setHeatmapYear((y) => y - 1)}
                    className={`p-1 rounded ${THEME.textMuted} hover:bg-neutral-800`}
                  >
                    <ChevronLeft className='h-4 w-4' />
                  </button>
                  <span className={`text-xs font-bold ${THEME.text}`}>
                    {heatmapYear}
                  </span>
                  <button
                    onClick={() => setHeatmapYear((y) => y + 1)}
                    className={`p-1 rounded ${THEME.textMuted} hover:bg-neutral-800`}
                  >
                    <ChevronRight className='h-4 w-4' />
                  </button>
                </div>
                <div className='flex items-center gap-2 text-[10px] text-slate-400'>
                  <span>-</span>
                  <div className='flex gap-1'>
                    {HEATMAP_COLORS.map((c) => (
                      <div
                        key={c}
                        className='w-2 h-2 rounded-[1px]'
                        style={{ backgroundColor: c }}
                      ></div>
                    ))}
                  </div>
                  <span>+</span>
                </div>
              </div>
            </div>

            {/* COMPARISON REPORT TABLE */}
            <div className={`${THEME.card} p-6 rounded-2xl border shadow-sm`}>
              <h3
                className={`font-bold ${THEME.text} flex items-center gap-2 mb-4`}
              >
                <TrendingUp className='h-5 w-5' style={ICON_GRADIENT_STYLE} />{' '}
                Relatório de Comparação
              </h3>
              <div className='overflow-x-auto'>
                <table className='w-full text-sm text-left'>
                  <thead>
                    <tr
                      className={`${THEME.textMuted} border-b ${
                        isDarkMode ? 'border-neutral-800' : 'border-slate-100'
                      }`}
                    >
                      <th className='py-2 font-bold uppercase text-xs'>
                        Período
                      </th>
                      <th className='py-2 font-bold uppercase text-xs text-right'>
                        Anterior
                      </th>
                      <th className='py-2 font-bold uppercase text-xs text-right'>
                        Atual
                      </th>
                      <th className='py-2 font-bold uppercase text-xs text-right'>
                        Var.
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    className={`divide-y ${
                      isDarkMode ? 'divide-neutral-800' : 'divide-slate-100'
                    }`}
                  >
                    {stats.evolutionReport.map((row) => (
                      <tr key={row.days} className='group'>
                        <td className={`py-3 font-medium ${THEME.text}`}>
                          {row.label}
                        </td>
                        <td
                          className={`py-3 text-right font-bold ${THEME.textMuted}`}
                        >
                          {row.prev}
                        </td>
                        <td
                          className={`py-3 text-right font-bold ${THEME.text}`}
                        >
                          {row.current}
                        </td>
                        {/* No Arrows in Report, Just + or - and color */}
                        <td
                          className={`py-3 text-right font-bold animate-in fade-in slide-in-from-right-1 duration-300 ${
                            row.percent === null
                              ? 'text-gray-500'
                              : row.percent >= 0
                              ? THEME.success
                              : THEME.danger
                          }`}
                        >
                          {row.percent === null
                            ? 'N/A'
                            : `${row.percent > 0 ? '+' : ''}${row.percent}%`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* NEW COMPARATIVE CHART (Replaces Day of Week) */}
            {/* Condition: Always show CARD container, but chart only if data exists. Filtered data above ensures empty bars for 0/0 periods */}
            <div className={`${THEME.card} p-6 rounded-2xl border shadow-sm`}>
              <h3
                className={`font-bold ${THEME.text} flex items-center gap-2 mb-6`}
              >
                <ChartColumnBig
                  className='h-5 w-5'
                  style={ICON_GRADIENT_STYLE}
                />{' '}
                Comparativo de Períodos
              </h3>
              <div className='w-full h-56'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart
                    data={stats.comparativeData}
                    margin={{ top: 5, right: 10, bottom: 5, left: -15 }}
                  >
                    <defs>
                      <linearGradient
                        id='chartGradient'
                        x1='0'
                        y1='0'
                        x2='1'
                        y2='0'
                      >
                        <stop offset='0%' stopColor='#FDE047' />
                        <stop offset='100%' stopColor='#EAB308' />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray='3 3'
                      vertical={false}
                      stroke={isDarkMode ? '#333' : '#eee'}
                    />
                    <XAxis
                      dataKey='name'
                      tick={{
                        fontSize: 10,
                        fill: isDarkMode ? '#888' : '#666',
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{
                        fontSize: 10,
                        fill: isDarkMode ? '#888' : '#666',
                      }}
                      tickFormatter={formatAxisTick}
                      axisLine={false}
                      tickLine={false}
                    />
                    <RechartsTooltip
                      formatter={(value, name) => [
                        formatDurationDetailed(value as number),
                        name,
                      ]}
                      contentStyle={{
                        backgroundColor: isDarkMode ? '#171717' : '#fff',
                        borderColor: isDarkMode ? '#333' : '#eee',
                        color: isDarkMode ? '#fff' : '#000',
                      }}
                    />
                    <Bar
                      dataKey='Anterior'
                      fill={isDarkMode ? '#525252' : '#cbd5e1'}
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey='Atual'
                      fill='url(#chartGradient)'
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* DAILY RHYTHM */}
            <div
              className={`${THEME.card} p-6 rounded-2xl border shadow-sm relative`}
            >
              <div className='flex justify-between items-center mb-4 flex-wrap gap-2 pr-0 sm:pr-8'>
                <div className='flex items-center gap-2'>
                  <h3
                    className={`font-bold ${THEME.text} flex items-center gap-2`}
                  >
                    <Activity className='h-5 w-5' style={ICON_GRADIENT_STYLE} />{' '}
                    Ritmo Diário
                  </h3>
                </div>
                <div
                  className={`flex p-1 rounded-lg text-xs overflow-x-auto max-w-full hide-scrollbar ${
                    isDarkMode ? 'bg-neutral-900' : 'bg-slate-100'
                  }`}
                >
                  {(
                    [
                      '7_days',
                      '14_days',
                      '30_days',
                      '90_days',
                      '180_days',
                      '360_days',
                    ] as TimeRange[]
                  ).map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setDailyRhythmRange(r);
                        triggerHaptic();
                      }}
                      className={`px-2 py-1 rounded transition font-bold whitespace-nowrap ${
                        dailyRhythmRange === r
                          ? 'bg-gradient-to-br from-[#FDE047] to-[#EAB308] text-black shadow-sm'
                          : `${THEME.textMuted}`
                      }`}
                    >
                      {r.replace('_days', 'd')}
                    </button>
                  ))}
                </div>
              </div>
              {/* Deviation Badge for Rhythm - No Background, Spaced */}
              <div
                className={`absolute top-6 right-6 text-xs font-bold flex items-center gap-1 ${
                  stats.rhythmDeviationPercent >= 0
                    ? 'text-green-500'
                    : 'text-red-500'
                }`}
              >
                {stats.rhythmDeviationPercent > 0 ? '+' : ''}
                {stats.rhythmDeviationPercent}%
                {stats.rhythmDeviationPercent >= 0 ? (
                  <ArrowUp className='h-3 w-3' />
                ) : (
                  <ArrowDown className='h-3 w-3' />
                )}
              </div>
              <div className='w-full h-56'>
                <ResponsiveContainer width='100%' height='100%'>
                  <ComposedChart
                    data={stats.dailyRhythmData}
                    margin={{ top: 5, right: 10, bottom: 5, left: -15 }}
                  >
                    <defs>
                      <linearGradient
                        id='chartGradient'
                        x1='0'
                        y1='0'
                        x2='1'
                        y2='0'
                      >
                        <stop offset='0%' stopColor='#FDE047' />
                        <stop offset='100%' stopColor='#EAB308' />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray='3 3'
                      vertical={false}
                      stroke={isDarkMode ? '#333' : '#eee'}
                    />
                    <XAxis
                      dataKey='date'
                      tick={{ fontSize: 9, fill: isDarkMode ? '#888' : '#666' }}
                      interval='preserveStartEnd'
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{
                        fontSize: 10,
                        fill: isDarkMode ? '#888' : '#666',
                      }}
                      tickFormatter={formatAxisTick}
                      axisLine={false}
                      tickLine={false}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: isDarkMode ? '#171717' : '#fff',
                        borderColor: isDarkMode ? '#333' : '#eee',
                      }}
                    />
                    <Bar
                      dataKey='minutes'
                      fill={isDarkMode ? '#333' : '#e2e8f0'}
                      radius={[4, 4, 0, 0]}
                      name='Minutos'
                    />
                    <Line
                      type='monotone'
                      dataKey='ma'
                      stroke='url(#chartGradient)'
                      strokeWidth={2}
                      dot={false}
                      name='Média'
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* LINE CHART */}
            <div
              className={`${THEME.card} p-6 rounded-2xl border shadow-sm relative`}
            >
              <div className='flex justify-between items-center mb-6 flex-wrap gap-2 pr-0 sm:pr-8'>
                <div className='flex items-center gap-2'>
                  <h3
                    className={`font-bold ${THEME.text} flex items-center gap-2`}
                  >
                    <LineChartIcon
                      className='h-5 w-5'
                      style={ICON_GRADIENT_STYLE}
                    />{' '}
                    Estudo Acumulado
                  </h3>
                </div>
                <div
                  className={`flex p-1 rounded-lg text-xs overflow-x-auto max-w-full hide-scrollbar ${
                    isDarkMode ? 'bg-neutral-900' : 'bg-slate-100'
                  }`}
                >
                  {(
                    [
                      '7_days',
                      '14_days',
                      '30_days',
                      '90_days',
                      '180_days',
                      '360_days',
                    ] as TimeRange[]
                  ).map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setLineChartRange(r);
                        triggerHaptic();
                      }}
                      className={`px-2 py-1 rounded transition font-bold whitespace-nowrap ${
                        lineChartRange === r
                          ? 'bg-gradient-to-br from-[#FDE047] to-[#EAB308] text-black shadow-sm'
                          : `${THEME.textMuted}`
                      }`}
                    >
                      {r.replace('_days', 'd')}
                    </button>
                  ))}
                </div>
              </div>
              {/* Deviation Badge for Accumulated - No Background, Spaced */}
              <div
                className={`absolute top-6 right-6 text-xs font-bold flex items-center gap-1 ${
                  stats.accumulatedDeviationPercent >= 0
                    ? 'text-green-500'
                    : 'text-red-500'
                }`}
              >
                {stats.accumulatedDeviationPercent > 0 ? '+' : ''}
                {stats.accumulatedDeviationPercent}%
                {stats.accumulatedDeviationPercent >= 0 ? (
                  <ArrowUp className='h-3 w-3' />
                ) : (
                  <ArrowDown className='h-3 w-3' />
                )}
              </div>
              <div className='w-full h-56'>
                <ResponsiveContainer width='100%' height='100%'>
                  <LineChart
                    data={stats.lineChartData}
                    margin={{ top: 5, right: 10, bottom: 5, left: -10 }}
                  >
                    <defs>
                      <linearGradient
                        id='chartGradient'
                        x1='0'
                        y1='0'
                        x2='1'
                        y2='0'
                      >
                        <stop offset='0%' stopColor='#FDE047' />
                        <stop offset='100%' stopColor='#EAB308' />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray='3 3'
                      vertical={false}
                      stroke={isDarkMode ? '#333' : '#eee'}
                    />
                    <XAxis
                      dataKey='date'
                      tick={{
                        fontSize: 10,
                        fill: isDarkMode ? '#888' : '#666',
                      }}
                      interval='preserveStartEnd'
                      minTickGap={40}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{
                        fontSize: 10,
                        fill: isDarkMode ? '#888' : '#666',
                      }}
                      tickFormatter={formatAxisTick}
                      axisLine={false}
                      tickLine={false}
                    />
                    <RechartsTooltip
                      formatter={(val, name) => [
                        formatDurationDetailed(val as number),
                        name === 'reference' ? 'Meta (3h/dia)' : 'Realizado',
                      ]}
                      contentStyle={{
                        backgroundColor: isDarkMode ? '#171717' : '#fff',
                        borderColor: isDarkMode ? '#333' : '#eee',
                      }}
                    />
                    <Line
                      type='linear'
                      dataKey='reference'
                      stroke={isDarkMode ? '#555' : '#cbd5e1'}
                      strokeWidth={2}
                      strokeOpacity={0.5}
                      dot={false}
                      activeDot={false}
                    />
                    <Line
                      type='linear'
                      dataKey='accumulated'
                      stroke='url(#chartGradient)'
                      strokeWidth={2}
                      dot={{ r: 0 }}
                      activeDot={{ r: 4, fill: 'url(#chartGradient)' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* DISTRIBUTION */}
            <div className={`${THEME.card} p-6 rounded-2xl border shadow-sm`}>
              <div className='flex justify-between items-center mb-6'>
                <div>
                  <h3
                    className={`font-bold ${THEME.text} flex items-center gap-2`}
                  >
                    <PieChartIcon
                      className='h-5 w-5'
                      style={ICON_GRADIENT_STYLE}
                    />{' '}
                    Distribuição
                  </h3>
                  <p
                    className={`text-xs ${THEME.textMuted} font-medium animate-in fade-in slide-in-from-bottom-1 duration-500 delay-100`}
                  >
                    Total: {formatDurationDetailed(stats.totalMinutes)}
                  </p>
                </div>
                <div
                  className={`flex gap-1 p-1 rounded-lg ${
                    isDarkMode ? 'bg-neutral-900' : 'bg-slate-100'
                  }`}
                >
                  <button
                    onClick={() => {
                      setChartType('pie');
                      triggerHaptic();
                    }}
                    className={`p-2 rounded ${
                      chartType === 'pie'
                        ? 'bg-gradient-to-br from-[#FDE047] to-[#EAB308] text-black shadow-sm'
                        : `${THEME.textMuted}`
                    }`}
                  >
                    <PieChartIcon className='h-4 w-4' />
                  </button>
                  <button
                    onClick={() => {
                      setChartType('radar');
                      triggerHaptic();
                    }}
                    className={`p-2 rounded ${
                      chartType === 'radar'
                        ? 'bg-gradient-to-br from-[#FDE047] to-[#EAB308] text-black shadow-sm'
                        : `${THEME.textMuted}`
                    }`}
                  >
                    <Hexagon className='h-4 w-4' />
                  </button>
                  <button
                    onClick={() => {
                      setChartType('bar');
                      triggerHaptic();
                    }}
                    className={`p-2 rounded ${
                      chartType === 'bar'
                        ? 'bg-gradient-to-br from-[#FDE047] to-[#EAB308] text-black shadow-sm'
                        : `${THEME.textMuted}`
                    }`}
                  >
                    <BarChart3 className='h-4 w-4' />
                  </button>
                </div>
              </div>

              {stats.listData.length > 0 ? (
                <div
                  className='w-full'
                  style={{
                    height:
                      chartType === 'bar'
                        ? Math.max(350, stats.barChartData.length * 50)
                        : 350,
                  }}
                >
                  <ResponsiveContainer width='100%' height='100%'>
                    {chartType === 'pie' && (
                      <PieChart>
                        <Pie
                          data={stats.pieAllData}
                          cx='50%'
                          cy='50%'
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey='value'
                          stroke='none'
                        >
                          {stats.pieAllData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          formatter={(value) =>
                            formatDurationDetailed(value as number)
                          }
                          contentStyle={{
                            backgroundColor: isDarkMode ? '#171717' : '#fff',
                            borderColor: isDarkMode ? '#333' : '#eee',
                          }}
                        />
                        <Legend
                          content={renderPieLegend}
                          verticalAlign='bottom'
                        />
                      </PieChart>
                    )}
                    {chartType === 'radar' && stats.radarData.length > 0 && (
                      <RadarChart
                        cx='50%'
                        cy='50%'
                        outerRadius='65%'
                        data={stats.radarData}
                      >
                        <defs>
                          <linearGradient
                            id='chartGradient'
                            x1='0'
                            y1='0'
                            x2='1'
                            y2='0'
                          >
                            <stop offset='0%' stopColor='#FDE047' />
                            <stop offset='100%' stopColor='#EAB308' />
                          </linearGradient>
                        </defs>
                        <PolarGrid stroke={isDarkMode ? '#333' : '#eee'} />
                        <PolarAngleAxis
                          dataKey='name'
                          tick={(props) => <CustomRadarTick {...props} />}
                        />
                        {/* tick={false} esconde os números do raio (0h, 1h...) */}
                        <PolarRadiusAxis
                          angle={30}
                          domain={[0, 'auto']}
                          tickFormatter={formatAxisTick}
                          tick={false}
                          axisLine={false}
                        />
                        <Radar
                          name='Tempo'
                          dataKey='value'
                          stroke='url(#chartGradient)'
                          strokeWidth={2}
                          fill='url(#chartGradient)'
                          fillOpacity={0.4}
                        />
                        <RechartsTooltip
                          formatter={(value) =>
                            formatDurationDetailed(value as number)
                          }
                          contentStyle={{
                            backgroundColor: isDarkMode ? '#171717' : '#fff',
                            borderColor: isDarkMode ? '#333' : '#eee',
                          }}
                        />
                      </RadarChart>
                    )}
                    {chartType === 'bar' && (
                      <BarChart
                        data={stats.barChartData}
                        layout='vertical'
                        margin={{ left: 15, right: 15 }}
                      >
                        <CartesianGrid
                          strokeDasharray='3 3'
                          horizontal={false}
                          stroke={isDarkMode ? '#333' : '#eee'}
                        />
                        <XAxis type='number' hide />
                        <YAxis
                          type='category'
                          dataKey='name'
                          width={100}
                          tick={<CustomYAxisTick />}
                          interval={0}
                          axisLine={false}
                          tickLine={false}
                        />
                        <RechartsTooltip
                          formatter={(value) =>
                            formatDurationDetailed(value as number)
                          }
                          contentStyle={{
                            backgroundColor: isDarkMode ? '#171717' : '#fff',
                            borderColor: isDarkMode ? '#333' : '#eee',
                          }}
                        />
                        <Bar dataKey='value' radius={[0, 4, 4, 0]}>
                          {stats.barChartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                entry.name === 'Outras Matérias'
                                  ? '#525252'
                                  : COLORS[index % COLORS.length]
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className='h-64 flex flex-col items-center justify-center text-neutral-500'>
                  <p>Sem dados.</p>
                </div>
              )}
            </div>

            {/* DETAILED LIST */}
            <div className={`${THEME.card} p-6 rounded-2xl border shadow-sm`}>
              <div className='flex items-center justify-between mb-4'>
                <div>
                  <h3
                    className={`font-bold ${THEME.text} flex items-center gap-2`}
                  >
                    <Clipboard
                      className='h-5 w-5'
                      style={ICON_GRADIENT_STYLE}
                    />{' '}
                    Resumo Completo
                  </h3>
                  {/* ADDED TOTAL BELOW TITLE */}
                  <p
                    className={`text-xs ${THEME.textMuted} font-medium animate-in fade-in slide-in-from-bottom-1 duration-500 delay-100`}
                  >
                    Total: {formatDurationDetailed(stats.totalMinutes)}
                  </p>
                </div>
                <div className='flex gap-1'>
                  <button
                    onClick={() => {
                      setSortOrder('desc');
                      triggerHaptic();
                    }}
                    className={`p-1.5 rounded transition ${
                      sortOrder === 'desc'
                        ? 'bg-gradient-to-br from-[#FDE047] to-[#EAB308] text-black'
                        : `${THEME.textMuted} hover:bg-neutral-800`
                    }`}
                  >
                    <ArrowDownWideNarrow className='h-4 w-4' />
                  </button>
                  <button
                    onClick={() => {
                      setSortOrder('asc');
                      triggerHaptic();
                    }}
                    className={`p-1.5 rounded transition ${
                      sortOrder === 'asc'
                        ? 'bg-gradient-to-br from-[#FDE047] to-[#EAB308] text-black'
                        : `${THEME.textMuted} hover:bg-neutral-800`
                    }`}
                  >
                    <ArrowUpWideNarrow className='h-4 w-4' />
                  </button>
                </div>
              </div>
              <div className='space-y-3'>
                {stats.listData.map((item, index) => (
                  <div
                    key={item.name}
                    className={`flex items-center justify-between p-3 rounded-xl transition ${
                      isDarkMode
                        ? 'bg-neutral-900 hover:bg-neutral-800'
                        : 'bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div className='flex items-center gap-3 min-w-0'>
                      <div
                        className='w-3 h-3 rounded-sm shrink-0'
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      ></div>
                      <span
                        className={`font-medium ${THEME.text} text-sm break-words leading-tight w-full pr-2`}
                      >
                        {item.name}
                      </span>
                    </div>
                    <div className='flex gap-2 text-sm font-bold shrink-0 items-center'>
                      <span
                        className={`px-2 py-1 rounded text-xs whitespace-nowrap ${
                          isDarkMode
                            ? 'bg-neutral-800 text-neutral-300'
                            : 'bg-white text-slate-600 border'
                        }`}
                      >
                        {item.hours}
                      </span>
                      <span className='px-2 py-1 bg-gradient-to-br from-[#FDE047] to-[#EAB308] text-black rounded text-xs min-w-[3rem] text-center'>
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* === CALENDAR VIEW === */}
        {view === 'calendar' && (
          <div className='space-y-6 animate-in fade-in duration-300'>
            <div className={`${THEME.card} p-6 rounded-2xl border shadow-sm`}>
              <div className='flex justify-between items-center mb-6'>
                <h2
                  className={`text-[17px] font-bold ${THEME.text} capitalize`}
                >
                  {currentMonth.toLocaleDateString('pt-BR', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </h2>
                <div className='flex gap-2'>
                  <button
                    onClick={() => {
                      setCurrentMonth(
                        new Date(
                          currentMonth.getFullYear(),
                          currentMonth.getMonth() - 1,
                          1
                        )
                      );
                      triggerHaptic();
                    }}
                    className={`p-2 rounded-full ${THEME.textMuted} hover:bg-neutral-800`}
                  >
                    <ChevronLeft className='h-5 w-5' />
                  </button>
                  <button
                    onClick={() => {
                      setCurrentMonth(
                        new Date(
                          currentMonth.getFullYear(),
                          currentMonth.getMonth() + 1,
                          1
                        )
                      );
                      triggerHaptic();
                    }}
                    className={`p-2 rounded-full ${THEME.textMuted} hover:bg-neutral-800`}
                  >
                    <ChevronRight className='h-5 w-5' />
                  </button>
                </div>
              </div>
              <div className='grid grid-cols-7 mb-2 text-center'>
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
                  <div
                    key={i}
                    className={`text-[9px] font-bold ${THEME.textMuted} py-2`}
                  >
                    {day}
                  </div>
                ))}
              </div>
              <div className='grid grid-cols-7 gap-1'>{renderCalendar()}</div>
            </div>
            <div className={`${THEME.card} p-6 rounded-2xl border shadow-sm`}>
              <div
                className={`flex items-center justify-between mb-4 border-b pb-4 ${
                  isDarkMode ? 'border-neutral-800' : 'border-slate-100'
                }`}
              >
                <div className='flex items-center gap-2'>
                  <div>
                    <h3 className={`text-[15px] font-bold ${THEME.text}`}>
                      {selectedCalendarDate.toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      })}
                    </h3>
                    <div className='flex items-center gap-2'>
                      <p className={`text-xs ${THEME.textMuted} font-medium`}>
                        Resumo do dia
                      </p>
                      {/* Percentage Moved Next to Title - INLINE */}
                      <div
                        className={`text-xs font-bold ${
                          selectedDayPercentage >= 100
                            ? 'text-green-500'
                            : 'text-red-500'
                        }`}
                      >
                        {selectedDayPercentage}%
                      </div>
                    </div>
                  </div>
                </div>
                <div className='text-right'>
                  {/* Animação sutil no número total do dia */}
                  <div className='text-xl font-bold text-[#EAB308] animate-in fade-in slide-in-from-bottom-1 duration-500'>
                    {formatDurationDetailed(selectedDayTotal)}
                  </div>
                  <span className={`text-xs ${THEME.textMuted} font-bold`}>
                    Total Estudado
                  </span>
                </div>
              </div>
              {selectedDaySessions.length === 0 ? (
                <div className={`text-center py-8 ${THEME.textMuted} text-sm`}>
                  <p>Nenhum estudo registrado neste dia.</p>
                </div>
              ) : (
                <div className='space-y-3'>
                  {selectedDaySessions.map((session) => (
                    <div
                      key={session.id}
                      className={`flex items-center justify-between p-3 rounded-xl ${
                        isDarkMode ? 'bg-neutral-900' : 'bg-slate-50'
                      }`}
                    >
                      <div>
                        <h4 className={`font-bold ${THEME.text} text-sm`}>
                          {session.subject}
                        </h4>
                        <p
                          className={`text-[11px] ${THEME.textMuted} flex items-center gap-1 mt-1 font-medium`}
                        >
                          <History className='h-3 w-3' />{' '}
                          {new Date(session.date).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          isDarkMode
                            ? 'bg-neutral-800 text-white'
                            : 'bg-white border text-slate-600'
                        }`}
                      >
                        {formatDurationDetailed(session.durationMinutes)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* === HISTORY VIEW === */}
        {view === 'history' && (
          <div
            className={`${THEME.card} rounded-2xl border overflow-hidden shadow-sm animate-in fade-in duration-300`}
          >
            {sessions.length === 0 ? (
              <div className={`p-12 text-center ${THEME.textMuted}`}>
                <p>Histórico vazio.</p>
              </div>
            ) : (
              <div
                className={`divide-y ${
                  isDarkMode ? 'divide-neutral-800' : 'divide-slate-100'
                }`}
              >
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`p-4 flex items-center justify-between transition group ${
                      isDarkMode ? 'hover:bg-neutral-900' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className='flex-1 min-w-0 pr-4'>
                      <h3
                        className={`font-bold text-base break-words leading-tight ${TEXT_GRADIENT}`}
                      >
                        {session.subject}
                      </h3>
                      <p
                        className={`text-xs ${THEME.textMuted} flex items-center gap-1 mt-1 font-medium`}
                      >
                        <History className='h-3 w-3' />{' '}
                        {new Date(session.date).toLocaleDateString('pt-BR')}{' '}
                        <span className='mx-1'>•</span>{' '}
                        {new Date(session.date).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className='flex items-center gap-3'>
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold whitespace-nowrap ${
                          isDarkMode
                            ? 'bg-neutral-800 text-white'
                            : 'bg-white border text-slate-600'
                        }`}
                      >
                        {formatDurationDetailed(session.durationMinutes)}
                      </span>
                      {deleteConfirmationId === session.id ? (
                        <div className='flex items-center gap-2'>
                          <button
                            onClick={() => handleDeleteSession(session.id)}
                            className='text-red-500 font-bold text-xs hover:underline'
                          >
                            Sim
                          </button>
                          <button
                            onClick={() => setDeleteConfirmationId(null)}
                            className={`${THEME.textMuted} font-bold text-xs hover:underline`}
                          >
                            Não
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmationId(session.id)}
                          className={`text-neutral-500 hover:text-red-500 transition p-2 rounded-full ${
                            isDarkMode
                              ? 'hover:bg-neutral-800'
                              : 'hover:bg-red-50'
                          }`}
                        >
                          <Trash2 className='h-4 w-4' />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* === PROFILE VIEW === */}
        {view === 'profile' && (
          <div className='space-y-6 animate-in fade-in duration-300'>
            <div
              className={`${THEME.card} rounded-2xl border shadow-sm overflow-hidden`}
            >
              <div className='bg-[#EAB308] h-32 w-full relative'>
                <div className='absolute -bottom-12 left-1/2 -translate-x-1/2'>
                  {/* NOVA LÓGICA DE PERFIL (Conforme Solicitado):
                            Sempre renderiza o círculo de gradiente (bg-gradient-to-tr).
                            Se tiver foto -> Renderiza <img> dentro.
                            Se não tiver -> Renderiza <UserIcon> dentro (sem fundo branco extra, usando o padrão do tema para o container interno).
                        */}
                  <div
                    className={`w-24 h-24 rounded-full bg-gradient-to-tr from-[#FDE047] to-[#B45309] p-[2px] overflow-hidden relative group shadow-lg`}
                  >
                    <div
                      className={`w-full h-full rounded-full p-[1.5px] ${
                        isDarkMode ? 'bg-neutral-950' : 'bg-white'
                      }`}
                    >
                      <div
                        className={`w-full h-full rounded-full overflow-hidden flex items-center justify-center ${
                          isDarkMode ? 'bg-neutral-900' : 'bg-white'
                        }`}
                      >
                        {profile.photoUrl ? (
                          <img
                            src={profile.photoUrl}
                            alt='Perfil'
                            className='w-full h-full object-cover'
                          />
                        ) : (
                          <UserIcon
                            className={`h-10 w-10 ${
                              isDarkMode
                                ? 'text-neutral-500'
                                : 'text-neutral-400'
                            }`}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className='pt-14 pb-6 px-6 text-center'>
                <h2 className={`text-xl font-bold ${THEME.text}`}>
                  {profile.name} {profile.surname}
                </h2>
                <p className={`text-sm ${THEME.textMuted} font-medium mt-1`}>
                  {profile.bio || 'Sem biografia'}
                </p>
                {profile.location && (
                  <p
                    className={`text-xs ${THEME.textMuted} mt-1 flex items-center justify-center gap-1`}
                  >
                    <MapPin className='h-3 w-3' style={ICON_GRADIENT_STYLE} />{' '}
                    {profile.location}
                  </p>
                )}

                {/* Botão de Instalar PWA */}
                {installPrompt && (
                  <button
                    onClick={handleInstallClick}
                    className='mt-4 px-4 py-2 rounded-full bg-gradient-to-br from-[#FDE047] to-[#EAB308] text-black text-sm font-bold flex items-center gap-2 mx-auto shadow-md transition-transform active:scale-95'
                  >
                    <Download className='h-4 w-4' /> Instalar Aplicativo
                  </button>
                )}
              </div>
            </div>

            <form
              onSubmit={handleSaveProfile}
              className={`${THEME.card} rounded-2xl border p-6 shadow-sm space-y-6`}
            >
              <div
                className={`flex items-center gap-2 ${
                  THEME.text
                } font-bold border-b pb-2 ${
                  isDarkMode ? 'border-neutral-800' : 'border-slate-100'
                }`}
              >
                <UserIcon className='h-5 w-5' style={ICON_GRADIENT_STYLE} />{' '}
                Dados Pessoais
              </div>
              <div className='space-y-4'>
                <div>
                  <label
                    className={`block text-xs font-bold ${THEME.textMuted} uppercase mb-1`}
                  >
                    Nome
                  </label>
                  <input
                    type='text'
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                    className={`w-full rounded-xl border p-4 outline-none font-medium focus:border-[#EAB308] ${THEME.input}`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-xs font-bold ${THEME.textMuted} uppercase mb-1`}
                  >
                    Sobrenome
                  </label>
                  <input
                    type='text'
                    value={profile.surname}
                    onChange={(e) =>
                      setProfile({ ...profile, surname: e.target.value })
                    }
                    className={`w-full rounded-xl border p-4 outline-none font-medium focus:border-[#EAB308] ${THEME.input}`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-xs font-bold ${THEME.textMuted} uppercase mb-1`}
                  >
                    Data de Nascimento
                  </label>
                  <input
                    type='date'
                    value={profile.birthdate}
                    onChange={(e) =>
                      setProfile({ ...profile, birthdate: e.target.value })
                    }
                    className={`w-full rounded-xl border p-4 outline-none font-medium focus:border-[#EAB308] ${THEME.input}`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-xs font-bold ${THEME.textMuted} uppercase mb-1`}
                  >
                    Localização
                  </label>
                  <input
                    type='text'
                    placeholder='Cidade, Estado'
                    value={profile.location}
                    onChange={(e) =>
                      setProfile({ ...profile, location: e.target.value })
                    }
                    className={`w-full rounded-xl border p-4 outline-none font-medium focus:border-[#EAB308] ${THEME.input}`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-xs font-bold ${THEME.textMuted} uppercase mb-1`}
                  >
                    Foto de Perfil (URL)
                  </label>
                  <div className='relative'>
                    <input
                      type='url'
                      placeholder='https://...'
                      value={profile.photoUrl}
                      onChange={(e) =>
                        setProfile({ ...profile, photoUrl: e.target.value })
                      }
                      className={`w-full rounded-xl border p-4 pl-12 outline-none font-medium focus:border-[#EAB308] ${THEME.input}`}
                    />
                    <Camera
                      className={`absolute left-4 top-4 h-5 w-5 ${THEME.textMuted}`}
                    />
                  </div>
                </div>
                <div>
                  <label
                    className={`block text-xs font-bold ${THEME.textMuted} uppercase mb-1`}
                  >
                    Biografia
                  </label>
                  <textarea
                    rows={3}
                    value={profile.bio}
                    onChange={(e) =>
                      setProfile({ ...profile, bio: e.target.value })
                    }
                    className={`w-full rounded-xl border p-4 outline-none font-medium resize-none focus:border-[#EAB308] ${THEME.input}`}
                  />
                </div>
              </div>
              {/* Botão de salvar com gradiente sutil */}
              <button
                type='submit'
                disabled={isSavingProfile}
                className='w-full bg-gradient-to-br from-[#FDE047] to-[#EAB308] hover:to-[#CA8A04] text-black font-bold py-4 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50'
              >
                <Save className='h-4 w-4' />
                {isSavingProfile ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Fixed Bottom Navigation - SÓLIDO COM LEVE TRANSLUCÊNCIA - HIDDEN IN ZEN MODE */}
      {!isZenMode && (
        <nav
          className={`fixed bottom-0 left-0 right-0 border-t p-2 flex justify-around z-50 pb-safe transition-colors duration-200 backdrop-blur-sm ${
            isDarkMode
              ? 'bg-neutral-950/95 border-neutral-800'
              : 'bg-white/95 border-slate-200'
          }`}
        >
          <button
            onClick={() => handleViewChange('home')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl w-16 transition-all ${
              view === 'home' ? 'text-[#EAB308] scale-110' : THEME.textMuted
            }`}
          >
            <Home
              className='h-5 w-5'
              style={view === 'home' ? ICON_GRADIENT_STYLE : {}}
            />
            <span className='text-[10px] font-bold'>Início</span>
          </button>
          <button
            onClick={() => handleViewChange('calendar')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl w-16 transition-all ${
              view === 'calendar' ? 'text-[#EAB308] scale-110' : THEME.textMuted
            }`}
          >
            <CalendarIcon
              className='h-5 w-5'
              style={view === 'calendar' ? ICON_GRADIENT_STYLE : {}}
            />
            <span className='text-[10px] font-bold'>Calendário</span>
          </button>
          <button
            onClick={() => handleViewChange('statistics')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl w-16 transition-all ${
              view === 'statistics'
                ? 'text-[#EAB308] scale-110'
                : THEME.textMuted
            }`}
          >
            <Activity
              className='h-5 w-5'
              style={view === 'statistics' ? ICON_GRADIENT_STYLE : {}}
            />
            <span className='text-[10px] font-bold'>Estatísticas</span>
          </button>
          <button
            onClick={() => handleViewChange('history')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl w-16 transition-all ${
              view === 'history' ? 'text-[#EAB308] scale-110' : THEME.textMuted
            }`}
          >
            <History
              className='h-5 w-5'
              style={view === 'history' ? ICON_GRADIENT_STYLE : {}}
            />
            <span className='text-[10px] font-bold'>Histórico</span>
          </button>
          <button
            onClick={() => handleViewChange('profile')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl w-16 transition-all ${
              view === 'profile' ? 'text-[#EAB308] scale-110' : THEME.textMuted
            }`}
          >
            <UserIcon
              className='h-5 w-5'
              style={view === 'profile' ? ICON_GRADIENT_STYLE : {}}
            />
            <span className='text-[10px] font-bold'>Perfil</span>
          </button>
        </nav>
      )}
    </div>
  );
}
