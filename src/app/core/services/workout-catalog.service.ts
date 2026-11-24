import { Service, computed, inject, signal } from '@angular/core';
import { WorkoutTemplate } from '../models/app.models';
import { WorkoutTemplatesSource } from './workout-templates.source';

/**
 * Catálogo de treinos disponíveis para o usuário.
 *
 * Isolado de `TreinoDataService` (que cuida do histórico/sessão local do usuário) porque,
 * no futuro, este catálogo passará a ser carregado de uma API vinculada ao usuário logado —
 * basta trocar o provider de `WorkoutTemplatesSource` em `app.config.ts`, sem alterar este
 * serviço nem os componentes que o consomem.
 */
@Service()
export class WorkoutCatalogService {
  private source = inject(WorkoutTemplatesSource);

  private readonly _templates = signal<WorkoutTemplate[]>([]);
  private readonly _loading = signal(true);
  private readonly _error = signal<string | null>(null);

  public readonly templates = this._templates.asReadonly();
  public readonly loading = this._loading.asReadonly();
  public readonly error = this._error.asReadonly();

  /** Primeiro treino do catálogo, usado como ponto de partida quando ainda não há histórico. */
  public readonly primeiroTreino = computed<WorkoutTemplate | null>(() => this._templates()[0] ?? null);

  constructor() {
    this.load();
  }

  templateById(id: string): WorkoutTemplate | undefined {
    return this._templates().find(t => t.id === id);
  }

  /** Nome amigável do treino, com fallback para o próprio id caso ainda não tenha carregado. */
  templateNome(id: string): string {
    return this.templateById(id)?.nome ?? id;
  }

  /** Recarrega o catálogo (ex.: botão "tentar novamente" após falha de rede). */
  reload(): Promise<void> {
    return this.load();
  }

  private async load(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const templates = await this.source.fetchTemplates();
      this._templates.set(templates);
    } catch (e) {
      console.error('Erro ao carregar catálogo de treinos', e);
      this._error.set('Não foi possível carregar os treinos. Tente novamente.');
    } finally {
      this._loading.set(false);
    }
  }
}
