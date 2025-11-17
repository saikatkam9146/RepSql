import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserRecord, UserItem, UserList, UserEdit, UserComplex } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UsersService {
  // API base and endpoints (update host/port if different)
  private apiHost = 'http://localhost:55009';
  private base = `${this.apiHost}/api/user`;
  private jsonHeaders = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  // Options including credentials (needed for Windows auth / NTLM scenarios)
  private jsonOptionsWithCredentials = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }), withCredentials: true };

  constructor(private http: HttpClient) {}

  // The backend exposes a POST endpoint for retrieving users
  // POST http://localhost:55009/api/user/getusers
  // Returns a UserList wrapper object
  getUsers(): Observable<UserList> {
    const url = `${this.base}/getusers`;
  // Some backends expect an empty body for this POST; send null instead of {} to produce Content-Length: 0
  return this.http.post<UserList>(url, null, this.jsonOptionsWithCredentials).pipe(catchError(err => {
      // Log detailed error info so caller and developer can see status, url and any response body
      console.error('getUsers failed', {
        message: err?.message,
        status: err?.status,
        url: url,
        error: err?.error
      });
      // Fall back to local asset for offline/dev testing
      return this.http.get<UserList>('/assets/sample-userlist.json').pipe(catchError(innerErr => {
        console.error('Fallback asset read failed', innerErr);
        return of({ Users: [], Departments: [], HasUserEditAccess: false } as UserList);
      }));
    }));
  }

  // The backend may return a UserEdit payload for a single user's edit view.
  // Some APIs expose this as a POST (body contains id) rather than a GET. Use POST to match the API that expects GetUser(int id) via POST.
  getUser(id: number): Observable<UserEdit | null> {
    const url = `${this.base}/getuser`;
    // send id in the body as { id: <number> } which matches common Web API POST patterns
    return this.http.post<UserEdit>(url, { id }, { withCredentials: true }).pipe(catchError(err => {
      console.error('getUser failed', { message: err?.message, status: err?.status, url, error: err?.error });
      return of(null);
    }));
  }

  // The backend uses a single save endpoint for creating/updating users (example: POST /api/saveuser)
  // We'll accept UserEdit or UserComplex depending on API expectations. Keep using UserItem for simple payloads until you confirm.
  createUser(payload: UserEdit | UserComplex | UserItem): Observable<any> {
    const url = `${this.base}/create`;
    return this.http.post<any>(url, payload, this.jsonOptionsWithCredentials).pipe(catchError(err => {
      console.error('createUser failed', { message: err?.message, status: err?.status, url, error: err?.error });
      return throwError(() => err);
    }));
  }

  updateUser(id: number, payload: UserEdit | UserComplex | UserItem): Observable<any> {
    const url = `${this.base}/update/${id}`;
    return this.http.put<any>(url, payload, this.jsonOptionsWithCredentials).pipe(catchError(err => {
      console.error('updateUser failed', { message: err?.message, status: err?.status, url, error: err?.error });
      return throwError(() => err);
    }));
  }

  deleteUser(id: number): Observable<void> {
    const url = `${this.base}/delete/${id}`;
    return this.http.post<void>(url, {}, this.jsonOptionsWithCredentials).pipe(catchError(err => {
      console.error('deleteUser failed', { message: err?.message, status: err?.status, url, error: err?.error });
      return throwError(() => err);
    }));
  }
}
