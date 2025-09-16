import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../navbar.component';

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss']
})
export class EditUserComponent {
  userId: number | null = null;
  user: any = null;

  constructor() {
    // Simulate ActivatedRoute for demo; replace with ActivatedRoute in real app
    this.userId = 1;
    this.user = {
      fnUserID: this.userId,
      fcFirstName: 'John',
      fcLastName: 'Doe',
      fcUserNT: 'jdoe',
      fcUserEmail: 'john.doe@example.com',
      fnDepartmentID: 1,
      fnAccessID: 1,
      fcApprovalStatus: 'Approved',
      fcComments: '',
      fnRunConsolePermission: true,
      fbDeveloper: false,
      TimeZoneID: 1,
      Department: { fnDepartmentID: 1, fcDepartmentName: 'IT' },
      UserAccess: { fnAccessID: 1, fcAccessDescription: 'Admin' },
      TimeZoneOffset: { TimeZoneID: 1, TimeZoneCode: 'EST', TimeZoneName: 'Eastern', std_Offset: -5, daylight_Offset: -4 }
    };
  }

  saveUser() {
    // Simulate API update by finding and updating user in static users array
    const idx = (window as any).CreateUserComponent?.users?.findIndex((u: any) => u.User.fnUserID === this.user.fnUserID);
    if (idx !== undefined && idx !== -1) {
      (window as any).CreateUserComponent.users[idx].User = { ...this.user };
      alert('User updated!');
    } else {
      alert('User not found!');
    }
  }

  cancel() {
    // TODO: Replace with navigation logic
    alert('Cancelled.');
  }
}
