import { WorkoutTemplate } from '../models/app.models';

/**
 * Porta de acesso ao catálogo de treinos do usuário.
 *
 * Hoje é implementada por `MockWorkoutTemplatesSource` (dados locais). No futuro, quando os
 * treinos passarem a vir de uma API vinculada ao usuário autenticado, basta criar uma nova
 * implementação (ex.: `HttpWorkoutTemplatesSource` usando `HttpClient`) e trocar o provider
 * em `app.config.ts` — nenhum componente ou serviço consumidor (`WorkoutCatalogService`,
 * `TreinoDataService`, telas de treino/histórico) precisa ser alterado.
 *
 * É uma classe abstrata (em vez de uma `interface`) porque interfaces TypeScript não existem
 * em tempo de execução e não podem ser usadas como token de injeção de dependência.
 */
export abstract class WorkoutTemplatesSource {
  abstract fetchTemplates(): Promise<WorkoutTemplate[]>;
}
