import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { DatabasesService } from '../../services/databases.service';
import { DatabaseConnection } from '../../models/user.model';

@Component({
  selector: 'app-edit-database',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './edit-database.component.html',
  styleUrls: ['./edit-database.component.scss']
})
export class EditDatabaseComponent implements OnInit {
  databaseId: number | null = null;
  database: DatabaseConnection | null = null;

  constructor(private databasesService: DatabasesService, private router: Router) {}

  ngOnInit() {
    // Simulate ActivatedRoute for demo; replace with ActivatedRoute in real app
    this.databaseId = 1272;
    this.database = {
      fnConnectionID: this.databaseId,
      fcConnectionName: 'SQLScheduler',
      fcConnectionType: 'SQL Server',
      fcProvider: 'System.Data.SqlClient',
      fcDataSource: 'db-RSabcd, 3085',
      fcInitialCatalog: 'SQLScheduler',
      fcIntegratedSecurity: 'TRUE',
      fcTrustedConnection: 'TRUE',
      fnDatabaseActive: true,
      fdLastUpdate: '2025-02-28T13:50:57.247',
      fcSchema: ''
    } as DatabaseConnection;
  }

  save() {
    if (!this.database) return;
    this.databasesService.saveDatabase(this.database).subscribe({
      next: (result: string) => {
        console.log('Database saved:', result);
        alert('Database saved successfully!');
        this.router.navigate(['/databases']);
      },
      error: (err) => {
        console.error('Failed to save database:', err);
        alert('Failed to save database. Please try again.');
      }
    });
  }

  cancel() {
    this.router.navigate(['/databases']);
  }
}
