import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserRecord, UserItem } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UsersService {
  // Update this base URL to your real API
  private base = 'https://localhost:5001/api/users';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<UserRecord[]> {
    return this.http.get<UserRecord[]>(this.base).pipe(catchError(err => {
      console.warn('Users API not available, falling back to empty array', err);
      return of([]);
    }));
  }

  getUser(id: number): Observable<UserRecord | null> {
    return this.http.get<UserRecord>(`${this.base}/${id}`).pipe(catchError(err => {
      console.warn('getUser failed', err);
      return of(null);
    }));
  }

  createUser(payload: UserItem): Observable<UserItem> {
    return this.http.post<UserItem>(this.base, payload).pipe(catchError(err => {
      console.error('createUser failed', err);
      throw err;
    }));
  }

  updateUser(id: number, payload: UserItem): Observable<UserItem> {
    return this.http.put<UserItem>(`${this.base}/${id}`, payload).pipe(catchError(err => {
      console.error('updateUser failed', err);
      throw err;
    }));
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`).pipe(catchError(err => {
      console.error('deleteUser failed', err);
      throw err;
    }));
  }
}
