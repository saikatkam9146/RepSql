import { Routes } from '@angular/router';
import { DatabasesComponent } from './components/databases/databases.component';
import { UsersComponent } from './components/users/users.component';
import { Component } from '@angular/core';

import { NavbarComponent } from './components/navbar.component';

@Component({
	selector: 'app-reports',
	standalone: true,
	// ...existing code...
	template: `<div class='reports-empty'><h2>Reports</h2><p>No data available.</p></div>`,
	styles: [`
		.reports-empty { margin: 2rem; text-align: center; }
		h2 { margin-bottom: 1rem; }
	`]
})
export class ReportsComponent {}

export const routes: Routes = [
	{ path: '', redirectTo: 'reports', pathMatch: 'full' },
	{ path: 'reports', loadComponent: () => Promise.resolve(ReportsComponent) },
	{ path: 'databases', component: DatabasesComponent },
	{ path: 'users', component: UsersComponent },
	{ path: 'edit-user/:id', loadComponent: () => import('./components/edit-user/edit-user.component').then(m => m.EditUserComponent) },
	{ path: 'edit-database/:id', loadComponent: () => import('./components/edit-database/edit-database.component').then(m => m.EditDatabaseComponent) },
	{ path: 'create-user', loadComponent: () => import('./components/create-user/create-user.component').then(m => m.CreateUserComponent) },
	{ path: 'create-database', loadComponent: () => import('./components/create-database/create-database.component').then(m => m.CreateDatabaseComponent) },
	{ path: 'user-details/:id', loadComponent: () => import('./components/user-details/user-details.component').then(m => m.UserDetailsComponent) },
	{ path: 'database-details/:id', loadComponent: () => import('./components/database-details/database-details.component').then(m => m.DatabaseDetailsComponent) },
];
