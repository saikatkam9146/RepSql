import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../navbar.component';

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent],
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss']
})
export class CreateUserComponent {
  newUser: any = {
    fnUserID: null,
    fcFirstName: '',
    fcLastName: '',
    fcUserNT: '',
    fcUserEmail: '',
    fnDepartmentID: null,
    fnAccessID: null,
    fcApprovalStatus: '',
    fcComments: '',
    fnRunConsolePermission: false,
    fbDeveloper: false,
    TimeZoneID: null
  };

  static users: any[] = [];

  saveUser() {
    // Simulate API call by adding to static users array
    const nextId = CreateUserComponent.users.length > 0 ? Math.max(...CreateUserComponent.users.map((u: any) => u.User.fnUserID)) + 1 : 1;
    this.newUser.fnUserID = nextId;
    CreateUserComponent.users.push({
      User: { ...this.newUser },
      Department: { fnDepartmentID: this.newUser.fnDepartmentID, fcDepartmentName: '' },
      UserAccess: { fnAccessID: this.newUser.fnAccessID, fcAccessDescription: '' },
      TimeZoneOffset: { TimeZoneID: this.newUser.TimeZoneID, TimeZoneCode: '', TimeZoneName: '', std_Offset: 0, daylight_Offset: 0 }
    });
    alert('User created and added!');
  }
}
