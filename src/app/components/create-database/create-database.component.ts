import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { DatabasesService } from '../../services/databases.service';
import { DatabaseConnection } from '../../models/user.model';

@Component({
  selector: 'app-create-database',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './create-database.component.html',
  styleUrls: ['./create-database.component.scss']
})
export class CreateDatabaseComponent implements OnInit {
  database: DatabaseConnection | null = null;

  constructor(private databasesService: DatabasesService, private router: Router) {}

  ngOnInit() {
    // Initialize empty database for creation
    this.database = {
      fnConnectionID: 0,
      fcConnectionName: '',
      fcConnectionType: '',
      fcProvider: '',
      fcDataSource: '',
      fcInitialCatalog: '',
      fcIntegratedSecurity: '',
      fcTrustedConnection: '',
      fnDatabaseActive: true,
      fdLastUpdate: new Date().toISOString(),
      fcSchema: ''
    } as DatabaseConnection;
  }

  isValid(): boolean {
    if (!this.database) return false;
    // First 5 fields are mandatory: Connection Name, Connection Type, Provider, Data Source, Initial Catalog
    return !!(
      this.database.fcConnectionName?.trim() &&
      this.database.fcConnectionType?.trim() &&
      this.database.fcProvider?.trim() &&
      this.database.fcDataSource?.trim() &&
      this.database.fcInitialCatalog?.trim()
    );
  }

  save() {
    if (!this.isValid()) {
      alert('Please fill in all mandatory fields: Connection Name, Connection Type, Connection Provider, Data Source, and Initial Catalog.');
      return;
    }
    if (!this.database) return;
    
    this.databasesService.saveDatabase(this.database).subscribe({
      next: (result: string) => {
        console.log('Database created:', result);
        alert('Database created successfully!');
        this.router.navigate(['/databases']);
      },
      error: (err) => {
        console.error('Failed to create database:', err);
        alert('Failed to create database. Please try again.');
      }
    });
  }

  cancel() {
    this.router.navigate(['/databases']);
  }
}
