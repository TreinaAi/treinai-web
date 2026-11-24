import { Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Measurement } from '../../core/models/app.models';
import { ToastService } from '../../core/services/toast.service';
import { TreinoDataService } from '../../core/services/treino-data.service';
import { parseNumber, todayISO } from '../../core/utils/format.util';

interface Ponto {
  data: string;
  valor: number;
}

interface GraficoPeso {
  viewBox: string;
  area: string;
  linha: string;
  pontos: { x: number; y: number }[];
  inicio: string;
  fim: string;
}

interface Resumo {
  ultima: Measurement;
  deltaPeso: number | null;
  deltaCintura: number | null;
  deltaBraco: number | null;
}

@Component({
  selector: 'app-evolution',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './evolution.html',
  styleUrl: './evolution.css'
})
export class EvolutionComponent {
  public db = inject(TreinoDataService);
  private toast = inject(ToastService);

  public novaMedicao = this.medicaoVazia();

  public listaOrdenada = computed(() => [...this.db.evo()].sort((a, b) => (a.data < b.data ? 1 : -1)));

  public resumo = computed<Resumo | null>(() => {
    const lista = this.listaOrdenada();
    if (!lista.length) return null;
    const ultima = lista[0];
    const primeira = lista[lista.length - 1];
    return {
      ultima,
      deltaPeso: this.delta(primeira.peso, ultima.peso),
      deltaCintura: this.delta(primeira.cintura, ultima.cintura),
      deltaBraco: this.delta(primeira.braco, ultima.braco)
    };
  });

  public chart = computed<GraficoPeso | null>(() => {
    const pontos: Ponto[] = [...this.listaOrdenada()]
      .reverse()
      .map(e => ({ data: e.data, valor: parseNumber(e.peso) }))
      .filter((p): p is Ponto => p.valor !== null);
    return this.construirGrafico(pontos);
  });

  salvar() {
    const m = this.novaMedicao;
    if (!m.peso && !m.cintura && !m.peito && !m.braco && !m.coxa) {
      alert('Preencha pelo menos uma medida.');
      return;
    }
    this.db.addEvo({ ...m, data: m.data || todayISO() });
    this.novaMedicao = this.medicaoVazia();
    this.toast.show('Medição salva 📈');
  }

  excluir(id: number) {
    if (confirm('Excluir esta medição?')) {
      this.db.removeEvo(id);
    }
  }

  /** Classe CSS (up/down/same) da variação. `inverter` troca o sentido "bom" (ex.: cintura menor é melhor). */
  variacaoClasse(delta: number | null, inverter = false): string {
    if (delta === null || Math.abs(delta) < 0.05) return 'same';
    return (delta > 0) !== inverter ? 'up' : 'down';
  }

  variacaoTexto(delta: number | null): string {
    if (delta === null) return '—';
    if (Math.abs(delta) < 0.05) return 'sem variação';
    return `${delta > 0 ? '+' : ''}${delta.toFixed(1)} desde o início`;
  }

  private delta(a: string, b: string): number | null {
    const na = parseNumber(a);
    const nb = parseNumber(b);
    if (na === null || nb === null) return null;
    return nb - na;
  }

  private medicaoVazia(): Omit<Measurement, 'id'> {
    return { data: todayISO(), peso: '', cintura: '', peito: '', braco: '', coxa: '', sono: '', observacoes: '' };
  }

  private construirGrafico(pontos: Ponto[]): GraficoPeso | null {
    if (pontos.length < 2) return null;

    const largura = 340;
    const altura = 130;
    const margem = 16;
    const valores = pontos.map(p => p.valor);
    let min = Math.min(...valores);
    let max = Math.max(...valores);
    if (max - min < 1) {
      min -= 1;
      max += 1;
    }
    const amplitude = max - min || 1;

    const coords = pontos.map((p, i) => ({
      x: margem + (i * (largura - 2 * margem)) / (pontos.length - 1),
      y: altura - margem - ((p.valor - min) / amplitude) * (altura - 2 * margem)
    }));

    const linha = coords.map(c => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
    const area = `${margem},${altura - margem} ${linha} ${largura - margem},${altura - margem}`;

    return {
      viewBox: `0 0 ${largura} ${altura}`,
      area,
      linha,
      pontos: coords,
      inicio: this.formatarDataCurta(pontos[0].data),
      fim: this.formatarDataCurta(pontos[pontos.length - 1].data)
    };
  }

  private formatarDataCurta(iso: string): string {
    const [, mes, dia] = iso.split('-');
    return `${dia}/${mes}`;
  }
}
