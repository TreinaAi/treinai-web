import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent, // A moldura (topbar + tabbar)
    children: [
      { path: '', redirectTo: 'workout', pathMatch: 'full' }, // Se acessar a raiz, vai para o treino
      { 
        path: 'workout', 
        loadComponent: () => import('./features/workout/workout').then(m => m.WorkoutComponent) 
      },
      { 
        path: 'history', 
        loadComponent: () => import('./features/history/history').then(m => m.HistoryComponent) 
      },
      { 
        path: 'evolution', 
        loadComponent: () => import('./features/evolution/evolution').then(m => m.EvolutionComponent) 
      },
      { 
        path: 'guide', 
        loadComponent: () => import('./features/guide/guide').then(m => m.GuideComponent) 
      }
    ]
  },
  { path: '**', redirectTo: 'workout' } // Se digitar qualquer URL errada, volta pro treino
];