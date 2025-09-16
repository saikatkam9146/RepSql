import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../navbar.component';

@Component({
  selector: 'app-database-details',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './database-details.component.html',
  styleUrls: ['./database-details.component.scss']
})
export class DatabaseDetailsComponent {
  databaseId: number | null = null;
  database: any = null;

  constructor(private route: ActivatedRoute) {
    this.route.params.subscribe(params => {
      this.databaseId = +params['id'];
      // TODO: Fetch database by ID from a service or mock data
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
    });
  }
}
