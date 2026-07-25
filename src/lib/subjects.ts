// --- Lista Fixa de Disciplinas ---
export const FIXED_SUBJECTS = [
   'Bíblia',
   'Ciências',
   'Economia',
   'Epistemologia',
   'Estatística',
   'Estratégia',
   'Filosofia',
   'História',
   'Inglês',
   'Engenharia (IA)',
   'Lógica',
   'Matemática',
   'Português',
   'Provas e Carreira',
   'Psicologia',
].sort();

const SUBJECT_ALIASES: Record<string, string> = {
   'Inteligência Artificial': 'Engenharia (IA)',
};

export const canonicalizeSubject = (subject: string): string =>
   SUBJECT_ALIASES[subject] ?? subject;
