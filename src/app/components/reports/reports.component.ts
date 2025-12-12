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
            <button class="refresh-btn" title="Refresh reports" (click)="refreshReports()">⟳</button>
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
              <th>Status</th>
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
              <td class="email-cell">{{ hasEmail(r) ? '✉️' : '' }}</td>
              <td>{{ r.Report.fdRunDate ? (r.Report.fdRunDate | date:'short') : '—' }}</td>
              <td class="status-cell" [innerHTML]="getStatusSymbol(r)"></td>
              <td>{{ r.Report.fnRunTimeDurationSeconds ? r.Report.fnRunTimeDurationSeconds + 's' : '—' }}</td>
              <td class="row-actions">
                <button title="View" (click)="viewReport(r.Report.fnReportID)">👁️</button>
                <button title="Reschedule" (click)="rescheduleReport(r.Report.fnReportID)">▶️</button>
                <button title="Edit" (click)="editReport(r.Report.fnReportID)">✏️</button>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="table-footer" *ngIf="isLoaded">
          <div class="pagination" *ngIf="total > 0">
            <button (click)="goToPage(1)" [disabled]="currentPage<=1" title="First page">&lt;&lt;</button>
            <button (click)="prevPage()" [disabled]="currentPage<=1" title="Previous page">&lt;</button>
            <button *ngFor="let p of pageNumbers" (click)="goToPage(p)" [class.active]="p===currentPage">{{ p }}</button>
            <button (click)="nextPage()" [disabled]="currentPage>=totalPages" title="Next page">&gt;</button>
            <button (click)="goToPage(totalPages)" [disabled]="currentPage>=totalPages" title="Last page">&gt;&gt;</button>
          </div>
          <div class="filters">
            <select [(ngModel)]="filters.Status" (change)="onFilterChange()" class="filter-select">
              <option [ngValue]="8">Scheduled/In Process</option>
              <option [ngValue]="2">Completed</option>
              <option [ngValue]="6">Suspended</option>
              <option [ngValue]="7">Error</option>
              <option [ngValue]="null">All Status</option>
            </select>
            <select [(ngModel)]="filters.Type" (change)="onFilterChange()" class="filter-select">
              <option [ngValue]="null">-Type-</option>
              <option [ngValue]="1">Adhoc</option>
              <option [ngValue]="2">By Minute</option>
              <option [ngValue]="3">Hourly</option>
              <option [ngValue]="4">Weekly</option>
              <option [ngValue]="5">Monthly</option>
            </select>
            <select [(ngModel)]="filters.User" (change)="onFilterChange()" class="filter-select">
              <option [ngValue]="null">-User-</option>
              <option *ngFor="let u of setupUsers" [ngValue]="u.fnUserID">{{ u.fcFirstName }} {{ u.fcLastName }}</option>
            </select>
            <select [(ngModel)]="filters.Department" (change)="onFilterChange()" class="filter-select">
              <option [ngValue]="null">-Department-</option>
              <option *ngFor="let d of setupDepartments" [ngValue]="d.fnDepartmentID">{{ d.fcDepartmentName }}</option>
            </select>
            <select [(ngModel)]="filters.Database" (change)="onFilterChange()" class="filter-select">
              <option [ngValue]="null">-Database-</option>
              <option *ngFor="let db of setupDatabases" [ngValue]="db.fnConnectionID">{{ db.fcConnectionName }}</option>
            </select>
            <select [(ngModel)]="filters.Server" (change)="onFilterChange()" class="filter-select">
              <option [ngValue]="null">-Server-</option>
              <option *ngFor="let srv of setupServers" [ngValue]="srv">{{ srv }}</option>
            </select>
          </div>
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
      .refresh-btn { background:#2b6fbf; color:#fff; border:none; width:32px; height:32px; border-radius:50%; font-size:18px; cursor:pointer; transition:transform 0.3s; }
      .refresh-btn:hover { transform:rotate(180deg); }
      .reports-table { width: 100%; border-collapse: collapse; }
      .reports-table th, .reports-table td { border: 1px solid #eee; padding: 8px; text-align: left; }
      .reports-table th { background: #2b6fbf; color: #fff; }
      .table-footer { margin-top:0.75rem; display:flex; justify-content:space-between; align-items:center; gap:1rem; }
      .pagination { display:flex; gap:0.35rem; align-items:center; }
      .pagination button { padding:0.3rem 0.6rem; border:1px solid #ccc; background:#fff; cursor:pointer; border-radius:3px; }
      .pagination button:disabled { opacity:0.4; cursor:not-allowed; }
      .pagination button.active { background:#2b6fbf; color:#fff; border-color:#2b6fbf; }
      .filters { display:flex; gap:0.5rem; align-items:center; flex-wrap:wrap; }
      .filters select, .filters input { padding:0.35rem 0.5rem; border:1px solid #ccc; border-radius:4px; background:#fff; }
      .filters input { min-width:120px; }
      .email-cell { text-align:center; font-size:1.2rem; }
      .status-cell { text-align:center; font-size:1.2rem; }
    `
  ]
})
export class ReportsComponent implements OnInit {
  reports: ReportComplex[] = [];
  total = 0;
  isLoaded = false;

  // filters & UI state
  filters: any = { Status: 8, Type: null, User: null, Department: null, Database: null, Server: null }; // Default to ScheduledOrInProcess (status 8)
  searchTerm = '';
  statusOptions = [ { id: 0, name: 'Scheduled/In Process' }, { id: 1, name: 'Stopped' }, { id: null, name: 'All' } ];
  typeOptions = [ { id: 0, name: 'Monthly' }, { id: 1, name: 'Weekly' }, { id: 2, name: 'Hourly' } ];
  setupUsers: any[] = [];
  setupDepartments: any[] = [];
  setupDatabases: any[] = [];
  setupServers: any[] = [];

  pageSizeOptions = [10, 25, 50];
  pageSize = 10;
  currentPage = 1;
  currentQueryOptions: ReportQueryOptions = defaultReportQueryOptions();

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
        
        // Extract unique servers from databases
        const servers = this.setupDatabases.map((db: any) => db.fcDataSource).filter((s: string) => s);
        this.setupServers = [...new Set(servers)]; // Remove duplicates

        // load saved queryOptions and apply pagination
        const options = this.loadQueryOptionsFromLocalStorage();
        this.currentQueryOptions = options;
        this.pageSize = options.Take || this.pageSize;
        this.currentPage = Math.floor((options.Skip || 0) / this.pageSize) + 1;
        
        // Update filters object from loaded options
        this.filters.Status = options.Status !== null && options.Status !== undefined ? options.Status : 8;
        this.filters.Type = options.Type !== null && options.Type !== undefined ? options.Type : null;
        this.filters.User = options.User !== null && options.User !== undefined ? options.User : null;
        this.filters.Department = options.Department !== null && options.Department !== undefined ? options.Department : null;
        this.filters.Database = options.Database || null;
        this.filters.Server = options.Server || null;
        this.searchTerm = options.SearchTerm || '';
        
        this.fetchReports(options);
      }, err => { console.error(err); this.isLoaded = true; });
    }, err => { console.error(err); this.isLoaded = true; });
  }

  private loadQueryOptionsFromLocalStorage(): ReportQueryOptions {
    const q = defaultReportQueryOptions();
    try {
      const storedStatus = localStorage.getItem('Status');
      const statusNum = storedStatus == null ? null : Number(storedStatus);
      // Convert old status values (0, 1) to new default (8), or use stored value if valid
      if (statusNum === 0 || statusNum === 1) {
        q.Status = 8; // Convert old Scheduled/InProcess to ScheduledOrInProcess
      } else {
        q.Status = statusNum == null ? 8 : (isNaN(statusNum) ? 8 : statusNum);
      }
      
      const storedType = localStorage.getItem('Type');
      const typeNum = storedType == null ? null : Number(storedType);
      // Type 0 (None) is invalid, convert to null
      if (typeNum === 0) {
        q.Type = null;
      } else {
        q.Type = typeNum == null ? null : (isNaN(typeNum!) ? null : typeNum);
      }
      q.TypeDayOfWeek = localStorage.getItem('TypeDayOfWeek') ? Number(localStorage.getItem('TypeDayOfWeek')) : null;
      q.TypeDayOfMonth = localStorage.getItem('TypeDayOfMonth') ? Number(localStorage.getItem('TypeDayOfMonth')) : null;
      q.User = localStorage.getItem('User') ? Number(localStorage.getItem('User')) : null;
      q.Department = localStorage.getItem('Department') ? Number(localStorage.getItem('Department')) : null;
      const dbVal = localStorage.getItem('Database');
      q.Database = (dbVal && dbVal !== '') ? dbVal : undefined;
      const srvVal = localStorage.getItem('Server');
      q.Server = (srvVal && srvVal !== '') ? srvVal : undefined;
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
    console.log('[ReportsComponent] fetchReports called with query:', JSON.stringify(q, null, 2));
    this.isLoaded = false;
    this.reportsService.getReports(q).subscribe(list => {
      console.log('[ReportsComponent] getReports response:', list);
      console.log('[ReportsComponent] Reports count:', list.Reports?.length || 0);
      this.reports = list.Reports || [];
      this.total = list.Total || this.reports.length;
      this.isLoaded = true;
    }, err => { console.error('[ReportsComponent] getReports error:', err); this.isLoaded = true; });
  }

  onFilterChange() {
    // map filters into queryOptions and reload
    const q = defaultReportQueryOptions();
    q.Take = this.pageSize;
    q.Skip = (this.currentPage - 1) * this.pageSize;
    q.Status = this.filters.Status !== null && this.filters.Status !== undefined ? Number(this.filters.Status) : null;
    q.Type = this.filters.Type !== null && this.filters.Type !== undefined ? Number(this.filters.Type) : null;
    q.User = this.filters.User !== null && this.filters.User !== undefined ? Number(this.filters.User) : null;
    q.Department = this.filters.Department !== null && this.filters.Department !== undefined ? Number(this.filters.Department) : null;
    q.Database = (this.filters.Database && this.filters.Database !== null) ? String(this.filters.Database) : undefined;
    q.Server = (this.filters.Server && this.filters.Server !== null && this.filters.Server !== '') ? String(this.filters.Server) : undefined;
    q.SearchTerm = this.searchTerm || '';
    this.currentQueryOptions = q;
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

  editReport(id: number) { this.router.navigate(['/reports/view', id], { queryParams: { mode: 'edit' } }); }

  rescheduleReport(id: number) {
    const report = this.reports.find(r => r.Report.fnReportID === id);
    if (!report) return;
    this.reportsService.rescheduleReport(report).subscribe(r => {
      alert('Report rescheduled successfully.');
      this.fetchReports(this.currentQueryOptions);
    }, err => {
      console.error('Reschedule failed', err);
      alert('Reschedule failed. See console for details.');
    });
  }

  formatEmail(r: ReportComplex): string {
    const from = r.EmailReport?.fcFrom || '';
    return from.includes('@') ? from : '';
  }

  hasEmail(r: ReportComplex): boolean {
    const from = r.EmailReport?.fcFrom || '';
    return from.includes('@');
  }

  getStatusSymbol(r: ReportComplex): string {
    // Status: Scheduled (0) or InProcess (1) = 📅 calendar, Completed (2) = ✅, Suspended (6) = ⏸️, Error (3,4,5,7,23) = ❌
    const status = r.Report.fnStatusID;
    if (status === 0 || status === 1) return '📅'; // Scheduled or InProcess
    if (status === 2) return '<span style="color:green;">✔️</span>'; // Completed
    if (status === 6) return '⏸️'; // Suspended
    if (status === 3 || status === 4 || status === 5 || status === 7 || status === 23) return '❌'; // Any Error
    return '—';
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
    // navigate to the details page in read-only (view) mode; report-detail will
    // call GetReport(reportid, isAdmin) when an id > 0 is present.
    this.router.navigate(['/reports/view', id], { queryParams: { mode: 'view' } });
  }

  refreshReports() {
    // Reload reports using current query options
    this.fetchReports(this.currentQueryOptions);
  }
}
