import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserRecord, UserItem, UserList, UserEdit, UserComplex } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UsersService {
  // API base and endpoints (update host/port if different)
  private apiHost = 'http://localhost:55009';
  private base = `${this.apiHost}/api/user`;
  private jsonHeaders = { headers: { 'Content-Type': 'application/json' } };

  constructor(private http: HttpClient) {}

  // The backend exposes a POST endpoint for retrieving users
  // POST http://localhost:55009/api/user/getusers
  // Returns a UserList wrapper object
  getUsers(): Observable<UserList> {
    const url = `${this.base}/getusers`;
    return this.http.post<UserList>(url, {}, this.jsonHeaders).pipe(catchError(err => {
      console.warn('Users API not available, falling back to local sample asset', err);
      // If backend fails, return the local sample JSON from assets
      return this.http.get<UserList>('/assets/sample-userlist.json').pipe(catchError(() => {
        return of({ Users: [], Departments: [], HasUserEditAccess: false } as UserList);
      }));
    }));
  }

  // The backend may return a UserEdit payload for a single user's edit view
  getUser(id: number): Observable<UserEdit | null> {
    const url = `${this.base}/getuser/${id}`;
    return this.http.get<UserEdit>(url).pipe(catchError(err => {
      console.warn('getUser failed', err);
      return of(null);
    }));
  }

  // The backend uses a single save endpoint for creating/updating users (example: POST /api/saveuser)
  // We'll accept UserEdit or UserComplex depending on API expectations. Keep using UserItem for simple payloads until you confirm.
  createUser(payload: UserEdit | UserComplex | UserItem): Observable<any> {
    const url = `${this.base}/create`;
    return this.http.post<any>(url, payload, this.jsonHeaders).pipe(catchError(err => {
      console.error('createUser failed', err);
      throw err;
    }));
  }

  updateUser(id: number, payload: UserEdit | UserComplex | UserItem): Observable<any> {
    const url = `${this.base}/update/${id}`;
    return this.http.put<any>(url, payload, this.jsonHeaders).pipe(catchError(err => {
      console.error('updateUser failed', err);
      throw err;
    }));
  }

  deleteUser(id: number): Observable<void> {
    const url = `${this.base}/delete/${id}`;
    return this.http.post<void>(url, {}, this.jsonHeaders).pipe(catchError(err => {
      console.error('deleteUser failed', err);
      throw err;
    }));
  }
}
