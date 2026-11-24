import { Component, inject } from '@angular/core';
import { TreinoDataService } from '../../core/services/treino-data.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-workout',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './workout.html',
  styleUrl: './workout.css'
})
export class WorkoutComponent {
  public db = inject(TreinoDataService);
  public readonly abasTreino: ('A' | 'B')[] = ['A', 'B'];

  updateSet(indiceExercicio: number, indiceSet: number, campo: 'kg' | 'reps', valor: string) {
    this.db.updateDraft(d => {
      d.entradas[indiceExercicio].sets[indiceSet][campo] = valor;
    });
  }

  toggleSetDone(indiceExercicio: number, indiceSet: number) {
    this.db.updateDraft(d => {
      const set = d.entradas[indiceExercicio].sets[indiceSet];
      set.concluida = !set.concluida;
    });
  }
}
