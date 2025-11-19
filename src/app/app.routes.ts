import { Routes } from '@angular/router';
import { DatabasesComponent } from './components/databases/databases.component';
import { UsersComponent } from './components/users/users.component';
import { Component } from '@angular/core';
import { NavbarComponent } from './components/navbar.component';

export const routes: Routes = [
	{ path: '', redirectTo: 'reports', pathMatch: 'full' },
	{ path: 'reports', loadComponent: () => import('./components/reports/reports.component').then(m => m.ReportsComponent) },
	{ path: 'reports/view/:id', loadComponent: () => import('./components/report-detail/report-detail.component').then(m => m.ReportDetailComponent) },
	{ path: 'reports/create', loadComponent: () => import('./components/create-report/create-report.component').then(m => m.CreateReportComponent) },
	{ path: 'databases', component: DatabasesComponent },
	{ path: 'users', component: UsersComponent },
	{ path: 'edit-user/:id', loadComponent: () => import('./components/edit-user/edit-user.component').then(m => m.EditUserComponent) },
	{ path: 'edit-database/:id', loadComponent: () => import('./components/edit-database/edit-database.component').then(m => m.EditDatabaseComponent) },
	{ path: 'create-user', loadComponent: () => import('./components/create-user/create-user.component').then(m => m.CreateUserComponent) },
	{ path: 'create-database', loadComponent: () => import('./components/create-database/create-database.component').then(m => m.CreateDatabaseComponent) },
	{ path: 'user-details/:id', loadComponent: () => import('./components/user-details/user-details.component').then(m => m.UserDetailsComponent) },
	{ path: 'database-details/:id', loadComponent: () => import('./components/database-details/database-details.component').then(m => m.DatabaseDetailsComponent) },
];
