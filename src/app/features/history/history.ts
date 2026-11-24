import { Component, inject } from '@angular/core';
import { TreinoDataService } from '../../core/services/treino-data.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './history.html',
  styleUrl: './history.css'
})
export class HistoryComponent {
  public db = inject(TreinoDataService);
}
