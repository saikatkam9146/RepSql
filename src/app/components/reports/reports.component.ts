import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReportsService } from '../../services/reports.service';
import { ReportComplex } from '../../models/reports.model';
import { defaultReportQueryOptions, ReportQueryOptions } from '../../models/report-query-options.model';

@Component({
  selector: 'app-reports-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
      <div class="reports-page">
        <div class="toolbar">
          <h2>Reports ({{ total }})</h2>
          <div class="actions">
            <input class="search-box" placeholder="Search" [(ngModel)]="searchTerm" (keyup.enter)="onSearch()" />
            <button class="add-btn" title="Add new" (click)="createNew()">+</button>
          </div>
        </div>

        <div *ngIf="!isLoaded">Loading...</div>

        <table *ngIf="isLoaded" class="reports-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>When</th>
              <th>Owner</th>
              <th>Department</th>
              <th>Email</th>
              <th>Last</th>
              <th>Duration</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of reports">
              <td>{{ r.Report.fnReportID }}</td>
              <td>{{ r.Report.fcReportName }}</td>
              <td>{{ formatWhen(r) }}</td>
              <td>{{ r.User?.fcFirstName }} {{ r.User?.fcLastName }}</td>
              <td>{{ r.Department?.fcDepartmentName }}</td>
              <td>{{ formatEmail(r) }}</td>
              <td>{{ r.Report.fdRunDate ? (r.Report.fdRunDate | date:'short') : '—' }}</td>
              <td>{{ r.Report.fnRunTimeDurationSeconds ? r.Report.fnRunTimeDurationSeconds + 's' : '—' }}</td>
              <td><button (click)="viewReport(r.Report.fnReportID)" title="View">👁️</button></td>
            </tr>
          </tbody>
        </table>

        <div class="pagination" *ngIf="isLoaded && total > 0">
          <label>Page size:
            <select [(ngModel)]="pageSize" (change)="onPageSizeChange()">
              <option *ngFor="let s of pageSizeOptions" [value]="s">{{ s }}</option>
            </select>
          </label>
          <button (click)="prevPage()" [disabled]="currentPage<=1">Previous</button>
          <button *ngFor="let p of pageNumbers" (click)="goToPage(p)" [class.active]="p===currentPage">{{ p }}</button>
          <button (click)="nextPage()" [disabled]="currentPage>=totalPages">Next</button>
        </div>

        <!-- Filters placed below the table as requested -->
        <div class="filters" *ngIf="isLoaded">
          <label>Filter by: </label>
          <select [(ngModel)]="filters.Status" (change)="onFilterChange()">
            <option value="">All Status</option>
            <option *ngFor="let s of statusOptions" [value]="s.id">{{ s.name }}</option>
          </select>
          <select [(ngModel)]="filters.Type" (change)="onFilterChange()">
            <option value="">All Type</option>
            <option *ngFor="let t of typeOptions" [value]="t.id">{{ t.name }}</option>
          </select>
          <select [(ngModel)]="filters.User" (change)="onFilterChange()">
            <option value="">All Users</option>
            <option *ngFor="let u of setupUsers" [value]="u.fnUserID">{{ u.fcFirstName }} {{ u.fcLastName }}</option>
          </select>
          <select [(ngModel)]="filters.Department" (change)="onFilterChange()">
            <option value="">All Departments</option>
            <option *ngFor="let d of setupDepartments" [value]="d.fnDepartmentID">{{ d.fcDepartmentName }}</option>
          </select>
          <select [(ngModel)]="filters.Database" (change)="onFilterChange()">
            <option value="">All Databases</option>
            <option *ngFor="let db of setupDatabases" [value]="db.fnConnectionID">{{ db.fcConnectionName }}</option>
          </select>
          <input placeholder="Server" [(ngModel)]="filters.Server" (change)="onFilterChange()" />
        </div>
      </div>
    `,
  styles: [
    `
      .reports-page { padding: 1rem; }
      .toolbar { display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem; }
      .actions { display:flex; gap:0.5rem; align-items:center; }
      .search-box { padding:6px 8px; border:1px solid #ccc; border-radius:4px; }
      .add-btn { background:#2b6fbf; color:#fff; border:none; width:32px; height:32px; border-radius:50%; font-size:18px; cursor:pointer }
      .reports-table { width: 100%; border-collapse: collapse; }
      .reports-table th, .reports-table td { border: 1px solid #eee; padding: 8px; text-align: left; }
      .reports-table th { background: #2b6fbf; color: #fff; }
      .filters { margin-top:1rem; display:flex; gap:0.5rem; align-items:center; flex-wrap:wrap; }
      .pagination { margin-top:0.5rem; display:flex; gap:0.5rem; align-items:center; }
    `
  ]
})
export class ReportsComponent implements OnInit {
  reports: ReportComplex[] = [];
  total = 0;
  isLoaded = false;

  // filters & UI state
  filters: any = {};
  searchTerm = '';
  statusOptions = [ { id: 0, name: 'Scheduled' }, { id: 1, name: 'Stopped' } ];
  typeOptions = [ { id: 0, name: 'Monthly' }, { id: 1, name: 'Weekly' }, { id: 2, name: 'Hourly' } ];
  setupUsers: any[] = [];
  setupDepartments: any[] = [];
  setupDatabases: any[] = [];

  pageSizeOptions = [10, 25, 50];
  pageSize = 10;
  currentPage = 1;

  constructor(private reportsService: ReportsService, private router: Router) {}

  ngOnInit(): void {
    // Flow: HasApplicationAccess -> GetSetupData -> GetReports
    this.reportsService.hasApplicationAccess().subscribe(has => {
      if (!has) {
        this.isLoaded = true;
        return;
      }
      this.reportsService.getSetupData().subscribe(setup => {
        // populate dropdowns from setup
        this.setupUsers = (setup && (setup as any).Users) || [];
        this.setupDepartments = (setup && (setup as any).Departments) || [];
        this.setupDatabases = (setup && (setup as any).DatabaseConnection) || [];

        // load saved queryOptions and apply pagination
        const options = this.loadQueryOptionsFromLocalStorage();
        this.pageSize = options.Take || this.pageSize;
        this.currentPage = Math.floor((options.Skip || 0) / this.pageSize) + 1;
        this.fetchReports(options);
      }, err => { console.error(err); this.isLoaded = true; });
    }, err => { console.error(err); this.isLoaded = true; });
  }

  private loadQueryOptionsFromLocalStorage(): ReportQueryOptions {
    const q = defaultReportQueryOptions();
    try {
      const storedStatus = localStorage.getItem('Status');
      q.Status = storedStatus == null ? null : (isNaN(Number(storedStatus)) ? null : Number(storedStatus));
      const storedType = localStorage.getItem('Type');
      q.Type = storedType == null ? null : (isNaN(Number(storedType)) ? null : Number(storedType));
      q.TypeDayOfWeek = localStorage.getItem('TypeDayOfWeek') ? Number(localStorage.getItem('TypeDayOfWeek')) : null;
      q.TypeDayOfMonth = localStorage.getItem('TypeDayOfMonth') ? Number(localStorage.getItem('TypeDayOfMonth')) : null;
      q.User = localStorage.getItem('User') ? Number(localStorage.getItem('User')) : null;
      q.Department = localStorage.getItem('Department') ? Number(localStorage.getItem('Department')) : null;
  q.Database = localStorage.getItem('Database') ?? undefined;
  q.Server = localStorage.getItem('Server') ?? undefined;
      q.SearchTerm = localStorage.getItem('SearchTerm') || '';
      q.Skip = localStorage.getItem('Skip') ? Number(localStorage.getItem('Skip')) : 0;
      // Keep Take/OrderBy/OrderByReverse from defaults or optionally from persisted values
      return q;
    } catch (e) {
      console.error('loadQueryOptionsFromLocalStorage failed', e);
      return q;
    }
  }

  private saveQueryOptionsToLocalStorage(q: ReportQueryOptions) {
    try {
      localStorage.setItem('Status', q.Status == null ? '' : String(q.Status));
      localStorage.setItem('Type', q.Type == null ? '' : String(q.Type));
      localStorage.setItem('TypeDayOfWeek', q.TypeDayOfWeek == null ? '' : String(q.TypeDayOfWeek));
      localStorage.setItem('TypeDayOfMonth', q.TypeDayOfMonth == null ? '' : String(q.TypeDayOfMonth));
      localStorage.setItem('User', q.User == null ? '' : String(q.User));
      localStorage.setItem('Department', q.Department == null ? '' : String(q.Department));
      localStorage.setItem('Database', q.Database == null ? '' : String(q.Database));
      localStorage.setItem('Server', q.Server == null ? '' : String(q.Server));
      localStorage.setItem('SearchTerm', q.SearchTerm || '');
      localStorage.setItem('Skip', String(q.Skip || 0));
    } catch (e) { console.warn('saveQueryOptionsToLocalStorage failed', e); }
  }

  private fetchReports(q: ReportQueryOptions) {
    this.isLoaded = false;
    this.reportsService.getReports(q).subscribe(list => {
      this.reports = list.Reports || [];
      this.total = list.Total || this.reports.length;
      this.isLoaded = true;
    }, err => { console.error(err); this.isLoaded = true; });
  }

  onFilterChange() {
    // map filters into queryOptions and reload
    const q = defaultReportQueryOptions();
    q.Take = this.pageSize;
    q.Skip = (this.currentPage - 1) * this.pageSize;
    q.Status = this.filters.Status ? Number(this.filters.Status) : null;
    q.Type = this.filters.Type ? Number(this.filters.Type) : null;
    q.User = this.filters.User ? Number(this.filters.User) : null;
    q.Department = this.filters.Department ? Number(this.filters.Department) : null;
    q.Database = this.filters.Database ? String(this.filters.Database) : undefined;
    q.Server = this.filters.Server ? String(this.filters.Server) : undefined;
    q.SearchTerm = this.searchTerm || '';
    this.saveQueryOptionsToLocalStorage(q);
    this.fetchReports(q);
  }

  onSearch() { this.currentPage = 1; this.onFilterChange(); }

  onPageSizeChange() { this.currentPage = 1; this.onFilterChange(); }

  get totalPages(): number { return Math.max(1, Math.ceil((this.total || 0) / this.pageSize)); }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const tp = this.totalPages;
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(tp, start + 4);
    for (let p = start; p <= end; p++) pages.push(p);
    return pages;
  }

  prevPage() { if (this.currentPage > 1) { this.currentPage--; this.onFilterChange(); } }
  nextPage() { if (this.currentPage < this.totalPages) { this.currentPage++; this.onFilterChange(); } }
  goToPage(p: number) { if (p !== this.currentPage) { this.currentPage = p; this.onFilterChange(); } }

  createNew() { this.router.navigate(['/reports/create']); }

  formatEmail(r: ReportComplex): string {
    const from = r.EmailReport?.fcFrom || '';
    return from.includes('@') ? from : '';
  }

  formatWhen(r: ReportComplex): string {
    // Prefer Month > Week > Hour > Minute > Adhoc
    if (r.Month) {
      const hr = r.Month.fnRunHour ?? 0;
      const min = r.Month.fnRunMinute ?? 0;
      const prettyTime = this.prettyTime(hr, min);
      const months = r.Month.fnRecurrenceMonths ?? 1;
      if (months <= 1) return `Every month at ${prettyTime}`;
      return `Every ${months} months at ${prettyTime}`;
    }
    if (r.Week) {
      const days: string[] = [];
      if (r.Week.fnSunday) days.push('Sun');
      if (r.Week.fnMonday) days.push('Mon');
      if (r.Week.fnTuesday) days.push('Tue');
      if (r.Week.fnWednesday) days.push('Wed');
      if (r.Week.fnThursday) days.push('Thu');
      if (r.Week.fnFriday) days.push('Fri');
      if (r.Week.fnSaturday) days.push('Sat');
      const hr = r.Week.fnRunHour ?? 0;
      const min = r.Week.fnRunMinute ?? 0;
      return `${days.length ? days.join(',') : 'Weekly'} at ${this.prettyTime(hr, min)}`;
    }
    if (r.Hour) {
      const start = r.Hour.fnRunHourStart ?? 0;
      const end = r.Hour.fnRunHourEnd ?? 0;
      return `Every ${r.Hour.fnRecurrenceHours ?? 1} hour(s) between ${start} and ${end}`;
    }
    if (r.Minute) {
      return `Every ${r.Minute.fnStatusID ?? 1} minute(s)`;
    }
    if (r.Adhoc) {
      return `Adhoc`;
    }
    return '—';
  }

  private prettyTime(hour: number, minute: number): string {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h = ((hour + 11) % 12) + 1;
    const m = minute.toString().padStart(2, '0');
    return `${h}:${m} ${ampm}`;
  }

  viewReport(id: number) {
    // navigate to a details page (minimal implementation exists)
    this.router.navigate(['/reports/view', id]);
  }
}
