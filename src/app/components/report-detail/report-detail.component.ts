import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-report-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding:1rem;">
      <h2>Report detail</h2>
      <p>Report ID: {{ id }}</p>
      <p>This is a minimal detail page placeholder. Implement fields as needed.</p>
      <button (click)="back()">Back</button>
    </div>
  `
})
export class ReportDetailComponent {
  id: number | null = null;
  constructor(private route: ActivatedRoute, private router: Router) {
    const idStr = this.route.snapshot.paramMap.get('id');
    this.id = idStr ? Number(idStr) : null;
  }
  back() { this.router.navigate(['/reports']); }
}
