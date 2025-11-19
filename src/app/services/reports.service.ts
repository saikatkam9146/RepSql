import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ReportList, Setup } from '../models/reports.model';
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

  // Read a single report (POST or GET depending on API). Fallback reads the sample asset and returns matching entry.
  getReport(id: number) {
    const url = `${this.base}/getreport`;
    // some APIs expect POST { id }
    return this.http.post<any>(url, { id }, this.jsonOptionsWithCredentials).pipe(catchError(err => {
      console.warn('getReport failed, falling back to asset', err);
      return this.http.get<ReportList>('/assets/sample-reports.json').pipe(map(list => {
        const found = (list.Reports || []).find(r => r.Report?.fnReportID === id);
        return found || null;
      }), catchError(e => {
        console.error('fallback sample-reports read failed', e);
        return of(null);
      }));
    }));
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
}
