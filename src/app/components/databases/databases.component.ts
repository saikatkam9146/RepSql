import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Database {
  fnConnectionID: number;
  fcConnectionName: string;
  fcConnectionType: string;
  fcProvider: string;
  fcDataSource: string;
  fcInitialCatalog: string;
  fcIntegratedSecurity: string;
  fcTrustedConnection: string;
  fnDatabaseActive: boolean;
  fdLastUpdate: string;
  fcSchema: string | null;
}

@Component({
  selector: 'app-databases',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './databases.component.html',
  styleUrls: ['./databases.component.scss']
})
export class DatabasesComponent implements OnInit {
  navigateToDatabaseDetails(database: Database, index: number) {
    this.router.navigate(['/database-details', database.fnConnectionID]);
  }
  constructor(private router: Router) {}
  navigateToEditDatabase(database: Database, index: number) {
    this.router.navigate(['/edit-database', database.fnConnectionID]);
  }
  databases: Database[] = [];
  selectedDatabase: Database | null = null;
  editIndex: number | null = null;
  // showAddDatabase and newDatabase are no longer needed for page navigation

  ngOnInit() {
    this.databases = [
      {
        fnConnectionID: 1272,
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
      },
      {
        fnConnectionID: 1273,
        fcConnectionName: 'SQLScheduler',
        fcConnectionType: 'SQL Server',
        fcProvider: 'System.Data.SqlClient',
        fcDataSource: 'db-sgb-t, 3085',
        fcInitialCatalog: 'SQLScheduler',
        fcIntegratedSecurity: 'TRUE',
        fcTrustedConnection: 'TRUE',
        fnDatabaseActive: true,
        fdLastUpdate: '2025-02-28T13:50:57.247',
        fcSchema: null
      },
      {
        fnConnectionID: 1274,
        fcConnectionName: 'SQLScheduler',
        fcConnectionType: 'SQL Server',
        fcProvider: 'System.Data.SqlClient',
        fcDataSource: 'db-ssO-t, 3085',
        fcInitialCatalog: 'SQLScheduler',
        fcIntegratedSecurity: 'TRUE',
        fcTrustedConnection: 'TRUE',
        fnDatabaseActive: true,
        fdLastUpdate: '2025-02-28T13:50:57.247',
        fcSchema: null
      },
      {
        fnConnectionID: 1275,
        fcConnectionName: 'SQLScheduler',
        fcConnectionType: 'SQL Server',
        fcProvider: 'System.Data.SqlClient',
        fcDataSource: 'db-RSO-t, 3085',
        fcInitialCatalog: 'SQLScheduler',
        fcIntegratedSecurity: 'TRUE',
        fcTrustedConnection: 'TRUE',
        fnDatabaseActive: true,
        fdLastUpdate: '2025-02-28T13:50:57.247',
        fcSchema: null
      }
    ];
  }

  showDetails(database: Database) {
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