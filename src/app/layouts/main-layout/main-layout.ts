import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { TreinoDataService } from '../../core/services/treino-data.service';
import { RestTimerBarComponent } from '../../shared/rest-timer-bar/rest-timer-bar';
import { ToastComponent } from '../../shared/toast/toast';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, RestTimerBarComponent, ToastComponent],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css'
})
export class MainLayoutComponent {
  private router = inject(Router);
  public db = inject(TreinoDataService);

  private urlAtual = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(e => e.urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  /** Subtítulo exibido no topo, variando conforme a aba ativa e o estado do treino. */
  public subtitle = computed(() => {
    const url = this.urlAtual();
    if (url.startsWith('/workout')) {
      const draft = this.db.draft();
      return draft ? `Sessão em andamento · ${this.db.templateNome(draft.treino)}` : 'Escolha o treino do dia';
    }
    if (url.startsWith('/history')) {
      return `${this.db.sessions().length} sessão(ões) registrada(s)`;
    }
    if (url.startsWith('/evolution')) {
      return 'Peso e medidas corporais';
    }
    if (url.startsWith('/guide')) {
      return 'Guia de uso e parâmetros';
    }
    return 'Registro de treinos';
  });
}
