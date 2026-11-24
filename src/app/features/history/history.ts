import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Session } from '../../core/models/app.models';
import { ToastService } from '../../core/services/toast.service';
import { TreinoDataService } from '../../core/services/treino-data.service';
import { parseNumber } from '../../core/utils/format.util';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './history.html',
  styleUrl: './history.css'
})
export class HistoryComponent {
  public db = inject(TreinoDataService);
  private toast = inject(ToastService);

  private abertas = signal<Set<number>>(new Set());

  sessoesOrdenadas(): Session[] {
    return [...this.db.sessions()].reverse();
  }

  isAberta(id: number): boolean {
    return this.abertas().has(id);
  }

  toggle(id: number) {
    const atual = new Set(this.abertas());
    if (atual.has(id)) {
      atual.delete(id);
    } else {
      atual.add(id);
    }
    this.abertas.set(atual);
  }

  contarSeries(sessao: Session): number {
    return sessao.entradas.reduce((total, e) => total + e.sets.length, 0);
  }

  calcularVolume(sessao: Session): number {
    const volume = sessao.entradas.reduce(
      (total, e) => total + e.sets.reduce((soma, s) => soma + (parseNumber(s.kg) ?? 0) * (parseNumber(s.reps) ?? 0), 0),
      0
    );
    return Math.round(volume);
  }

  excluir(id: number) {
    if (confirm('Excluir esta sessão do histórico?')) {
      this.db.deleteSession(id);
      this.toast.show('Sessão excluída');
    }
  }

  exportar() {
    this.db.exportCSV();
  }
}
