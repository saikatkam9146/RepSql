import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../navbar.component';

@Component({
  selector: 'app-create-database',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent],
  templateUrl: './create-database.component.html',
  styleUrls: ['./create-database.component.scss']
})
export class CreateDatabaseComponent {
  newDatabase: any = {
    fnConnectionID: null,
    fcConnectionName: '',
    fcConnectionType: '',
    fcProvider: '',
    fcDataSource: '',
    fcInitialCatalog: '',
    fcIntegratedSecurity: '',
    fcTrustedConnection: '',
    fnDatabaseActive: true,
    fdLastUpdate: '',
    fcSchema: null
  };

  static databases: any[] = [];

  saveDatabase() {
    // Simulate API call by adding to static databases array
    const nextId = CreateDatabaseComponent.databases.length > 0 ? Math.max(...CreateDatabaseComponent.databases.map((d: any) => d.fnConnectionID)) + 1 : 1;
    this.newDatabase.fnConnectionID = nextId;
    CreateDatabaseComponent.databases.push({ ...this.newDatabase });
    alert('Database created and added!');
  }
}
