import {
  BookOpen,
  Brain,
  CaseUpper,
  ChessQueen,
  Euro,
  FlaskConical,
  GraduationCap,
  Languages,
  Lightbulb,
  Microscope,
  MoveHorizontal,
  Radical,
  ScrollText,
  Sigma,
  Terminal,
  type LucideIcon,
} from 'lucide-react';
import { ICON_SOLID_COLOR } from '../lib/theme';

const SUBJECT_ICONS: Record<string, LucideIcon> = {
  Bíblia: BookOpen,
  Ciências: FlaskConical,
  Economia: Euro,
  Epistemologia: Microscope,
  Estatística: Sigma,
  Estratégia: ChessQueen,
  Filosofia: Lightbulb,
  História: ScrollText,
  Inglês: Languages,
  'Engenharia (IA)': Terminal,
  Lógica: MoveHorizontal,
  Matemática: Radical,
  Português: CaseUpper,
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
