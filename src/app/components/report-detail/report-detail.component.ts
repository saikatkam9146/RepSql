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
          <button *ngIf="canSuspendReport()" class="btn" (click)="suspendReport()">Suspend Report</button>
          <button *ngIf="canActivateReport()" class="btn" (click)="activateReport()">Activate Report</button>
          <button class="btn" (click)="cancel()">Cancel</button>
        </div>
      </div>

      <div class="top-row">
        <div class="card overview">
          <h3>Overview</h3>
          <label>Name</label>
          <input [(ngModel)]="report.fcReportName" [disabled]="readOnly" />

          <label>Database</label>
          <ng-container *ngIf="!readOnly">
            <select [(ngModel)]="report.fnConnectionID" (change)="onDatabaseChange()" [disabled]="readOnly">
              <option [value]="null">-- Select Database --</option>
              <option *ngFor="let db of databases" [value]="db.fnConnectionID">{{ db.fcConnectionName }}</option>
            </select>
          </ng-container>
          <ng-container *ngIf="readOnly">
            <input [value]="report.DatabaseConnection?.fcConnectionName || ''" readonly />
          </ng-container>

          <label>Server</label>
          <input [value]="report.DatabaseConnection?.fcDataSource || ''" readonly />

          <label>Department</label>
          <ng-container *ngIf="!readOnly">
            <select [(ngModel)]="report.fnDepartmentID" [disabled]="readOnly">
              <option value="">-- Select Department --</option>
              <option *ngFor="let dept of departments" [value]="dept.fnDepartmentID">{{ dept.fcDepartmentName }}</option>
            </select>
          </ng-container>
          <ng-container *ngIf="readOnly">
            <input [value]="report.Department?.fcDepartmentName || ''" readonly />
          </ng-container>

          <label>User</label>
          <ng-container *ngIf="!readOnly">
            <select [(ngModel)]="report.fnUserID" [disabled]="readOnly">
              <option value="">-- Select User --</option>
              <option *ngFor="let user of users" [value]="user.fnUserID">{{ user.fcFirstName }} {{ user.fcLastName }}</option>
            </select>
          </ng-container>
          <ng-container *ngIf="readOnly">
            <input [value]="report.User ? (report.User.fcFirstName + ' ' + report.User.fcLastName) : ''" readonly />
          </ng-container>

          <label>SQL</label>
          <textarea rows="6" [(ngModel)]="report.fcSQL" [disabled]="readOnly" (blur)="onSQLBlur()"></textarea>
          <div *ngIf="sqlErrorMsg" class="error-msg">{{ sqlErrorMsg }}</div>
        </div>

        <div class="card scheduling">
          <h3>Scheduling</h3>
          <label>Frequency</label>
          <select [(ngModel)]="report.scheduleType" (change)="onFrequencyChange()" [disabled]="readOnly">
            <option *ngFor="let freq of frequencyOptions" [value]="freq">{{ freq }}</option>
          </select>

          <!-- Ad Hoc Schedule -->
          <ng-container *ngIf="report.scheduleType === 'Ad Hoc'">
            <label>Date</label>
            <input type="date" [(ngModel)]="report.adhocDate" [disabled]="readOnly" />

            <label>Hour</label>
            <select [(ngModel)]="report.adhocHour" [disabled]="readOnly">
              <option *ngFor="let h of hourlyRecurrenceOptions" [value]="h">{{ h }}</option>
            </select>

            <label>Minute</label>
            <select [(ngModel)]="report.adhocMinute" [disabled]="readOnly">
              <option *ngFor="let m of minuteOptions" [value]="m">{{ m | number:'2.0-0' }}</option>
            </select>

            <label>AM/PM</label>
            <select [(ngModel)]="report.adhocAmPm" [disabled]="readOnly">
              <option *ngFor="let ap of ampmOptions" [value]="ap">{{ ap }}</option>
            </select>
          </ng-container>

          <!-- Monthly Schedule -->
          <ng-container *ngIf="report.scheduleType === 'Monthly'">
            <label>Recurrence</label>
            <div class="recurrence-group">
              <span>Every</span>
              <input type="number" [(ngModel)]="report.Month.fnRecurrenceMonths" [disabled]="readOnly" min="1" style="width:60px;" />
              <span>Month(s)</span>
            </div>

            <div class="radio-group">
              <label><input type="radio" [checked]="!report.Month.fnRunOnLastDay" (change)="report.Month.fnRunOnLastDay = false" [disabled]="readOnly" /> On Day's</label>
              <input type="number" [(ngModel)]="report.Month.fnDayOfMonth" [disabled]="readOnly" min="1" max="31" style="width:80px;" placeholder="Day" />
            </div>

            <div class="radio-group">
              <label><input type="radio" [checked]="report.Month.fnRunOnLastDay" (change)="report.Month.fnRunOnLastDay = true" [disabled]="readOnly" /> On</label>
              <select [(ngModel)]="report.Month.fnWeekOfMonth" [disabled]="readOnly" style="width:120px;">
                <option value="">--Week No--</option>
                <option [value]="1">First</option>
                <option [value]="2">Second</option>
                <option [value]="3">Third</option>
                <option [value]="4">Fourth</option>
                <option [value]="5">Last</option>
              </select>
              <select [(ngModel)]="report.Month.fnDayOfWeek" [disabled]="readOnly" style="width:120px;">
                <option value="">--WeekDays--</option>
                <option [value]="1">Sunday</option>
                <option [value]="2">Monday</option>
                <option [value]="3">Tuesday</option>
                <option [value]="4">Wednesday</option>
                <option [value]="5">Thursday</option>
                <option [value]="6">Friday</option>
                <option [value]="7">Saturday</option>
              </select>
            </div>

            <div class="checkbox-group">
              <label><input type="checkbox" [(ngModel)]="report.Month.fnRunMonthEnd" [disabled]="readOnly" /> Run Every Month End</label>
            </div>

            <label>Hour</label>
            <select [(ngModel)]="report.Month.fnRunHour" [disabled]="readOnly">
              <option *ngFor="let h of hourOptions" [value]="h">{{ h }}</option>
            </select>

            <label>Minute</label>
            <select [(ngModel)]="report.Month.fnRunMinute" [disabled]="readOnly">
              <option *ngFor="let m of minuteOptions" [value]="m">{{ m | number:'2.0-0' }}</option>
            </select>
          </ng-container>

          <!-- Weekly Schedule -->
          <ng-container *ngIf="report.scheduleType === 'Weekly'">
            <label>Days</label>
            <div class="weekdays-grid">
              <label><input type="checkbox" [(ngModel)]="report.Week.fnSunday" [disabled]="readOnly" /> Sunday</label>
              <label><input type="checkbox" [(ngModel)]="report.Week.fnMonday" [disabled]="readOnly" /> Monday</label>
              <label><input type="checkbox" [(ngModel)]="report.Week.fnTuesday" [disabled]="readOnly" /> Tuesday</label>
              <label><input type="checkbox" [(ngModel)]="report.Week.fnWednesday" [disabled]="readOnly" /> Wednesday</label>
              <label><input type="checkbox" [(ngModel)]="report.Week.fnThursday" [disabled]="readOnly" /> Thursday</label>
              <label><input type="checkbox" [(ngModel)]="report.Week.fnFriday" [disabled]="readOnly" /> Friday</label>
              <label><input type="checkbox" [(ngModel)]="report.Week.fnSaturday" [disabled]="readOnly" /> Saturday</label>
            </div>

            <label>Hour</label>
            <select [(ngModel)]="report.Week.fnRunHour" [disabled]="readOnly">
              <option *ngFor="let h of hourlyRecurrenceOptions" [value]="h">{{ h }}</option>
            </select>

            <label>Minute</label>
            <select [(ngModel)]="report.Week.fnRunMinute" [disabled]="readOnly">
              <option *ngFor="let m of minuteOptions" [value]="m">{{ m | number:'2.0-0' }}</option>
            </select>

            <label>AM/PM</label>
            <select [(ngModel)]="report.Week.fnRunAmPm" [disabled]="readOnly">
              <option *ngFor="let ap of ampmOptions" [value]="ap">{{ ap }}</option>
            </select>
          </ng-container>

          <!-- Hourly Schedule -->
          <ng-container *ngIf="report.scheduleType === 'Hourly'">
            <label>Recurrence</label>
            <div class="recurrence-group">
              <span>Every</span>
              <select [(ngModel)]="report.Hour.fnRecurrenceHours" [disabled]="readOnly" style="width:80px;">
                <option *ngFor="let h of hourlyRecurrenceOptions" [value]="h">{{ h }}</option>
              </select>
              <span>Hour(s)</span>
            </div>

            <label>Run Minute</label>
            <select [(ngModel)]="report.Hour.fnRunMinute" [disabled]="readOnly">
              <option *ngFor="let m of minuteOptions" [value]="m">{{ m | number:'2.0-0' }}</option>
            </select>

            <label style="display:flex; gap:2rem; align-items:center;">
              <span style="width:200px;">Start Time</span>
              <span style="width:100px;">Hour</span>
              <span style="width:100px;">AM/PM</span>
            </label>
            <div style="display:flex; gap:2rem; margin-left:200px;">
              <select [(ngModel)]="report.Hour.fnStartHour" [disabled]="readOnly" style="width:100px;">
                <option *ngFor="let h of hourlyRecurrenceOptions" [value]="h">{{ h }}</option>
              </select>
              <select [(ngModel)]="report.Hour.fnStartAmPm" [disabled]="readOnly" style="width:100px;">
                <option *ngFor="let ap of ampmOptions" [value]="ap">{{ ap }}</option>
              </select>
            </div>

            <label style="display:flex; gap:2rem; align-items:center; margin-top:0.5rem;">
              <span style="width:200px;">End Time</span>
              <span style="width:100px;">Hour</span>
              <span style="width:100px;">AM/PM</span>
            </label>
            <div style="display:flex; gap:2rem; margin-left:200px;">
              <select [(ngModel)]="report.Hour.fnEndHour" [disabled]="readOnly" style="width:100px;">
                <option *ngFor="let h of hourlyRecurrenceOptions" [value]="h">{{ h }}</option>
              </select>
              <select [(ngModel)]="report.Hour.fnEndAmPm" [disabled]="readOnly" style="width:100px;">
                <option *ngFor="let ap of ampmOptions" [value]="ap">{{ ap }}</option>
              </select>
            </div>
          </ng-container>

          <!-- By Minute Schedule -->
          <ng-container *ngIf="report.scheduleType === 'By Minute'">
            <label>Recurrence (minutes)</label>
            <input type="number" [(ngModel)]="report.Minute.fnRecurrenceMinutes" 
                   [disabled]="readOnly" min="1" />
          </ng-container>
        </div>
      </div>

      <div class="card workbook">
        <h3>Use Existing Workbook</h3>
        <label><input type="checkbox" [(ngModel)]="report.fnUpdateExistingWorkbook" [disabled]="readOnly" /> Use Existing Workbook</label>
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

      <div class="card sheets">
        <div class="card-header">
          <h3>Sheets</h3>
          <button class="small" (click)="addSheet()" [disabled]="readOnly">+</button>
        </div>
        <table class="sheets-table" *ngIf="(report.Sheets || []).length > 0">
          <thead>
            <tr><th>#</th><th>Name</th><th>Hide?</th><th>Delete?</th><th></th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let sheet of report.Sheets; let i = index">
              <td>{{ i + 1 }}</td>
              <td><input [(ngModel)]="sheet.fcSheetName" [disabled]="readOnly" placeholder="Name" /></td>
              <td><input type="checkbox" [(ngModel)]="sheet.fnHide" [disabled]="readOnly" /></td>
              <td><input type="checkbox" [(ngModel)]="sheet.fnDelete" [disabled]="readOnly" /></td>
              <td><button class="small danger" (click)="removeSheet(i)" [disabled]="readOnly">Remove</button></td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="(report.Sheets || []).length === 0" style="padding:1rem; text-align:center; color:#999;">None</div>
      </div>

      <div class="email-section">
        <div class="card email">
          <h3>E-mail</h3>
          
          <div class="checkbox-item">
            <input type="checkbox" [(ngModel)]="report.EmailReport.fnDisable" [disabled]="readOnly" />
            <label style="font-weight:bold; margin-left:0.5rem;">Disable E-mail</label>
          </div>

          <label>From</label>
          <input [(ngModel)]="report.EmailReport.fcFrom" [disabled]="readOnly" />

          <label>Subject</label>
          <input [(ngModel)]="report.EmailReport.fcSubject" [disabled]="readOnly" />

          <label>Body</label>
          <textarea rows="6" [(ngModel)]="report.EmailReport.fcBody" [disabled]="readOnly"></textarea>

          <div class="checkbox-item">
            <input type="checkbox" [(ngModel)]="report.EmailReport.fnAttachment" [disabled]="readOnly" (change)="onAttachmentChange()" />
            <label style="font-weight:bold; margin-left:0.5rem;">Attach File</label>
          </div>

          <ng-container *ngIf="report.EmailReport.fnAttachment">
            <label>Attachment</label>
            <input [(ngModel)]="report.EmailReport.fcAttachmentName" [disabled]="readOnly" placeholder="File name or path" />

            <div class="checkbox-item">
              <input type="checkbox" [(ngModel)]="report.EmailReport.fnSendSecure" [disabled]="readOnly" />
              <label style="margin-left:0.5rem;">Send Secure</label>
            </div>

            <div class="checkbox-item">
              <input type="checkbox" [(ngModel)]="report.EmailReport.fnZipFile" [disabled]="readOnly" />
              <label style="margin-left:0.5rem;">Send Zip</label>
            </div>

            <ng-container *ngIf="report.EmailReport.fnZipFile">
              <label>Zip Password</label>
              <input type="password" [(ngModel)]="report.EmailReport.fcZipPassword" [disabled]="readOnly" />
            </ng-container>
          </ng-container>
        </div>

        <div class="card email-addresses">
          <div class="card-header">
            <h3>E-mail Addresses</h3>
            <button class="small" (click)="addEmail()" [disabled]="readOnly">+</button>
          </div>
          <table class="email-table" *ngIf="(report.EmailLists || []).length > 0">
            <thead>
              <tr><th>Type</th><th>Address</th><th></th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let e of report.EmailLists; let j = index">
                <td>
                  <select [(ngModel)]="e.fcSendType" [disabled]="readOnly">
                    <option>To:</option>
                    <option>CC:</option>
                    <option>BCC:</option>
                  </select>
                </td>
                <td><input [(ngModel)]="e.fcEmailAddress" placeholder="address@domain.com" [disabled]="readOnly" /></td>
                <td><button class="small danger" (click)="removeEmail(j)" [disabled]="readOnly">Remove</button></td>
              </tr>
            </tbody>
          </table>
          <div *ngIf="(report.EmailLists || []).length === 0" style="padding:1rem; text-align:center; color:#999;">No email addresses</div>
        </div>
      </div>

      <div class="card logs" *ngIf="(report.Logs || []).length > 0">
        <h3>Error Logs</h3>
        <table class="logs-table">
          <thead>
            <tr><th>Log ID</th><th>Timestamp</th><th>Error Message</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let log of report.Logs">
              <td>{{ log.LogId }}</td>
              <td>{{ log.Timestamp }}</td>
              <td>{{ log.Message }}</td>
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
    .header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; }
    .actions { display:flex; gap:0.5rem; }
    .btn { padding:8px 12px; border-radius:4px; border:1px solid #ccc; background:#f5f5f5; cursor:pointer; }
    .btn:hover { background:#e8e8e8; }
    .btn.primary { background:#2b6fbf; color:white; border:none; }
    .btn.primary:hover { background:#1f5490; }
    .btn.danger { background:#d32f2f; color:white; border:none; }
    .top-row { display:flex; gap:1rem; margin-bottom:1rem; }
    .email-section { display:flex; gap:1rem; margin-bottom:1rem; }
    .email-section .card { flex:1; }
    .card { background:#fff; border:1px solid #ddd; padding:1rem; border-radius:4px; margin-bottom:1rem; }
    .card h3 { background:#2b6fbf; color:white; padding:8px 12px; margin:-1rem -1rem 1rem -1rem; border-radius:4px 4px 0 0; }
    .card > label { display: inline-block; width: 200px; font-weight: bold; vertical-align: top; margin-bottom: 0.5rem; }
    .card > input,
    .card > textarea,
    .card > select { display: inline-block; width: calc(100% - 220px); margin-bottom: 0.5rem; border:1px solid #ccc; padding:6px; box-sizing:border-box; border-radius:3px; }
    .card > input[type="checkbox"] { width: auto; margin-right: 0.5rem; }
    .recurrence-group { display:flex; align-items:center; gap:0.5rem; margin-bottom:0.5rem; }
    .recurrence-group input { width:80px; }
    .recurrence-group span { color:#666; }
    .radio-group { display:flex; align-items:center; gap:0.5rem; margin-bottom:0.5rem; }
    .radio-group label { width:auto; margin-right:1rem; }
    .radio-group input[type="radio"] { margin-right:0.3rem; }
    .radio-group input[type="number"], .radio-group select { width:auto; }
    .checkbox-group { margin-bottom:0.5rem; }
    .checkbox-group label { display:flex; align-items:center; gap:0.5rem; width:auto; }
    .checkbox-group input[type="checkbox"] { margin:0; }
    .checkbox-item { display:flex; align-items:center; margin-bottom:0.5rem; }
    .checkbox-item input[type="checkbox"] { margin:0; }
    .weekdays-grid { display:grid; grid-template-columns:repeat(2, 1fr); gap:0.5rem; margin-bottom:0.5rem; }
    .weekdays-grid label { display:flex; align-items:center; gap:0.5rem; width:auto; font-weight:normal; }
    .weekdays-grid input[type="checkbox"] { margin:0; }
    select { cursor: pointer; }
    .overview { max-width:60%; }
    .scheduling { max-width:35%; }
    .workbook { margin:1rem 0; }
    .exports-table { width:100%; border-collapse:collapse; margin-top:1rem; }
    .exports-table th, .exports-table td { border:1px solid #eee; padding:8px; text-align:left; }
    .exports-table th { background:#f5f5f5; font-weight:bold; }
    .email-table { width:100%; border-collapse:collapse; margin-top:1rem; }
    .email-table th, .email-table td { border:1px solid #eee; padding:8px; text-align:left; }
    .email-table th { background:#f5f5f5; font-weight:bold; }
    .email-table td:last-child { text-align:center; }
    .sheets-table { width:100%; border-collapse:collapse; margin-top:1rem; }
    .sheets-table th, .sheets-table td { border:1px solid #eee; padding:8px; text-align:left; }
    .sheets-table th { background:#f5f5f5; font-weight:bold; }
    .sheets-table td:last-child { text-align:center; }
    .sheets-table input[type="text"] { width:100%; box-sizing:border-box; }
    .sheets-table input[type="checkbox"] { margin:0; }
    .logs-table { width:100%; border-collapse:collapse; margin-top:1rem; }
    .logs-table th, .logs-table td { border:1px solid #eee; padding:8px; text-align:left; }
    .logs-table th { background:#f5f5f5; font-weight:bold; }
    .error-msg { color:#d32f2f; font-size:0.9rem; margin-top:-0.4rem; display:block; margin-left:220px; }
    .view-mode textarea,
    .view-mode input[type="text"] { border:none; background:transparent; padding:6px 0; }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin:-1rem -1rem 1rem -1rem; padding:0.75rem 1rem; background:#f5f5f5; border-bottom:1px solid #ddd; }
    .card-header h3 { margin:0; }
    .small { padding:4px 8px; font-size:0.85rem; }
    `
  ]
})
export class ReportDetailComponent implements OnInit {
  id: number | null = null;
  report: any = {};
  payload: any = null;
  fileExtensions: any[] = [];
  delimiters: any[] = [];
  databases: any[] = [];
  users: any[] = [];
  departments: any[] = [];
  servers: any[] = [];
  isLoaded = false;
  readOnly = false;

  // Scheduling dropdowns
  frequencyOptions = ['Ad Hoc', 'Monthly', 'Weekly', 'Hourly', 'By Minute'];
  hourOptions = Array.from({ length: 24 }, (_, i) => i); // 0-23
  hourlyRecurrenceOptions = Array.from({ length: 12 }, (_, i) => i + 1); // 1-12
  minuteOptions = Array.from({ length: 60 }, (_, i) => i); // 0-59
  ampmOptions = ['AM', 'PM'];

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
        console.log('[ReportDetail] getReport response:', this.payload);
        if (this.payload) {
          // Normalize payload so template bindings work for both shapes
          const normalized = this.normalizeReportPayload(this.payload);
          this.report = normalized.report;
          console.log('[ReportDetail] Normalized report:', this.report);
          console.log('[ReportDetail] fnConnectionID:', this.report.fnConnectionID, 'type:', typeof this.report.fnConnectionID);
          console.log('[ReportDetail] DatabaseConnection:', this.report.DatabaseConnection);
          console.log('[ReportDetail] Report Logs:', this.report.Logs);
          console.log('[ReportDetail] Report Status:', this.report.Status);
          // Extract nested lists if they exist in the response
          this.fileExtensions = (this.payload as any).FileExtensions || normalized.fileExtensions || [];
          this.delimiters = (this.payload as any).Delimiters || normalized.delimiters || [];
          this.databases = (this.payload as any).Databases || [];
          this.users = (this.payload as any).Users || [];
          this.departments = (this.payload as any).Departments || [];
          console.log('[ReportDetail] Databases:', this.databases.map((d: any) => ({ id: d.fnConnectionID, name: d.fcConnectionName })));
          console.log('[ReportDetail] Departments:', this.departments);
          console.log('[ReportDetail] Users:', this.users);
          this.report.Exports = this.report.Exports || [];
          this.report.EmailLists = this.report.EmailLists || [];
          this.initializeScheduleType();
          this.populateDropdownsIfEmpty();
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
          this.databases = (this.payload as any).Databases || [];
          this.users = (this.payload as any).Users || [];
          this.departments = (this.payload as any).Departments || [];
          console.log('[ReportDetail] Setup Databases:', this.databases);
          console.log('[ReportDetail] Setup Departments:', this.departments);
          console.log('[ReportDetail] Setup Users:', this.users);
          this.report.Exports = this.report.Exports || [];
          this.report.EmailLists = this.report.EmailLists || [];
          // Ensure ID is 0 for new report
          this.report.fnReportID = 0;
          this.initializeScheduleType();
          this.populateDropdownsIfEmpty();
        } else {
          // fallback if API fails
          this.report = this.createEmptyReport();
          this.populateDropdownsIfEmpty();
        }
        this.isLoaded = true;
      }, err => {
        console.error('Failed to fetch initial setup data, using defaults', err);
        this.report = this.createEmptyReport();
        this.populateDropdownsIfEmpty();
        this.isLoaded = true;
      });
    }
  }

  populateDropdownsIfEmpty() {
    // Fetch lookup data if dropdowns are empty
    if (this.databases.length === 0 || this.departments.length === 0 || this.users.length === 0) {
      console.log('[ReportDetail] Fetching lookup data...');
      this.reportsService.getReportSetup().subscribe(r => {
        if (r) {
          this.databases = r.Databases || this.databases;
          this.departments = r.Departments || this.departments;
          this.users = r.Users || this.users;
          console.log('[ReportDetail] Lookup data fetched - Databases:', this.databases.length, 'Departments:', this.departments.length, 'Users:', this.users.length);
        }
      }, err => {
        console.warn('[ReportDetail] Failed to fetch lookup data', err);
      });
    }
  }

  initializeScheduleType() {
    if (!this.report) return;
    console.log('[ReportDetail] initializeScheduleType - Checking report:', {
      hasAdhoc: !!this.report.Adhoc,
      hasMonth: !!this.report.Month,
      hasWeek: !!this.report.Week,
      hasHour: !!this.report.Hour,
      hasMinute: !!this.report.Minute
    });
    if (this.report.Adhoc) {
      this.report.scheduleType = 'Ad Hoc';
      // Populate adhoc date fields from Adhoc.fdDateTime if available
      if (this.report.Adhoc.fdDateTime) {
        const dt = new Date(this.report.Adhoc.fdDateTime);
        this.report.adhocDate = dt.toISOString().split('T')[0];
        const hours24 = dt.getHours();
        // Convert 24-hour format to 12-hour format (0-23 -> 1-12)
        this.report.adhocHour = hours24 % 12 === 0 ? 12 : hours24 % 12;
        this.report.adhocMinute = dt.getMinutes();
        this.report.adhocAmPm = hours24 >= 12 ? 'PM' : 'AM';
      }
    } else if (this.report.Month) {
      this.report.scheduleType = 'Monthly';
    } else if (this.report.Week) {
      this.report.scheduleType = 'Weekly';
    } else if (this.report.Hour) {
      this.report.scheduleType = 'Hourly';
    } else if (this.report.Minute) {
      this.report.scheduleType = 'By Minute';
    } else {
      this.report.scheduleType = 'Ad Hoc';
    }
    console.log('[ReportDetail] Schedule type set to:', this.report.scheduleType);
  }

  createEmptyReport() {
    const now = new Date();
    const hours24 = now.getHours();
    // Convert 24-hour format to 12-hour format (0-23 -> 1-12)
    const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
    
    return {
      fnReportID: 0,
      fcReportName: '',
      fcSQL: '',
      fnConnectionID: null,
      fnDepartmentID: null,
      fnUserID: null,
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
      Status: { fnStatusId: 1 }, // Initialize Status so buttons show
      scheduleType: 'Ad Hoc',
      adhocDate: now.toISOString().split('T')[0],
      adhocHour: hours12,
      adhocMinute: now.getMinutes(),
      adhocAmPm: hours24 >= 12 ? 'PM' : 'AM'
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

  canSuspendReport(): boolean {
    return this.report?.Status != null && this.report.Status.fnStatusId != 6;
  }

  canActivateReport(): boolean {
    return this.report?.Status != null && this.report.Status.fnStatusId == 6;
  }

  suspendReport() {
    if (!this.report) return;
    const payload = { Report: this.report, SuspendFlag: true };
    this.reportsService.activeSuspendReport(payload).subscribe(r => {
      alert('Report suspended successfully.');
      this.router.navigate(['/reports']);
    }, err => {
      console.error('Suspend failed', err);
      alert('Suspend failed. See console for details.');
    });
  }

  activateReport() {
    if (!this.report) return;
    const payload = { Report: this.report, SuspendFlag: false };
    this.reportsService.activeSuspendReport(payload).subscribe(r => {
      alert('Report activated successfully.');
      this.router.navigate(['/reports']);
    }, err => {
      console.error('Activate failed', err);
      alert('Activate failed. See console for details.');
    });
  }

  cancel() {
    this.router.navigate(['/reports']);
  }

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

  onDatabaseChange() {
    if (!this.report?.fnConnectionID) return;
    const db = this.databases.find(d => d.fnDatabaseConnectionID === this.report.fnConnectionID);
    if (db) {
      this.report.DatabaseConnection = db;
    }
  }

  onFrequencyChange() {
    if (!this.report.scheduleType) return;
    
    // Clear all schedule types
    this.report.Month = null;
    this.report.Week = null;
    this.report.Hour = null;
    this.report.Minute = null;
    this.report.Adhoc = null;

    switch (this.report.scheduleType) {
      case 'Monthly':
        this.report.Month = {
          fnRecurrenceMonths: 1,
          fnRunOnLastDay: false,
          fnDayOfMonth: 1,
          fnWeekOfMonth: null,
          fnDayOfWeek: null,
          fnRunMonthEnd: false,
          fnRunHour: 0,
          fnRunMinute: 0
        };
        break;
      case 'Weekly':
        this.report.Week = {
          fnSunday: false,
          fnMonday: true,
          fnTuesday: true,
          fnWednesday: true,
          fnThursday: true,
          fnFriday: true,
          fnSaturday: false,
          fnRunHour: 7,
          fnRunMinute: 0,
          fnRunAmPm: 'AM'
        };
        break;
      case 'Hourly':
        this.report.Hour = {
          fnRecurrenceHours: 1,
          fnRunMinute: 0,
          fnStartHour: 6,
          fnStartAmPm: 'AM',
          fnEndHour: 6,
          fnEndAmPm: 'PM'
        };
        break;
      case 'By Minute':
        this.report.Minute = { fnRecurrenceMinutes: 1 };
        break;
      case 'Ad Hoc':
      default:
        this.report.Adhoc = { fdDateTime: new Date().toISOString() };
        this.report.adhocDate = new Date().toISOString().split('T')[0];
        const hours24 = new Date().getHours();
        this.report.adhocHour = hours24 % 12 === 0 ? 12 : hours24 % 12;
        this.report.adhocMinute = new Date().getMinutes();
        this.report.adhocAmPm = hours24 >= 12 ? 'PM' : 'AM';
    }
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

  onAttachmentChange() {
    // When Attach File is unchecked, clear attachment-related fields
    if (!this.report?.EmailReport?.fnAttachment) {
      this.report.EmailReport.fcAttachmentName = '';
      this.report.EmailReport.fnSendSecure = false;
      this.report.EmailReport.fnZipFile = false;
      this.report.EmailReport.fcZipPassword = '';
    }
  }

  // Sheets CRUD
  addSheet() {
    const newSheet = { fnSheetID: 0, fnReportID: this.report?.fnReportID || 0, fcSheetName: '', fnHide: false, fnDelete: false };
    this.report.Sheets = this.report.Sheets || [];
    this.report.Sheets.push(newSheet);
  }

  removeSheet(idx: number) {
    if (!this.report?.Sheets) return;
    this.report.Sheets.splice(idx, 1);
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
      base.Status = payload.Status || (payload.Report as any).Status || base.Status || { fnStatusId: 1 };
      base.Logs = payload.Logs || payload.ErrorLogs || (payload.Report as any).Logs || (payload.Report as any).ErrorLogs || base.Logs || [];
      console.log('[normalizeReportPayload] Extracted Logs:', base.Logs);
      console.log('[normalizeReportPayload] Extracted Status:', base.Status);

      // Set initial dropdown values if available
      if (base.DatabaseConnection && !base.fnConnectionID) {
        base.fnConnectionID = base.DatabaseConnection.fnConnectionID;
        console.log('[normalizeReportPayload] Set fnConnectionID from DatabaseConnection:', base.fnConnectionID);
      }
      if (base.Department && !base.fnDepartmentID) {
        base.fnDepartmentID = base.Department.fnDepartmentID;
        console.log('[normalizeReportPayload] Set fnDepartmentID from Department:', base.fnDepartmentID);
      }
      if (base.User && !base.fnUserID) {
        base.fnUserID = base.User.fnUserID;
        console.log('[normalizeReportPayload] Set fnUserID from User:', base.fnUserID);
      }

      return { report: base, fileExtensions: payload.FileExtensions, delimiters: payload.Delimiters };
    }

    // If payload already looks flattened (has fnReportID or fcReportName), use as-is
    if (payload.fnReportID !== undefined || payload.fcReportName !== undefined) {
      payload.Status = payload.Status || { fnStatusId: 1 };
      payload.Logs = payload.Logs || payload.ErrorLogs || [];
      console.log('[normalizeReportPayload] Flattened Logs:', payload.Logs);
      console.log('[normalizeReportPayload] Flattened Status:', payload.Status);
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
