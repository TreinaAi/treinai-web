import { Component } from '@angular/core';

@Component({
  selector: 'app-guide',
  standalone: true,
  templateUrl: './guide.html',
  styleUrl: './guide.css'
})
export class GuideComponent {
  public dicas = [
    { titulo: 'Frequência', texto: '3 sessões por semana, por exemplo: segunda (A), quarta (B), sexta (A).' },
    { titulo: 'Descanso', texto: 'Compostos: 2–3 min. Isoladores: 60–90 s. Mantenha a qualidade das séries.' },
    { titulo: 'Intensidade', texto: 'Comece com 2–3 repetições em reserva (RIR 2–3), sem chegar à falha.' },
    { titulo: 'Progressão', texto: 'Bateu o topo das repetições em todas as séries? Aumente o peso na próxima.' }
  ];
}
