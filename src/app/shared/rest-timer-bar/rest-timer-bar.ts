import { Component, inject } from '@angular/core';
import { RestTimerService } from '../../core/services/rest-timer.service';

@Component({
  selector: 'app-rest-timer-bar',
  standalone: true,
  templateUrl: './rest-timer-bar.html',
  styleUrl: './rest-timer-bar.css'
})
export class RestTimerBarComponent {
  public timer = inject(RestTimerService);
}
