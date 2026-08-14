import {
  BookOpen,
  Brain,
  ChessQueen,
  Cpu,
  Euro,
  FlaskConical,
  GraduationCap,
  Microscope,
  PenTool,
  Quote,
  Radical,
  type LucideIcon,
} from 'lucide-react';
import { ICON_SOLID_COLOR } from '../lib/theme';

const atlasIcon = new URL(
  '../assets/subject-icons/atlas.svg',
  import.meta.url
).href;
const latinCrossIcon = new URL(
  '../assets/subject-icons/cruz-latina.svg',
  import.meta.url
).href;
const CUSTOM_SUBJECT_ICONS: Record<string, string> = {
  Bíblia: latinCrossIcon,
  'Estudos Sociais': atlasIcon,
};

const SUBJECT_ICONS: Record<string, LucideIcon> = {
  Ciências: FlaskConical,
  Economia: Euro,
  Epistemologia: Microscope,
  Estratégia: ChessQueen,
  Filosofia: Quote,
  Linguagem: PenTool,
  Matemática: Radical,
  'Provas e Carreira': GraduationCap,
  Psicologia: Brain,
  Tecnologia: Cpu,
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
  const customIcon = CUSTOM_SUBJECT_ICONS[subject];

  if (customIcon) {
    return (
      <span
        aria-hidden='true'
        className={`${className} inline-block`}
        style={{
          backgroundColor: color,
          WebkitMaskImage: `url("${customIcon}")`,
          WebkitMaskPosition: 'center',
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskSize: 'contain',
          maskImage: `url("${customIcon}")`,
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
