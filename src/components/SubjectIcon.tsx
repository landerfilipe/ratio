import {
  ALargeSmall,
  BookOpen,
  Brain,
  ChessPawn,
  CircleDollarSign,
  FlaskConical,
  GraduationCap,
  Languages,
  Lightbulb,
  Puzzle,
  Radical,
  ScrollText,
  Search,
  Sigma,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { ICON_SOLID_COLOR } from '../lib/theme';

const SUBJECT_ICONS: Record<string, LucideIcon> = {
  Bíblia: BookOpen,
  Ciências: FlaskConical,
  Economia: CircleDollarSign,
  Epistemologia: Search,
  Estatística: Sigma,
  Estratégia: ChessPawn,
  Filosofia: Lightbulb,
  História: ScrollText,
  Inglês: Languages,
  'Engenharia (IA)': Sparkles,
  Lógica: Puzzle,
  Matemática: Radical,
  Português: ALargeSmall,
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
