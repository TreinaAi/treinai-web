import { Service } from '@angular/core';
import { WORKOUT_TEMPLATES_MOCK } from '../data/workout-templates.mock';
import { WorkoutTemplate } from '../models/app.models';
import { WorkoutTemplatesSource } from './workout-templates.source';

/**
 * Implementação mock de `WorkoutTemplatesSource`, usada enquanto não existe uma API real.
 * Simula a latência de uma chamada de rede para que estados de carregamento/erro já possam
 * ser tratados pela UI desde já.
 */
@Service()
export class MockWorkoutTemplatesSource implements WorkoutTemplatesSource {
  /** Latência artificial (ms) só para simular uma chamada de API real. Ajuste ou remova à vontade. */
  private readonly latenciaMs = 300;

  fetchTemplates(): Promise<WorkoutTemplate[]> {
    return new Promise(resolve => {
      setTimeout(() => resolve(structuredClone(WORKOUT_TEMPLATES_MOCK)), this.latenciaMs);
    });
  }
}
