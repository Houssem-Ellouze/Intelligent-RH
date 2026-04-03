import { Component } from '@angular/core';
import {ScoutingService} from '../../services/scouting.service';
import {TalentProfile} from '../../models/talent-profile.model';
import {NgForOf, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-talent-search',
  templateUrl: './talent-search-component.html',
  standalone: true,
  imports: [
    NgForOf,
    FormsModule,
    NgIf
  ],
  styleUrls: ['./talent-search-component.css']
})
export class TalentSearchComponent {
  minScore?: number;
  maxScore?: number;
  keyword: string = '';
  results: TalentProfile[] = [];
  loading: boolean = false;
  error: string = '';

  constructor(private talentService: ScoutingService) {}

  search() {
    this.loading = true;
    this.error = '';
    this.results = [];

    this.talentService.searchProfiles(this.minScore, this.maxScore, this.keyword)
      .subscribe({
        next: (data) => {
          this.results = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Erreur lors de la recherche';
          console.error(err);
          this.loading = false;
        }
      });
  }
}
