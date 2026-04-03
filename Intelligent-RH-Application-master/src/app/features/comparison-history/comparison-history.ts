import { Component } from '@angular/core';
import { ScoutingService } from '../../services/scouting.service';
import { TalentComparison } from '../../models/talent-comparison.model';
import {FormsModule} from '@angular/forms';
import {DatePipe, NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-comparison-history',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    NgForOf,
    DatePipe
  ],
  templateUrl: './comparison-history.html'
})
export class ComparisonHistoryComponent {

  talentId!: number;
  comparisons: TalentComparison[] = [];
  loading = false;
  error = '';

  constructor(private scoutingService: ScoutingService) {}

  loadHistory() {
    if (!this.talentId) {
      this.error = 'Veuillez saisir un ID de talent';
      return;
    }

    this.loading = true;
    this.error = '';
    this.comparisons = [];

    this.scoutingService.getComparisonHistory(this.talentId).subscribe({
      next: (data) => {
        this.comparisons = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Aucun historique trouvé pour ce talent';
        this.loading = false;
      }
    });
  }
}
