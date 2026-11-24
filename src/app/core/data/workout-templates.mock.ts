import { WorkoutTemplate } from '../models/app.models';

/**
 * Dados mockados do catálogo de treinos.
 *
 * Hoje são consumidos localmente por `MockWorkoutTemplatesSource`, simulando o que viria
 * de uma API futura (ex.: `GET /api/usuarios/:id/treinos`). O formato em array (em vez de
 * um dicionário fixo por letra) já permite qualquer quantidade de treinos (A, B, C, D...).
 */
export const WORKOUT_TEMPLATES_MOCK: WorkoutTemplate[] = [
  {
    id: 'A',
    nome: 'Treino A',
    foco: 'Peito · Costas · Pernas · Ombros · Braços · Antebraço · Abdômen',
    exercicios: [
      { nome:'Supino reto (barra ou máquina)', grupoMuscular:'Peito', series:3, repeticoes:'8–12', descansoTexto:'2–3 min', descansoSegundos:150, ritmo:'2–3 s descida; subir controlado', observacao:'Ajuste banco e escápulas; amplitude confortável.' },
      { nome:'Crucifixo na máquina ou crossover', grupoMuscular:'Peito', series:1, repeticoes:'12–15', descansoTexto:'60–90 s', descansoSegundos:75, ritmo:'2 s descida; sem impulso', observacao:'Foco em controle e alongamento confortável.' },
      { nome:'Puxada frontal', grupoMuscular:'Costas', series:3, repeticoes:'8–12', descansoTexto:'2 min', descansoSegundos:120, ritmo:'Puxar cotovelos para baixo', observacao:'Evite jogar o tronco para trás.' },
      { nome:'Leg press 45°', grupoMuscular:'Quadríceps/glúteos', series:3, repeticoes:'10–12', descansoTexto:'2–3 min', descansoSegundos:150, ritmo:'Descer controlado', observacao:'Não tirar quadril do encosto.' },
      { nome:'Cadeira extensora', grupoMuscular:'Quadríceps', series:2, repeticoes:'12–15', descansoTexto:'60–90 s', descansoSegundos:75, ritmo:'Pausa breve no topo', observacao:'Sem chutar ou usar impulso.' },
      { nome:'Elevação lateral', grupoMuscular:'Ombros', series:2, repeticoes:'12–15', descansoTexto:'60–90 s', descansoSegundos:75, ritmo:'Subida controlada', observacao:'Não encolher os ombros.' },
      { nome:'Tríceps na polia', grupoMuscular:'Tríceps', series:2, repeticoes:'10–15', descansoTexto:'60–90 s', descansoSegundos:75, ritmo:'Estender sem balançar', observacao:'Cotovelos próximos ao corpo.' },
      { nome:'Rosca inversa', grupoMuscular:'Antebraço/braquiorradial', series:2, repeticoes:'12–15', descansoTexto:'60–90 s', descansoSegundos:75, ritmo:'Punho neutro; movimento controlado', observacao:'Carga leve o bastante para não roubar.' },
      { nome:'Abdominal máquina', grupoMuscular:'Abdômen', series:2, repeticoes:'12–15', descansoTexto:'60 s', descansoSegundos:60, ritmo:'Flexionar o tronco controlado', observacao:'Evite puxar com os braços.' }
    ]
  },
  {
    id: 'B',
    nome: 'Treino B',
    foco: 'Peito · Costas · Pernas · Ombros · Bíceps · Antebraço · Panturrilha',
    exercicios: [
      { nome:'Supino inclinado com halteres', grupoMuscular:'Peito', series:3, repeticoes:'8–12', descansoTexto:'2–3 min', descansoSegundos:150, ritmo:'Descer controlado; subir sem bater halteres', observacao:'Inclinação moderada do banco.' },
      { nome:'Crucifixo na máquina ou crossover', grupoMuscular:'Peito', series:1, repeticoes:'12–15', descansoTexto:'60–90 s', descansoSegundos:75, ritmo:'Movimento controlado', observacao:'Não forçar amplitude dolorosa.' },
      { nome:'Remada baixa', grupoMuscular:'Costas', series:3, repeticoes:'8–12', descansoTexto:'2 min', descansoSegundos:120, ritmo:'Puxar cotovelos para trás', observacao:'Evite impulso e excesso de balanço.' },
      { nome:'Agachamento no Smith', grupoMuscular:'Quadríceps/glúteos', series:3, repeticoes:'8–12', descansoTexto:'2–3 min', descansoSegundos:150, ritmo:'Descer controlado', observacao:'Use amplitude que mantenha boa postura.' },
      { nome:'Mesa flexora', grupoMuscular:'Posterior de coxa', series:3, repeticoes:'10–15', descansoTexto:'60–90 s', descansoSegundos:75, ritmo:'Flexionar sem tirar quadril do apoio', observacao:'Controle a volta.' },
      { nome:'Desenvolvimento de ombros', grupoMuscular:'Ombros', series:2, repeticoes:'8–12', descansoTexto:'2 min', descansoSegundos:120, ritmo:'Subir sem hiperestender lombar', observacao:'Pode usar máquina se mais confortável.' },
      { nome:'Rosca direta', grupoMuscular:'Bíceps', series:2, repeticoes:'10–15', descansoTexto:'60–90 s', descansoSegundos:75, ritmo:'Cotovelos estáveis', observacao:'Evite balanço do tronco.' },
      { nome:'Flexão de punho', grupoMuscular:'Antebraço/flexores', series:2, repeticoes:'12–15', descansoTexto:'60 s', descansoSegundos:60, ritmo:'Movimento curto e controlado', observacao:'Antebraço apoiado; sem dor no punho.' },
      { nome:'Panturrilha (máquina)', grupoMuscular:'Panturrilhas', series:2, repeticoes:'12–15', descansoTexto:'60–90 s', descansoSegundos:75, ritmo:'Pausa no alongamento e no topo', observacao:'Amplitude controlada.' }
    ]
  }
];
