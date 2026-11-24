import { signal, computed, effect, Service } from '@angular/core';
import { DraftSession, Session, Measurement, WorkoutTemplate } from '../models/app.models';
import { todayISO } from '../utils/format.util';

const KEY = 'treinai_app_v1';

const TREINOS: Record<'A' | 'B', WorkoutTemplate> = {
  A: {
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
  B: {
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
};

@Service()
export class TreinoDataService {
  public readonly templates = signal(TREINOS);
  public readonly sessions = signal<Session[]>([]);
  public readonly evo = signal<Measurement[]>([]);
  public readonly draft = signal<DraftSession | null>(null);

  /** Última sessão registrada (a mais recente do histórico), ou `null` se nunca treinou. */
  public readonly ultimaSessao = computed<Session | null>(() => {
    const sessions = this.sessions();
    return sessions.length ? sessions[sessions.length - 1] : null;
  });

  /** Próximo treino sugerido, alternando A/B com base na última sessão registrada. */
  public readonly proximoTreino = computed<'A' | 'B'>(() => {
    const ultima = this.ultimaSessao();
    return ultima ? (ultima.treino === 'A' ? 'B' : 'A') : 'A';
  });

  constructor() {
    this.loadFromStorage();
    
    effect(() => {
      const state = {
        sessions: this.sessions(),
        evo: this.evo(),
        draft: this.draft()
      };
      localStorage.setItem(KEY, JSON.stringify(state));
    });
  }

  private loadFromStorage() {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        this.sessions.set(parsed.sessions || []);
        this.evo.set(parsed.evo || []);
        this.draft.set(parsed.draft || null);
      } catch (e) {
        console.error('Erro ao carregar dados', e);
      }
    }
  }

  startSession(treino: 'A' | 'B') {
    const t = this.templates()[treino];
    const ultimaSemana = this.sessions().length ? (this.sessions()[this.sessions().length - 1].semana || 1) : 1;

    const entradas = t.exercicios.map((ex, i) => {
      const anterior = this.ultimaExecucao(ex.nome);
      return {
        indiceExercicio: i,
        sets: Array.from({ length: ex.series }, (_, si) => ({
          kg: anterior?.[si]?.kg ?? '',
          reps: anterior?.[si]?.reps ?? '',
          concluida: false
        })),
        rir: '',
        descansoUsado: '',
        observacoes: '',
        expandido: true
      };
    });

    this.draft.set({
      id: Date.now(),
      data: todayISO(),
      treino,
      semana: ultimaSemana,
      entradas
    });
  }

  /** Busca, do histórico mais recente para o mais antigo, as séries realizadas em um exercício. */
  private ultimaExecucao(nomeExercicio: string): { kg: string; reps: string }[] | null {
    const sessions = this.sessions();
    for (let i = sessions.length - 1; i >= 0; i--) {
      const entrada = sessions[i].entradas.find(e => e.exercicio === nomeExercicio);
      if (entrada && entrada.sets.length) return entrada.sets;
    }
    return null;
  }

  updateDraft(updater: (draft: DraftSession) => void) {
    const current = this.draft();
    if (current) {
      const copy = structuredClone(current);
      updater(copy);
      this.draft.set(copy);
    }
  }

  /** Finaliza o treino em andamento. Retorna `false` se nenhuma série foi registrada. */
  finishSession(): boolean {
    const d = this.draft();
    if (!d) return false;

    const temDados = d.entradas.some(en =>
      en.sets.some(s => (s.kg !== '' && s.kg != null) || (s.reps !== '' && s.reps != null) || s.concluida)
    );
    if (!temDados) return false;

    const newSession: Session = {
      id: d.id,
      data: d.data,
      semana: d.semana,
      treino: d.treino,
      entradas: d.entradas
        .map(en => {
          const ex = this.templates()[d.treino].exercicios[en.indiceExercicio];
          return {
            exercicio: ex.nome,
            grupoMuscular: ex.grupoMuscular,
            sets: en.sets.filter(s => s.kg || s.reps || s.concluida).map(s => ({ kg: s.kg, reps: s.reps })),
            rir: en.rir,
            descansoUsado: en.descansoUsado,
            observacoes: en.observacoes
          };
        })
        .filter(en => en.sets.length > 0)
    };

    this.sessions.update(prev => [...prev, newSession]);
    this.draft.set(null);
    return true;
  }

  cancelSession() {
    this.draft.set(null);
  }

  deleteSession(id: number) {
    this.sessions.update(prev => prev.filter(s => s.id !== id));
  }

  addEvo(measurement: Omit<Measurement, 'id'>) {
    this.evo.update(prev => [...prev, { ...measurement, id: Date.now() }]);
  }

  removeEvo(id: number) {
    this.evo.update(prev => prev.filter(m => m.id !== id));
  }

  /** Apaga sessões, medições e o treino em andamento. Não pode ser desfeito. */
  resetAll() {
    this.sessions.set([]);
    this.evo.set([]);
    this.draft.set(null);
  }

  /** Exporta sessões de treino e medições corporais em um arquivo CSV. */
  exportCSV() {
    if (!this.sessions().length && !this.evo().length) {
      alert('Não há dados para exportar ainda.');
      return;
    }

    const linhas: (string | number)[][] = [
      ['Data', 'Semana', 'Treino', 'Exercício', 'Grupo', 'Séries (kg × reps)', 'RIR final', 'Descanso', 'Observações']
    ];

    [...this.sessions()]
      .sort((a, b) => (a.data > b.data ? 1 : -1))
      .forEach(s => s.entradas.forEach(en => {
        linhas.push([
          s.data, s.semana, s.treino, en.exercicio, en.grupoMuscular,
          en.sets.map(x => `${x.kg || '–'}x${x.reps || '–'}`).join(' | '),
          en.rir, en.descansoUsado, en.observacoes
        ]);
      }));

    linhas.push([]);
    linhas.push(['EVOLUÇÃO CORPORAL']);
    linhas.push(['Data', 'Peso (kg)', 'Cintura (cm)', 'Peito (cm)', 'Braço (cm)', 'Coxa (cm)', 'Sono (h)', 'Observações']);
    [...this.evo()]
      .sort((a, b) => (a.data > b.data ? 1 : -1))
      .forEach(e => linhas.push([e.data, e.peso, e.cintura, e.peito, e.braco, e.coxa, e.sono, e.observacoes]));

    const csv = linhas
      .map(linha => linha.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `treinai_${todayISO()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
