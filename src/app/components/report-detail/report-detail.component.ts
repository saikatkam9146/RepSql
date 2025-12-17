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
    <div class="report-edit" *ngIf="isLoaded; else loading" [class.view-mode]="readOnly">
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

          <!-- Ad Hoc Schedule -->
          <ng-container *ngIf="isAdhoc()">
            <label>Date</label>
            <input [value]="report.Adhoc?.fdDateTime | date:'MM/dd/yyyy'" readonly />

            <label>Hour</label>
            <input [value]="report.Adhoc?.fdDateTime | date:'hh'" readonly />

            <label>Minute</label>
            <input [value]="report.Adhoc?.fdDateTime | date:'mm'" readonly />

            <label>AM/PM</label>
            <input [value]="report.Adhoc?.fdDateTime | date:'a'" readonly />
          </ng-container>

          <!-- Monthly Schedule -->
          <ng-container *ngIf="report.Month">
            <label>Recurrence</label>
            <input type="number" [(ngModel)]="report.Month.fnRecurrenceMonths" 
                   [disabled]="readOnly" min="1" />

            <label>Hour (24h)</label>
            <input type="number" [(ngModel)]="report.Month.fnRunHour" 
                   [disabled]="readOnly" min="0" max="23" />

            <label>Minute</label>
            <input type="number" [(ngModel)]="report.Month.fnRunMinute" 
                   [disabled]="readOnly" min="0" max="59" />
          </ng-container>

          <!-- Weekly Schedule -->
          <ng-container *ngIf="report.Week && !report.Month">
            <label>Hour (24h)</label>
            <input type="number" [(ngModel)]="report.Week.fnRunHour" 
                   [disabled]="readOnly" min="0" max="23" />

            <label>Minute</label>
            <input type="number" [(ngModel)]="report.Week.fnRunMinute" 
                   [disabled]="readOnly" min="0" max="59" />
          </ng-container>

          <!-- Hourly Schedule -->
          <ng-container *ngIf="report.Hour && !report.Month && !report.Week">
            <label>Recurrence</label>
            <input type="number" [(ngModel)]="report.Hour.fnRecurrenceHours" 
                   [disabled]="readOnly" min="1" />

            <label>Run Minute</label>
            <input type="number" [(ngModel)]="report.Hour.fnRunMinute" 
                   [disabled]="readOnly" min="0" max="59" />
          </ng-container>
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

      <div class="card logs" *ngIf="(report.Logs || []).length > 0">
        <h3>Error Logs</h3>
        <table class="logs-table">
          <thead>
            <tr><th>Date</th><th>Message</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let log of report.Logs">
              <td>{{ log.fdDateTime | date:'short' }}</td>
              <td>{{ log.fcMessage }}</td>
            </tr>
          </tbody>
        </table>
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
    .card > label { display: inline-block; width: 200px; font-weight: bold; vertical-align: top; margin-bottom: 0.5rem; }
    .card > input,
    .card > textarea,
    .card > select { display: inline-block; width: calc(100% - 220px); margin-bottom: 0.5rem; border:1px solid #ccc; padding:6px; box-sizing:border-box; }
    .overview { max-width:60%; }
    .scheduling { max-width:35%; }
    .exports-table { width:100%; border-collapse:collapse; }
    .exports-table th, .exports-table td { border:1px solid #eee; padding:6px; }
    .logs-table { width:100%; border-collapse:collapse; margin-top:1rem; }
    .logs-table th, .logs-table td { border:1px solid #eee; padding:6px; text-align:left; }
    .logs-table th { background:#f5f5f5; font-weight:bold; }
    .error-msg { color:#d32f2f; font-size:0.9rem; margin-top:-0.4rem; display:block; margin-left:220px; }
    /* View mode: hide input/textarea borders and backgrounds for read-only appearance */
    .view-mode textarea,
    .view-mode input { border:none; background:transparent; padding:6px 0; }
    .card h3, .card h4 { margin-bottom: 0.5rem; }
    .email-row { margin-bottom: 0.5rem; }
    .card-header { display: flex; justify-content: space-between; align-items: center; }
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
    // treat only positive numeric ids as "edit"; id==0 is a new/create report
    console.log('[ReportDetail] ngOnInit - id from route:', this.id, 'type:', typeof this.id, 'readOnly:', this.readOnly);
    if (this.id !== null && this.id !== undefined && Number(this.id) > 0) {
      // Edit mode: fetch existing report
      console.log('[ReportDetail] Edit mode - calling getReport(reportid, isAdmin) with id:', this.id);
      this.reportsService.getReport(this.id).subscribe(r => {
        this.payload = r || null;
        if (this.payload) {
          // Normalize payload so template bindings work for both shapes
          const normalized = this.normalizeReportPayload(this.payload);
          this.report = normalized.report;
          // Extract nested lists if they exist in the response
          this.fileExtensions = (this.payload as any).FileExtensions || normalized.fileExtensions || [];
          this.delimiters = (this.payload as any).Delimiters || normalized.delimiters || [];
          this.report.Exports = this.report.Exports || [];
          this.report.EmailLists = this.report.EmailLists || [];
        }
        this.isLoaded = true;
      }, err => { console.error(err); this.isLoaded = true; });
    } else {
      // Create mode: fetch initial setup data (ReportEdit with defaults)
      console.log('[ReportDetail] Create mode - calling getReportSetup() (no params)');
      this.reportsService.getReportSetup().subscribe(r => {
        this.payload = r || null;
        if (this.payload) {
          const normalized = this.normalizeReportPayload(this.payload);
          this.report = normalized.report;
          this.fileExtensions = (this.payload as any).FileExtensions || normalized.fileExtensions || [];
          this.delimiters = (this.payload as any).Delimiters || normalized.delimiters || [];
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
      Adhoc: null,
      Status: null
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
      return `Every ${months} month(s)`;
    }
    if (this.report.Week) return 'Weekly';
    if (this.report.Hour) return 'Hourly';
    if (this.report.Minute) return 'By Minute';
    return 'Ad Hoc';
  }

  isAdhoc(): boolean {
    return !this.report?.Month && !this.report?.Week && !this.report?.Hour && !this.report?.Minute;
  }

  getDisplayHour(hour24: number | undefined | null): string {
    if (hour24 === undefined || hour24 === null) return '';
    const h = hour24 % 12;
    return h === 0 ? '12' : h.toString();
  }

  getAmPm(hour24: number | undefined | null): string {
    if (hour24 === undefined || hour24 === null) return '';
    return hour24 >= 12 ? 'PM' : 'AM';
  }

  onAdhocDateTimeChange(event: any) {
    if (!this.report.Adhoc) {
      this.report.Adhoc = {};
    }
    const value = event.target.value;
    if (value) {
      this.report.Adhoc.fdDateTime = new Date(value).toISOString();
    }
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

  // Normalize various API response shapes into a single object the template expects.
  // Some endpoints return a ReportComplex (with nested .Report) while others return
  // a flattened object. This helper returns an object with `report` (flattened)
  // and optional lists (fileExtensions, delimiters) preserved.
  private normalizeReportPayload(payload: any): { report: any; fileExtensions?: any[]; delimiters?: any[] } {
    if (!payload) return { report: this.createEmptyReport() };

    // If payload has a top-level Report property (ReportComplex / ReportEdit), flatten it
    if (payload.Report) {
      // Some APIs return { Report: { ... } } and others nest again as { Report: { Report: {...} } }
      const reportSource = (payload.Report as any).Report || payload.Report || {};
      const base = { ...(reportSource || {}) } as any;
      // Copy commonly used linked objects onto the flattened object so bindings work
      base.DatabaseConnection = payload.DatabaseConnection
        || payload.DatabaseConnectionExport
        || payload.DatabaseConnectionImport
        || (payload.Report as any).DatabaseConnection
        || base.DatabaseConnection
        || base.DatabaseConnectionExport
        || base.DatabaseConnectionImport
        || null;
      base.Department = payload.Department || (payload.Report as any).Department || base.Department || null;
      base.User = payload.User || payload.CurrentUser || (payload.Report as any).User || base.User || null;
      base.EmailReport = payload.EmailReport || (payload.Report as any).EmailReport || base.EmailReport || {};
      base.Exports = payload.Exports || payload.ExportsToBeDeleted || (payload.Report as any).Exports || base.Exports || [];
      base.EmailLists = payload.EmailLists || (payload.Report as any).EmailLists || base.EmailLists || [];
      base.Month = payload.Month || (payload.Report as any).Month || base.Month || null;
      base.Week = payload.Week || (payload.Report as any).Week || base.Week || null;
      base.Hour = payload.Hour || (payload.Report as any).Hour || base.Hour || null;
      base.Minute = payload.Minute || (payload.Report as any).Minute || base.Minute || null;
      base.Adhoc = payload.Adhoc || (payload.Report as any).Adhoc || base.Adhoc || null;
      base.Logs = payload.Logs || (payload.Report as any).Logs || base.Logs || [];

      return { report: base, fileExtensions: payload.FileExtensions, delimiters: payload.Delimiters };
    }

    // If payload already looks flattened (has fnReportID or fcReportName), use as-is
    if (payload.fnReportID !== undefined || payload.fcReportName !== undefined) {
      return { report: payload, fileExtensions: payload.FileExtensions, delimiters: payload.Delimiters };
    }

    // Fallback: return an empty report
    return { report: this.createEmptyReport() };
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
