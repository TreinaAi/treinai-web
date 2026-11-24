import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkoutTemplate } from '../../core/models/app.models';
import { RestTimerService } from '../../core/services/rest-timer.service';
import { ToastService } from '../../core/services/toast.service';
import { TreinoDataService } from '../../core/services/treino-data.service';

@Component({
  selector: 'app-workout',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './workout.html',
  styleUrl: './workout.css'
})
export class WorkoutComponent {
  public db = inject(TreinoDataService);
  private restTimer = inject(RestTimerService);
  private toast = inject(ToastService);

  /** Foco resumido (3 grupos musculares) usado na tela de escolha do treino. */
  focoResumo(template: WorkoutTemplate): string {
    return template.foco.split(' · ').slice(0, 3).join(' · ');
  }

  contarConcluidas(indiceExercicio: number): number {
    const draft = this.db.draft();
    if (!draft) return 0;
    return draft.entradas[indiceExercicio].sets.filter(s => s.concluida).length;
  }

  iniciar(templateId: string) {
    this.db.startSession(templateId);
    this.toast.show(`${this.db.templateNome(templateId)} iniciado 💪`);
  }

  toggleExpand(indiceExercicio: number) {
    this.db.updateDraft(d => {
      d.entradas[indiceExercicio].expandido = !d.entradas[indiceExercicio].expandido;
    });
  }

  updateSet(indiceExercicio: number, indiceSet: number, campo: 'kg' | 'reps', valor: string) {
    this.db.updateDraft(d => {
      d.entradas[indiceExercicio].sets[indiceSet][campo] = valor;
    });
  }

  toggleSetDone(indiceExercicio: number, indiceSet: number) {
    const draft = this.db.draft();
    const template = this.db.draftTemplate();
    if (!draft || !template) return;

    const concluida = !draft.entradas[indiceExercicio].sets[indiceSet].concluida;

    this.db.updateDraft(d => {
      d.entradas[indiceExercicio].sets[indiceSet].concluida = concluida;
    });

    if (concluida) {
      const ex = template.exercicios[indiceExercicio];
      this.restTimer.start(ex.descansoSegundos, `Descanso · ${ex.nome}`);
    }
  }

  descartar() {
    if (confirm('Descartar esta sessão? Os dados registrados serão perdidos.')) {
      this.db.cancelSession();
      this.restTimer.stop();
    }
  }

  finalizar() {
    const ok = this.db.finishSession();
    if (!ok) {
      alert('Registre pelo menos uma série antes de finalizar.');
      return;
    }
    this.restTimer.stop();
    this.toast.show('Treino salvo! 💪');
  }
}
