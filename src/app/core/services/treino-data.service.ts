import { signal, computed, effect, inject, Service } from '@angular/core';
import { DraftSession, Session, Measurement } from '../models/app.models';
import { todayISO } from '../utils/format.util';
import { WorkoutCatalogService } from './workout-catalog.service';

const KEY = 'treinai_app_v1';

@Service()
export class TreinoDataService {
  private catalog = inject(WorkoutCatalogService);

  /** Catálogo de treinos disponíveis (hoje mockado, no futuro vindo de uma API). */
  public readonly templates = this.catalog.templates;
  public readonly templatesLoading = this.catalog.loading;
  public readonly templatesError = this.catalog.error;

  public readonly sessions = signal<Session[]>([]);
  public readonly evo = signal<Measurement[]>([]);
  public readonly draft = signal<DraftSession | null>(null);

  /** Última sessão registrada (a mais recente do histórico), ou `null` se nunca treinou. */
  public readonly ultimaSessao = computed<Session | null>(() => {
    const sessions = this.sessions();
    return sessions.length ? sessions[sessions.length - 1] : null;
  });

  /**
   * Próximo treino sugerido, seguindo a ordem do catálogo (A → B → C → ... → A...) com base
   * no treino da última sessão. Funciona com qualquer quantidade de treinos, não só A/B.
   */
  public readonly proximoTreino = computed<string | null>(() => {
    const templates = this.templates();
    if (!templates.length) return null;

    const ultima = this.ultimaSessao();
    if (!ultima) return templates[0].id;

    const indiceAtual = templates.findIndex(t => t.id === ultima.treino);
    if (indiceAtual === -1) return templates[0].id;

    return templates[(indiceAtual + 1) % templates.length].id;
  });

  /** Template do treino em andamento (draft), já resolvido a partir do catálogo. */
  public readonly draftTemplate = computed(() => {
    const d = this.draft();
    return d ? (this.catalog.templateById(d.treino) ?? null) : null;
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

  templateById(id: string) {
    return this.catalog.templateById(id);
  }

  /** Nome amigável do treino (ex.: "Treino A"), com fallback para o id caso ainda não tenha carregado. */
  templateNome(id: string): string {
    return this.catalog.templateNome(id);
  }

  /** Recarrega o catálogo de treinos (ex.: botão "tentar novamente" após falha de carregamento). */
  recarregarTemplates(): Promise<void> {
    return this.catalog.reload();
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

  startSession(templateId: string) {
    const template = this.catalog.templateById(templateId);
    if (!template) {
      console.error(`Treino "${templateId}" não encontrado no catálogo.`);
      return;
    }

    const ultimaSemana = this.sessions().length ? (this.sessions()[this.sessions().length - 1].semana || 1) : 1;

    const entradas = template.exercicios.map((ex, i) => {
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
      treino: templateId,
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

    const template = this.catalog.templateById(d.treino);
    if (!template) return false;

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
          const ex = template.exercicios[en.indiceExercicio];
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
