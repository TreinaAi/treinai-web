import { Component, inject } from '@angular/core';
import { ToastService } from '../../core/services/toast.service';
import { TreinoDataService } from '../../core/services/treino-data.service';

@Component({
  selector: 'app-guide',
  standalone: true,
  templateUrl: './guide.html',
  styleUrl: './guide.css'
})
export class GuideComponent {
  private db = inject(TreinoDataService);
  private toast = inject(ToastService);

  public guia: [string, string][] = [
    ['Como usar', 'Siga os treinos A e B alternando a sequência. Registre cada sessão na aba Treino. Atualize peso e medidas na aba Evolução.'],
    ['Frequência', '3 sessões por semana, por exemplo: segunda (A), quarta (B), sexta (A). Na semana seguinte: B, A, B.'],
    ['Prioridade', 'Peito aparece sempre no começo. Antebraço entra no final, com trabalho de flexores e extensores.'],
    ['Descanso', 'Compostos: 2–3 min. Isoladores: 60–90 s. Abdômen e panturrilha: 60–90 s. Use o descanso completo para manter a qualidade das séries.'],
    ['Aquecimento', '5–8 min leve + 2–4 séries progressivas de aquecimento no primeiro exercício de peito. As séries de aquecimento não contam como séries efetivas.'],
    ['Intensidade', 'Comece com 2–3 repetições em reserva (RIR 2–3), sem chegar à falha. Nas primeiras 2 semanas, reduza para 2 séries por exercício se estiver muito destreinado.'],
    ['Progressão', 'Quando atingir o topo da faixa de repetições em todas as séries com técnica e RIR adequado, aumente a carga pelo menor incremento disponível e volte ao início da faixa.'],
    ['Exemplo 1', 'Supino 3×8–12: fez 12, 12 e 12 com boa técnica? Na próxima sessão, aumente um pouco a carga.'],
    ['Exemplo 2', 'Rosca inversa 2×12–15: fez 15 e 13? Mantenha a carga e tente somar repetições na próxima vez.'],
    ['Segurança', 'Interrompa se houver dor aguda, tontura ou perda de controle do movimento. Ajuste exercícios a lesões/restrições com profissional habilitado.'],
    ['Nota importante', 'Este é um modelo inicial, não uma prescrição clínica. O volume e a frequência devem ser ajustados conforme recuperação, experiência atual e disponibilidade.']
  ];

  public parametros: [string, string, string][] = [
    ['Aquecimento geral', '5–8 minutos', 'Bicicleta, esteira ou elíptico em intensidade leve.'],
    ['Aquecimento específico', '2–4 séries progressivas', 'Antes do primeiro exercício de peito; aumentar a carga sem fadigar.'],
    ['Exercícios compostos', '2–3 minutos', 'Supinos, leg press, agachamento, puxada e remada.'],
    ['Exercícios isoladores', '60–90 segundos', 'Crucifixo, extensora, elevação lateral, braços e antebraço.'],
    ['Abdômen / panturrilha', '60–90 segundos', 'Descanse mais se a execução ou as repetições caírem muito.'],
    ['RIR', '2–3', 'Terminar a série sentindo que ainda faria 2–3 repetições corretas.'],
    ['Progressão de carga', 'Dupla progressão', 'Primeiro aumente repetições dentro da faixa; depois suba o menor incremento de carga.'],
    ['Primeiras 2 semanas', 'Reduzir volume se necessário', 'Se houver muita dor muscular/fadiga, faça 2 séries por exercício e mantenha RIR 3–4.'],
    ['Sinais para ajustar', 'Dor persistente, queda de desempenho, fadiga acumulada', 'Reduza volume/carga e procure avaliação se houver dor ou limitação.']
  ];

  exportar() {
    this.db.exportCSV();
  }

  apagarTudo() {
    if (confirm('Apagar TODOS os dados (treinos, histórico e medições)? Essa ação não pode ser desfeita.')) {
      this.db.resetAll();
      this.toast.show('Dados apagados');
    }
  }
}
