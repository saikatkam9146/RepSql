import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../navbar.component';

@Component({
  selector: 'app-edit-database',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './edit-database.component.html',
  styleUrls: ['./edit-database.component.scss']
})
export class EditDatabaseComponent {
  databaseId: number | null = null;
  database: any = null;

  constructor() {
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
      fcSchema: null
    };
  }

  saveDatabase() {
    // Simulate API update by finding and updating database in static databases array
    const idx = (window as any).CreateDatabaseComponent?.databases?.findIndex((d: any) => d.fnConnectionID === this.database.fnConnectionID);
    if (idx !== undefined && idx !== -1) {
      (window as any).CreateDatabaseComponent.databases[idx] = { ...this.database };
      alert('Database updated!');
    } else {
      alert('Database not found!');
    }
  }

  cancel() {
    // TODO: Replace with navigation logic
    alert('Cancelled.');
  }
}
