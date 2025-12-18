import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ReportList, Setup, CheckSQL, ActiveSuspendReport, ProcessReportQuery, ReportComplex, Export } from '../models/reports.model';
import { ReportQueryOptions } from '../models/report-query-options.model';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private apiHost = 'http://localhost:55009';
  private base = `${this.apiHost}/api/report`;

  private jsonOptionsWithCredentials = { withCredentials: true };

  constructor(private http: HttpClient) {}

  // GET that returns whether current user has access to the Reports app
  hasApplicationAccess(): Observable<boolean> {
    const url = `${this.base}/hasapplicationaccess`;
    return this.http.get<{ hasAccess: boolean }>(url, this.jsonOptionsWithCredentials).pipe(
      map(r => (r as any)?.hasAccess ?? true),
      catchError(err => {
        console.warn('hasApplicationAccess failed, assuming access for dev', err);
        return of(true);
      })
    );
  }

  // POST -> GetSetupData returns Setup
  getSetupData(): Observable<Setup> {
    const url = `${this.base}/getsetupdata`;
    return this.http.post<Setup>(url, null, this.jsonOptionsWithCredentials).pipe(catchError(err => {
      console.warn('getSetupData failed, falling back to asset', err);
      return this.http.get<Setup>('/assets/sample-setupdata.json').pipe(catchError(e => {
        console.error('fallback sample-setupdata read failed', e);
        return of({ Users: [], Departments: [], DatabaseConnection: [] } as Setup);
      }));
    }));
  }

  // POST -> GetReports(ReportQueryOptions)
  getReports(query: ReportQueryOptions): Observable<ReportList> {
    const url = `${this.base}/getreports`;
    return this.http.post<ReportList>(url, query, this.jsonOptionsWithCredentials).pipe(catchError(err => {
      console.warn('getReports failed, falling back to asset', err);
      return this.http.get<ReportList>('/assets/sample-reports.json').pipe(catchError(e => {
        console.error('fallback sample-reports read failed', e);
        return of({ Total: 0, Reports: [], Departments: [], Users: [] } as ReportList);
      }));
    }));
  }

  // POST /api/report/GetReport (no params) returns ReportEdit object with initial setup data for creating
  // Also fetches Databases, Departments, Users from getSetupData() and merges them
  getReportSetup(): Observable<any> {
    const url = `${this.base}/GetReport`;
    console.log('[ReportsService] getReportSetup() - POST', url, 'with empty body (no params)');
    
    // Fetch both report setup and master setup data in parallel
    return forkJoin({
      report: this.http.post<any>(url, {}, this.jsonOptionsWithCredentials).pipe(
        catchError(err => {
          console.warn('getReportSetup report endpoint failed', err);
          return of({
            fnReportID: 0,
            fcReportName: '',
            fcSQL: '',
            Exports: [],
            EmailLists: [],
            EmailReport: { fnDisable: false, fcFrom: '', fcSubject: '', fcBody: '' }
          });
        })
      ),
      setup: this.getSetupData().pipe(
        catchError(err => {
          console.warn('getReportSetup setup data failed', err);
          return of({ Users: [], Departments: [], DatabaseConnection: [] });
        })
      )
    }).pipe(
      map(({ report, setup }) => {
        // Merge setup data into report response
        const merged = {
          ...report,
          Databases: setup.DatabaseConnection || [],
          Departments: setup.Departments || [],
          Users: setup.Users || []
        } as any;
        console.log('[ReportsService] getReportSetup merged - Databases count:', merged.Databases.length, 'Departments count:', merged.Departments.length, 'Users count:', merged.Users.length);
        return merged;
      }),
      catchError(err => {
        console.warn('getReportSetup forkJoin failed, returning minimal defaults', err);
        return of({
          fnReportID: 0,
          fcReportName: '',
          fcSQL: '',
          Exports: [],
          EmailLists: [],
          EmailReport: { fnDisable: false, fcFrom: '', fcSubject: '', fcBody: '' },
          Databases: [],
          Departments: [],
          Users: []
        });
      })
    );
  }

  // POST /api/report/GetReport(id, isAdmin) returns ReportEdit object for editing
  // Also fetches Databases, Departments, Users and merges them with report data
  getReport(reportid: number) {
    const url = `${this.base}/GetReport?id=${reportid}&isAdmin=1`;
    console.log('[ReportsService] getReport() - POST', url);
    
    // Fetch both report data and master setup data in parallel
    return forkJoin({
      report: this.http.post<any>(url, {}, this.jsonOptionsWithCredentials).pipe(
        catchError(err => {
          console.warn('getReport report endpoint failed', err);
          return of(null);
        })
      ),
      setup: this.getSetupData().pipe(
        catchError(err => {
          console.warn('getReport setup data failed', err);
          return of({ Users: [], Departments: [], DatabaseConnection: [] });
        })
      )
    }).pipe(
      map(({ report, setup }) => {
        if (!report) {
          // Fallback to sample data if API fails
          return null;
        }
        // Merge setup data into report response
        const merged = {
          ...report,
          Databases: setup.DatabaseConnection || [],
          Departments: setup.Departments || [],
          Users: setup.Users || []
        } as any;
        console.log('[ReportsService] getReport merged - Databases count:', merged.Databases.length, 'Databases:', merged.Databases.map((d: any) => ({ id: d.fnConnectionID, name: d.fcConnectionName })));
        console.log('[ReportsService] getReport merged - fnConnectionID from report:', merged.fnConnectionID || report.fnConnectionID);
        return merged;
      }),
      catchError(err => {
        console.warn('getReport forkJoin failed, trying sample data fallback', err);
        return this.http.get<ReportList>('/assets/sample-reports.json').pipe(map(list => {
          const found = (list.Reports || []).find(r => r.Report?.fnReportID === reportid) as any;
          if (found) {
            // Add empty lookup arrays if not in sample
            return {
              ...found,
              Databases: found.Databases || [],
              Departments: found.Departments || [],
              Users: found.Users || []
            } as any;
          }
          return null;
        }), catchError(e => {
          console.error('fallback sample-reports read failed', e);
          return of(null);
        }));
      })
    );
  }

  // Create a new report. If backend fails, fall back to localStorage-based persistence so dev/test flow continues.
  createReport(payload: any) {
    const url = `${this.base}/create`;
    return this.http.post<any>(url, payload, this.jsonOptionsWithCredentials).pipe(catchError(err => {
      console.warn('createReport failed, saving to localStorage fallback', err);
      // read existing fallback list (try localStorage first, then asset)
      try {
        const raw = localStorage.getItem('reports.fallback');
        if (raw) {
          const parsed = JSON.parse(raw) as ReportList;
          parsed.Reports = parsed.Reports || [];
          // create a minimal wrapper and push
          parsed.Reports.unshift(payload as any);
          localStorage.setItem('reports.fallback', JSON.stringify(parsed));
          return of({ offlineSaved: true, created: payload });
        }
      } catch (e) { /* ignore */ }
      // fall back to reading asset then store in localStorage
      return this.http.get<ReportList>('/assets/sample-reports.json').pipe(map(list => {
        list.Reports = list.Reports || [];
        list.Reports.unshift(payload as any);
        try { localStorage.setItem('reports.fallback', JSON.stringify(list)); } catch (e) { /* ignore */ }
        return { offlineSaved: true, created: payload };
      }), catchError(e => {
        console.error('createReport fallback failed', e);
        return of({ offlineSaved: false });
      }));
    }));
  }

  // Save (update) a report. Posts a ReportComplex to /savereport.
  // Falls back to localStorage if the backend is unavailable so dev flow can continue.
  saveReport(payload: any) {
    const url = `${this.base}/savereport`;
    return this.http.post<any>(url, payload, this.jsonOptionsWithCredentials).pipe(catchError(err => {
      console.warn('saveReport failed, saving to localStorage fallback', err);
      try {
        const raw = localStorage.getItem('reports.fallback');
        let list: ReportList;
        if (raw) {
          list = JSON.parse(raw) as ReportList;
        } else {
          list = { Total: 0, Reports: [], Departments: [], Users: [] } as ReportList;
        }
        list.Reports = list.Reports || [];
        // try to find an existing entry by Report.fnReportID if present
        const incoming = (payload && payload.Report) ? payload : payload;
        const id = (incoming && incoming.Report && incoming.Report.fnReportID) || (incoming && incoming.fnReportID) || 0;
        if (id && id > 0) {
          const idx = list.Reports.findIndex(r => (((r as any).Report && (r as any).Report.fnReportID) === id) || ((r as any).fnReportID === id));
          if (idx >= 0) {
            list.Reports[idx] = payload;
          } else {
            list.Reports.unshift(payload);
          }
        } else {
          list.Reports.unshift(payload);
        }
        localStorage.setItem('reports.fallback', JSON.stringify(list));
        return of({ offlineSaved: true, saved: payload });
      } catch (e) {
        console.error('saveReport fallback failed', e);
        return of({ offlineSaved: false });
      }
    }));
  }

  // POST /api/report/CheckSQLSyntax with CheckSQL payload (DatabaseConnectionID, SQL)
  // Returns ProcessReportQuery with ProcessStatus and SQLErrorMsg
  checkSQLSyntax(checkSQL: CheckSQL): Observable<ProcessReportQuery> {
    const url = `${this.base}/CheckSQLSyntax`;
    return this.http.post<ProcessReportQuery>(url, checkSQL, this.jsonOptionsWithCredentials).pipe(catchError(err => {
      console.warn('checkSQLSyntax failed', err);
      return of({ ProcessStatus: 0, SQLErrorMsg: 'SQL validation unavailable (offline)' } as ProcessReportQuery);
    }));
  }

  // POST /api/report/CheckValidPath with Export payload
  // Returns boolean or status indicating if path is valid
  checkValidPath(exportData: Export): Observable<any> {
    const url = `${this.base}/CheckValidPath`;
    return this.http.post<any>(url, exportData, this.jsonOptionsWithCredentials).pipe(catchError(err => {
      console.warn('checkValidPath failed', err);
      return of({ IsValid: true, Message: 'Path validation unavailable (offline)' });
    }));
  }

  // POST /api/report/RescheduleReport with ReportComplex
  // Returns success/status response
  rescheduleReport(report: ReportComplex): Observable<any> {
    const url = `${this.base}/RescheduleReport`;
    return this.http.post<any>(url, report, this.jsonOptionsWithCredentials).pipe(catchError(err => {
      console.warn('rescheduleReport failed', err);
      return of({ Success: false, Message: 'Reschedule failed (offline)' });
    }));
  }

  // POST /api/report/ActiveSuspendReport with ActiveSuspendReport payload (Report, SuspendFlag)
  // Returns success/status response
  activeSuspendReport(payload: ActiveSuspendReport): Observable<any> {
    const url = `${this.base}/ActiveSuspendReport`;
    return this.http.post<any>(url, payload, this.jsonOptionsWithCredentials).pipe(catchError(err => {
      console.warn('activeSuspendReport failed', err);
      return of({ Success: false, Message: 'Suspend/Resume failed (offline)' });
    }));
  }
}
