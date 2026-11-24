import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { MockWorkoutTemplatesSource } from './core/services/mock-workout-templates.source';
import { WorkoutTemplatesSource } from './core/services/workout-templates.source';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // Fonte do catálogo de treinos. Para integrar com uma API real no futuro, troque apenas
    // esta linha (ex.: `{ provide: WorkoutTemplatesSource, useClass: HttpWorkoutTemplatesSource }`).
    { provide: WorkoutTemplatesSource, useClass: MockWorkoutTemplatesSource }
  ]
};
