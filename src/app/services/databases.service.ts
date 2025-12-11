import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DatabaseConnection } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class DatabasesService {
  private apiHost = 'http://localhost:55009';
  private base = `${this.apiHost}/api/database`;
  private jsonOptionsWithCredentials = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }), withCredentials: true };

  constructor(private http: HttpClient) {}

  getDatabases(): Observable<DatabaseConnection[]> {
    const url = `${this.base}/getdatabases`;
    // send null body to match backend expecting empty POST
    return this.http.post<DatabaseConnection[]>(url, null, this.jsonOptionsWithCredentials).pipe(catchError(err => {
      console.error('getDatabases failed', { message: err?.message, status: err?.status, url, error: err?.error });
      // fallback to local asset
      return this.http.get<DatabaseConnection[]>('/assets/sample-databases.json').pipe(catchError(innerErr => {
        console.error('Fallback DB asset read failed', innerErr);
        return of([] as DatabaseConnection[]);
      }));
    }));
  }

  saveDatabase(dc: DatabaseConnection): Observable<string> {
    const url = `${this.base}/savedatabase`;
    return this.http.post<string>(url, dc, this.jsonOptionsWithCredentials).pipe(catchError(err => {
      console.error('saveDatabase failed', { message: err?.message, status: err?.status, url, error: err?.error });
      return throwError(() => err);
    }));
  }
}
