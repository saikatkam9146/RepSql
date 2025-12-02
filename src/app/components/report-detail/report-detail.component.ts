import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportsService } from '../../services/reports.service';

@Component({
  selector: 'app-report-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="report-edit" *ngIf="isLoaded; else loading">
      <div class="header">
        <h2 *ngIf="!readOnly">Edit Report #{{ report?.fnReportID }}</h2>
        <h2 *ngIf="readOnly">View Report #{{ report?.fnReportID }}</h2>
        <div class="actions">
          <button *ngIf="!readOnly" class="btn primary" (click)="save()">💾 Save</button>
          <button *ngIf="readOnly" class="btn" (click)="enterEditMode()">✏️ Edit</button>
          <button class="btn" (click)="suspend()">Suspend</button>
          <button class="btn" (click)="cancel()">Cancel</button>
        </div>
      </div>

      <div class="top-row">
        <div class="card overview">
          <h3>Overview</h3>
          <label>Name</label>
          <input [(ngModel)]="report.fcReportName" [disabled]="readOnly" />

          <label>Database</label>
          <input [value]="report.DatabaseConnection?.fcConnectionName || ''" readonly />

          <label>Server</label>
          <input [value]="report.DatabaseConnection?.fcDataSource || ''" readonly />

          <label>Department</label>
          <input [value]="report.Department?.fcDepartmentName || ''" readonly />

          <label>User</label>
          <input [value]="report.User ? (report.User.fcFirstName + ' ' + report.User.fcLastName) : ''" readonly />

          <label>SQL</label>
          <textarea rows="6" [(ngModel)]="report.fcSQL" [disabled]="readOnly" (blur)="onSQLBlur()"></textarea>
          <div *ngIf="sqlErrorMsg" class="error-msg">{{ sqlErrorMsg }}</div>
        </div>

        <div class="card scheduling">
          <h3>Scheduling</h3>
          <label>Frequency</label>
          <input [value]="scheduleFrequency()" readonly />

          <label>Date</label>
          <input [value]="report.Month?.fdLastRunDate | date:'yyyy-MM-dd'" readonly />

          <label>Hour</label>
          <input [value]="report.Month?.fnRunHour" readonly />

          <label>Minute</label>
          <input [value]="report.Month?.fnRunMinute" readonly />

          <label>AM/PM</label>
          <input [value]="ampm()" readonly />
        </div>
      </div>

      <div class="card exports">
        <div class="card-header">
          <h3>Export Options</h3>
          <button class="small" (click)="addExport()" [disabled]="readOnly">+</button>
        </div>
        <table class="exports-table">
          <thead>
            <tr><th>Location</th><th>Name</th><th>Add Date</th><th>Extension</th><th>Delimiter</th><th>Include Header</th><th>Generate SQL</th><th></th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let ex of report.Exports; let i = index">
              <td><input [(ngModel)]="ex.Export.fcExportLocation" [disabled]="readOnly" (blur)="onExportPathBlur(ex)" /></td>
              <td><input [(ngModel)]="ex.Export.fcExportName" [disabled]="readOnly" /></td>
              <td><input type="number" [(ngModel)]="ex.Export.fnAddDate" [disabled]="readOnly" /></td>
              <td>
                <select [(ngModel)]="ex.Export.fnFileExtensionID" (change)="onFileExtensionChange(ex)" [disabled]="readOnly">
                  <option *ngFor="let fe of fileExtensions" [value]="fe.fnFileExtensionID">{{ fe.fcFileExtension }}</option>
                </select>
              </td>
              <td>
                <select [(ngModel)]="ex.Export.fnDelimiterID" (change)="onDelimiterChange(ex)" [disabled]="readOnly">
                  <option value="">-</option>
                  <option *ngFor="let d of delimiters" [value]="d.fnDelimiterID">{{ d.fcDelimiter }}</option>
                </select>
              </td>
              <td><input type="checkbox" [(ngModel)]="ex.Export.fnIncludeHeader" [disabled]="readOnly" /></td>
              <td><input type="checkbox" [(ngModel)]="ex.Export.fnGenerateSQL" [disabled]="readOnly" /></td>
              <td><button class="small danger" (click)="removeExport(i)" [disabled]="readOnly">Remove</button></td>
            </tr>
            <tr *ngIf="(report.Exports || []).length === 0">
              <td colspan="8" style="text-align:center;">No exports configured</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card email">
        <h3>E-mail</h3>
        <label>Disable E-mail</label>
        <input type="checkbox" [(ngModel)]="report.EmailReport.fnDisable" [disabled]="readOnly" />

        <label>From</label>
        <input [(ngModel)]="report.EmailReport.fcFrom" [disabled]="readOnly" />

        <label>Subject</label>
        <input [(ngModel)]="report.EmailReport.fcSubject" [disabled]="readOnly" />

        <label>Body</label>
        <textarea rows="4" [(ngModel)]="report.EmailReport.fcBody" [disabled]="readOnly"></textarea>

        <h4>E-mail Addresses <button class="small" (click)="addEmail()" [disabled]="readOnly">+</button></h4>
        <div *ngIf="(report.EmailLists || []).length===0">No email addresses</div>
        <div *ngFor="let e of report.EmailLists; let j = index" class="email-row">
          <select [(ngModel)]="e.fcSendType" [disabled]="readOnly">
            <option>To:</option>
            <option>CC:</option>
            <option>BCC:</option>
          </select>
          <input [(ngModel)]="e.fcEmailAddress" placeholder="address@domain.com" [disabled]="readOnly" />
          <button class="small danger" (click)="removeEmail(j)" [disabled]="readOnly">Remove</button>
        </div>
      </div>
    </div>

    <ng-template #loading>
      <div style="padding:1rem;">Loading report...</div>
    </ng-template>
  `,
  styles: [
    `
    .report-edit { padding: 1rem; }
    .header { display:flex; justify-content:space-between; align-items:center; }
    .actions { display:flex; gap:0.5rem; }
    .btn { padding:6px 10px; border-radius:4px; }
    .btn.primary { background:#2b6fbf; color:white; border:none; }
    .top-row { display:flex; gap:1rem; }
    .card { background:#fff; border:1px solid #ddd; padding:0.75rem; border-radius:4px; flex:1; }
    .overview { max-width:60%; }
    .scheduling { max-width:35%; }
    .exports-table { width:100%; border-collapse:collapse; }
    .exports-table th, .exports-table td { border:1px solid #eee; padding:6px; }
    textarea, input { width:100%; box-sizing:border-box; margin-bottom:0.5rem; }
    .error-msg { color:#d32f2f; font-size:0.9rem; margin-top:-0.4rem; }
    `
  ]
})
export class ReportDetailComponent implements OnInit {
  id: number | null = null;
  report: any = {};
  payload: any = null;
  fileExtensions: any[] = [];
  delimiters: any[] = [];
  isLoaded = false;
  readOnly = false;

  constructor(private route: ActivatedRoute, private router: Router, private reportsService: ReportsService) {
    const idStr = this.route.snapshot.paramMap.get('id');
    this.id = idStr ? Number(idStr) : null;
    const mode = this.route.snapshot.queryParamMap.get('mode');
    this.readOnly = mode === 'view';
  }

  ngOnInit(): void {
    if (this.id) {
      // Edit mode: fetch existing report
      this.reportsService.getReport(this.id).subscribe(r => {
        this.payload = r || null;
        if (this.payload) {
          // ReportEdit object from API is the report itself, assign directly
          this.report = this.payload;
          // Extract nested lists if they exist in the response
          this.fileExtensions = (this.payload as any).FileExtensions || [];
          this.delimiters = (this.payload as any).Delimiters || [];
          this.report.Exports = this.report.Exports || [];
          this.report.EmailLists = this.report.EmailLists || [];
        }
        this.isLoaded = true;
      }, err => { console.error(err); this.isLoaded = true; });
    } else {
      // Create mode: fetch initial setup data (ReportEdit with defaults)
      this.reportsService.getReportSetup().subscribe(r => {
        this.payload = r || null;
        if (this.payload) {
          this.report = this.payload;
          this.fileExtensions = (this.payload as any).FileExtensions || [];
          this.delimiters = (this.payload as any).Delimiters || [];
          this.report.Exports = this.report.Exports || [];
          this.report.EmailLists = this.report.EmailLists || [];
          // Ensure ID is 0 for new report
          this.report.fnReportID = 0;
        } else {
          // fallback if API fails
          this.report = this.createEmptyReport();
        }
        this.isLoaded = true;
      }, err => {
        console.error('Failed to fetch initial setup data, using defaults', err);
        this.report = this.createEmptyReport();
        this.isLoaded = true;
      });
    }
  }

  createEmptyReport() {
    return {
      fnReportID: 0,
      fcReportName: '',
      fcSQL: '',
      Exports: [],
      EmailLists: [],
      EmailReport: { fnDisable: false, fcFrom: '', fcSubject: '', fcBody: '' },
      DatabaseConnection: null,
      Department: null,
      User: null,
      Month: null,
      Week: null,
      Hour: null,
      Minute: null,
      Adhoc: null
    } as any;
  }

  save() {
    // For edit mode, send the report object directly (as ReportEdit)
    this.isLoaded = false;
    this.reportsService.saveReport(this.report).subscribe(r => {
      this.isLoaded = true;
      if (r && (r.offlineSaved || r.saved || r.created || r.ok)) {
        alert('Report saved (offline fallback used if server unavailable).');
      } else {
        alert('Report saved.');
      }
      this.router.navigate(['/reports']);
    }, err => {
      this.isLoaded = true;
      console.error('Save failed', err);
      alert('Save failed. See console for details.');
    });
  }

  suspend() {
    if (!this.report) return;
    const flag = !this.report.Status?.fnStatusID; // toggle suspend flag
    const payload = { Report: this.report, SuspendFlag: flag };
    this.reportsService.activeSuspendReport(payload).subscribe(r => {
      alert('Report suspend status updated.');
    }, err => {
      console.error('Suspend failed', err);
      alert('Suspend failed. See console for details.');
    });
  }

  cancel() { this.router.navigate(['/reports']); }

  enterEditMode() {
    this.readOnly = false;
    // update URL to reflect edit mode
    this.router.navigate([], { relativeTo: this.route, queryParams: { mode: 'edit' } });
  }

  scheduleFrequency(): string {
    if (!this.report) return '';
    if (this.report.Month) {
      const months = this.report.Month.fnRecurrenceMonths || 1;
      return months <= 1 ? 'Ad Hoc' : `Every ${months} month(s)`;
    }
    if (this.report.Week) return 'Weekly';
    if (this.report.Hour) return 'Hourly';
    return 'Ad Hoc';
  }

  ampm(): string {
    if (!this.report || !this.report.Month) return '';
    const h = this.report.Month.fnRunHour || 0;
    return h >= 12 ? 'PM' : 'AM';
  }

  // Exports CRUD
  addExport() {
    const newExport = {
      Export: {
        fnExportID: 0,
        fnReportID: this.report?.fnReportID || 0,
        fcExportLocation: '',
        fcExportName: '',
        fnAddDate: 0,
        fnFileExtensionID: this.fileExtensions?.[0]?.fnFileExtensionID || null,
        fnDelimiterID: this.delimiters?.[0]?.fnDelimiterID || null,
        fnAddQuotes: false,
        fnGenerateSQL: false,
        fnIncludeHeader: false
      },
      FileExtension: this.fileExtensions?.[0] || null,
      Delimiter: this.delimiters?.[0] || null
    };
    this.report.Exports = this.report.Exports || [];
    this.report.Exports.push(newExport);
  }

  removeExport(idx: number) {
    if (!this.report?.Exports) return;
    this.report.Exports.splice(idx, 1);
  }

  // Email lists CRUD
  addEmail() {
    const newEmail = { fnEmailListID: 0, fnReportID: this.report?.fnReportID || 0, fcSendType: 'To:', fcEmailAddress: '' };
    this.report.EmailLists = this.report.EmailLists || [];
    this.report.EmailLists.push(newEmail);
  }

  removeEmail(idx: number) {
    if (!this.report?.EmailLists) return;
    this.report.EmailLists.splice(idx, 1);
  }

  onFileExtensionChange(ex: any) {
    if (!ex || !ex.Export) return;
    const val = ex.Export.fnFileExtensionID;
    ex.FileExtension = this.fileExtensions.find(f => f.fnFileExtensionID == val) || null;
  }

  onDelimiterChange(ex: any) {
    if (!ex || !ex.Export) return;
    const val = ex.Export.fnDelimiterID;
    ex.Delimiter = this.delimiters.find(d => d.fnDelimiterID == val) || null;
  }

  sqlErrorMsg: string | null = null;

  onSQLBlur() {
    if (!this.report?.fcSQL || this.readOnly) return;
    const checkSQL = { DatabaseConnectionID: this.report.fnConnectionID || 0, SQL: this.report.fcSQL };
    this.reportsService.checkSQLSyntax(checkSQL).subscribe(r => {
      if (r && r.ProcessStatus === 0 && r.SQLErrorMsg) {
        this.sqlErrorMsg = r.SQLErrorMsg;
      } else {
        this.sqlErrorMsg = null;
      }
    }, err => {
      console.warn('SQL syntax check failed', err);
      this.sqlErrorMsg = null;
    });
  }

  onExportPathBlur(ex: any) {
    if (!ex?.Export || this.readOnly) return;
    this.reportsService.checkValidPath(ex.Export).subscribe(r => {
      if (r && !r.IsValid) {
        alert('Export path validation: ' + (r.Message || 'Invalid path'));
      }
    }, err => {
      console.warn('Path validation failed', err);
    });
  }
}
