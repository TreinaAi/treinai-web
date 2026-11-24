export interface ExerciseDef {
  nome: string;
  grupoMuscular: string;
  series: number;
  repeticoes: string;
  descansoTexto: string;
  descansoSegundos: number;
  ritmo: string;
  observacao: string;
}

export interface WorkoutTemplate {
  nome: string;
  foco: string;
  exercicios: ExerciseDef[];
}

export interface SetData {
  kg: string;
  reps: string;
  concluida: boolean;
}

export interface ExerciseEntry {
  indiceExercicio: number;
  sets: SetData[];
  rir: string;
  descansoUsado: string;
  observacoes: string;
  expandido: boolean; // Controla se o card está aberto ou fechado
}

export interface DraftSession {
  id: number;
  data: string;
  treino: 'A' | 'B';
  semana: number;
  entradas: ExerciseEntry[];
}

export interface Session extends Omit<DraftSession, 'entradas'> {
  entradas: {
    exercicio: string;
    grupoMuscular: string;
    sets: { kg: string; reps: string }[];
    rir: string;
    descansoUsado: string;
    observacoes: string;
  }[];
}

export interface Measurement {
  id: number;
  data: string;
  peso: string;
  cintura: string;
  peito: string;
  braco: string;
  coxa: string;
  sono: string;
  observacoes: string;
}
