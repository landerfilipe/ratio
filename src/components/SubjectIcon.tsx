import {
  Binary,
  BookOpen,
  Brain,
  ChartBar,
  CircleDollarSign,
  Cpu,
  Crosshair,
  FlaskConical,
  GraduationCap,
  Languages,
  LetterText,
  Lightbulb,
  ScrollText,
  SearchCheck,
  Sigma,
  type LucideIcon,
} from 'lucide-react';
import { ICON_SOLID_COLOR } from '../lib/theme';

const SUBJECT_ICONS: Record<string, LucideIcon> = {
  Bíblia: BookOpen,
  Ciências: FlaskConical,
  Economia: CircleDollarSign,
  Epistemologia: SearchCheck,
  Estatística: ChartBar,
  Estratégia: Crosshair,
  Filosofia: Lightbulb,
  História: ScrollText,
  Inglês: Languages,
  'Inteligência Artificial': Cpu,
  Lógica: Binary,
  Matemática: Sigma,
  Português: LetterText,
  'Provas e Carreira': GraduationCap,
  Psicologia: Brain,
};

interface SubjectIconProps {
  subject: string;
  className?: string;
  color?: string;
}

export const SubjectIcon = ({
  subject,
  className = 'h-4 w-4',
  color = ICON_SOLID_COLOR,
}: SubjectIconProps) => {
  const Icon = SUBJECT_ICONS[subject] ?? BookOpen;

  return (
    <Icon
      aria-hidden='true'
      className={className}
      focusable='false'
      style={{ color, stroke: color }}
    />
  );
};
