import {
  Book,
  BookOpen,
  Brain,
  ChessQueen,
  Euro,
  FlaskConical,
  GraduationCap,
  Hourglass,
  Languages,
  Microscope,
  Puzzle,
  Quote,
  Radical,
  Sigma,
  createLucideIcon,
  type LucideIcon,
} from 'lucide-react';
import { ICON_SOLID_COLOR } from '../lib/theme';

const anthropicIcon = new URL(
  '../assets/subject-icons/anthropic.svg',
  import.meta.url
).href;

const Astroid = createLucideIcon('astroid', [
  [
    'path',
    {
      d: 'M12.983 21.186a1 1 0 0 1-1.966 0 10 10 0 0 0-8.203-8.203 1 1 0 0 1 0-1.966 10 10 0 0 0 8.203-8.203 1 1 0 0 1 1.966 0 10 10 0 0 0 8.203 8.203 1 1 0 0 1 0 1.966 10 10 0 0 0-8.203 8.203',
      key: '1tipus',
    },
  ],
]);

const SUBJECT_ICONS: Record<string, LucideIcon> = {
  Bíblia: BookOpen,
  Ciências: FlaskConical,
  Economia: Euro,
  Epistemologia: Microscope,
  Estatística: Sigma,
  Estratégia: ChessQueen,
  Filosofia: Quote,
  História: Hourglass,
  Inglês: Languages,
  'Engenharia (IA)': Astroid,
  'Inteligência Artificial': Astroid,
  Letras: Book,
  Lógica: Puzzle,
  Matemática: Radical,
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
  if (subject === 'IA | Engenharia') {
    return (
      <span
        aria-hidden='true'
        className={`${className} inline-block`}
        style={{
          backgroundColor: color,
          WebkitMaskImage: `url("${anthropicIcon}")`,
          WebkitMaskPosition: 'center',
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskSize: 'contain',
          maskImage: `url("${anthropicIcon}")`,
          maskPosition: 'center',
          maskRepeat: 'no-repeat',
          maskSize: 'contain',
        }}
      />
    );
  }

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
