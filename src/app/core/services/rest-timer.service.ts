import { Service, computed, signal } from '@angular/core';
import { formatTime } from '../utils/format.util';

/** Cronômetro de descanso exibido entre as séries, com som e vibração ao finalizar. */
@Service()
export class RestTimerService {
  public readonly visible = signal(false);
  public readonly label = signal('');
  public readonly remaining = signal(0);
  public readonly total = signal(1);

  public readonly formattedTime = computed(() => formatTime(this.remaining()));
  public readonly fillPercent = computed(() => Math.min(100, (this.remaining() / this.total()) * 100));

  private intervalId: ReturnType<typeof setInterval> | null = null;
  private endTime = 0;

  start(seconds: number, label: string) {
    this.total.set(seconds);
    this.endTime = Date.now() + seconds * 1000;
    this.label.set(label);
    this.visible.set(true);
    this.clearInterval();
    this.intervalId = setInterval(() => this.tick(), 250);
    this.tick();
  }

  addTime(deltaSeconds: number) {
    if (!this.visible()) return;
    this.endTime += deltaSeconds * 1000;
    const remaining = Math.round((this.endTime - Date.now()) / 1000);
    this.total.set(Math.max(this.total(), remaining));
    this.tick();
  }

  stop() {
    this.clearInterval();
    this.visible.set(false);
  }

  private tick() {
    const remaining = Math.max(0, Math.round((this.endTime - Date.now()) / 1000));
    this.remaining.set(remaining);
    if (remaining <= 0) {
      this.clearInterval();
      this.label.set('Descanso concluído ✓');
      this.notifyEnd();
    }
  }

  private clearInterval() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private notifyEnd() {
    this.beep();
    if (navigator.vibrate) navigator.vibrate([180, 90, 180]);
  }

  private beep() {
    try {
      const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.55);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.6);
      setTimeout(() => ctx.close(), 900);
    } catch {
      /* silencioso: áudio é apenas um complemento */
    }
  }
}
