import {
  Ampersands,
  BookOpen,
  Brain,
  CaseUpper,
  ChessQueen,
  CodeXml,
  DollarSign,
  FlaskConical,
  GraduationCap,
  Languages,
  Lightbulb,
  Microscope,
  Radical,
  ScrollText,
  Sigma,
  type LucideIcon,
} from 'lucide-react';
import { ICON_SOLID_COLOR } from '../lib/theme';

const SUBJECT_ICONS: Record<string, LucideIcon> = {
  Bíblia: BookOpen,
  Ciências: FlaskConical,
  Economia: DollarSign,
  Epistemologia: Microscope,
  Estatística: Sigma,
  Estratégia: ChessQueen,
  Filosofia: Lightbulb,
  História: ScrollText,
  Inglês: Languages,
  'Engenharia (IA)': CodeXml,
  Lógica: Ampersands,
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
