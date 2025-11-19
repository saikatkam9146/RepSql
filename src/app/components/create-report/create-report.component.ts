import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReportsService } from '../../services/reports.service';

@Component({
  selector: 'app-create-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="padding:1rem;">
      <h2>Create Report</h2>
      <form (ngSubmit)="save()">
        <div>
          <label>Name</label>
          <input [(ngModel)]="model.fcReportName" name="name" required />
        </div>
        <div>
          <label>Connection ID</label>
          <input type="number" [(ngModel)]="model.fnConnectionID" name="conn" />
        </div>
        <div>
          <label>SQL</label>
          <textarea [(ngModel)]="model.fcSQL" name="sql"></textarea>
        </div>
        <div style="margin-top:1rem;">
          <button type="submit">Create</button>
          <button type="button" (click)="cancel()">Cancel</button>
        </div>
      </form>
    </div>
  `
})
export class CreateReportComponent {
  model: any = { Report: { fnReportID: 0, fcReportName: '', fnConnectionID: undefined, fcSQL: null } };
  constructor(private reportsService: ReportsService, private router: Router) {}

  save() {
    // build payload similar to ReportComplex wrapper expected by backend
    const payload = { Report: { ...this.model.Report } };
    this.reportsService.createReport(payload).subscribe(res => {
      if ((res as any)?.offlineSaved) {
        alert('Saved locally (offline)');
      } else {
        alert('Saved to server');
      }
      this.router.navigate(['/reports']);
    }, err => { console.error(err); alert('Failed to save'); });
  }

  cancel() { this.router.navigate(['/reports']); }
}
