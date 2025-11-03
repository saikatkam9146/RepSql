import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatabaseConnection } from '../../models/user.model';
import { DatabasesService } from '../../services/databases.service';

@Component({
  selector: 'app-databases',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './databases.component.html',
  styleUrls: ['./databases.component.scss']
})
export class DatabasesComponent implements OnInit {
  navigateToDatabaseDetails(database: DatabaseConnection, index: number) {
    this.router.navigate(['/database-details', database.fnConnectionID]);
  }
  constructor(private router: Router, private databasesService: DatabasesService) {}
  navigateToEditDatabase(database: DatabaseConnection, index: number) {
    this.router.navigate(['/edit-database', database.fnConnectionID]);
  }
  databases: DatabaseConnection[] = [];
  selectedDatabase: DatabaseConnection | null = null;
  loading = false;
  error: string | null = null;
  lastError: any = null;
  // Pagination
  pageSize = 10;
  currentPage = 1;

  // Filters
  statusFilter: 'all' | 'active' | 'inactive' = 'active';
  editIndex: number | null = null;
  // showAddDatabase and newDatabase are no longer needed for page navigation

  ngOnInit() {
    this.loadDatabases();
  }

  loadDatabases() {
    this.loading = true;
    this.error = null;
    this.databasesService.getDatabases().subscribe({
      next: (res) => {
        this.databases = res || [];
        this.loading = false;
      },
      error: (err) => {
        this.lastError = err;
        this.error = err?.message || 'Failed to load databases';
        console.error('DatabasesComponent.loadDatabases error', err);
        this.loading = false;
      }
    });
  }

  get filteredDatabases(): DatabaseConnection[] {
    return this.databases.filter(d => {
      if (this.statusFilter === 'active' && !d.fnDatabaseActive) return false;
      if (this.statusFilter === 'inactive' && !!d.fnDatabaseActive) return false;
      return true;
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredDatabases.length / this.pageSize));
  }

  get pagedDatabases(): DatabaseConnection[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredDatabases.slice(start, start + this.pageSize);
  }

  goToPage(page: number) {
    if (page < 1) page = 1;
    if (page > this.totalPages) page = this.totalPages;
    this.currentPage = page;
  }

  onFilterChange() {
    this.currentPage = 1;
  }

  showDetails(database: DatabaseConnection) {
    this.selectedDatabase = database;
  }

  openAddDatabase() {
    this.router.navigate(['/create-database']);
  }


  startEdit(index: number) {
    this.editIndex = index;
  }

  saveEdit(index: number) {
    this.editIndex = null;
  }

  cancelEdit() {
    this.editIndex = null;
  }
}