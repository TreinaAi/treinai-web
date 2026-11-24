import { Component, inject } from '@angular/core';
import { TreinoDataService } from '../../core/services/treino-data.service';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-evolution',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './evolution.html',
  styleUrl: './evolution.css'
})
export class EvolutionComponent {
  public db = inject(TreinoDataService);
  
  // Objeto temporário para o formulário
  public novaMedicao: any = {
    data: this.todayISO(),
    peso: '', cintura: '', peito: '', braco: '', coxa: '', sono: '', observacoes: ''
  };

  salvar() {
    if (!this.novaMedicao.peso && !this.novaMedicao.cintura) {
      alert('Preencha pelo menos o peso ou a cintura.');
      return;
    }
    
    this.db.addEvo({
      data: this.novaMedicao.data,
      peso: this.novaMedicao.peso,
      cintura: this.novaMedicao.cintura,
      peito: this.novaMedicao.peito,
      braco: this.novaMedicao.braco,
      coxa: this.novaMedicao.coxa,
      sono: this.novaMedicao.sono,
      observacoes: this.novaMedicao.observacoes
    });
    
    // Limpa o formulário
    this.novaMedicao = { data: this.todayISO(), peso: '', cintura: '', peito: '', braco: '', coxa: '', sono: '', observacoes: '' };
  }

  private todayISO() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }
}
