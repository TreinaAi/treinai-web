import { Service, signal } from '@angular/core';

/** Exibe mensagens curtas e temporárias no rodapé da tela (ex.: "Treino salvo! 💪"). */
@Service()
export class ToastService {
  public readonly message = signal('');
  public readonly visible = signal(false);

  private timerId?: ReturnType<typeof setTimeout>;

  show(message: string, durationMs = 2200) {
    this.message.set(message);
    this.visible.set(true);
    clearTimeout(this.timerId);
    this.timerId = setTimeout(() => this.visible.set(false), durationMs);
  }
}
