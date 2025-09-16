// ...existing code...
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface User {
  fnUserID: number;
  fcFirstName: string;
  fcLastName: string;
  fcUserNT: string;
  fcUserEmail: string;
  fnDepartmentID: number;
  fnAccessID: number;
  fcApprovalStatus: string;
  fcComments: string;
  fnRunConsolePermission: boolean;
  fbDeveloper: boolean;
  TimeZoneID: number;
}

export interface Department {
  fnDepartmentID: number;
  fcDepartmentName: string;
}

export interface UserAccess {
  fnAccessID: number;
  fcAccessDescription: string;
}

export interface TimeZoneOffset {
  TimeZoneID: number;
  TimeZoneCode: string;
  TimeZoneName: string;
  std_Offset: number;
  daylight_Offset: number;
}

export interface UserRecord {
  User: User;
  Department: Department;
  UserAccess: UserAccess;
  TimeZoneOffset: TimeZoneOffset;
}
@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  navigateToUserDetails(user: UserRecord, index: number) {
    this.router.navigate(['/user-details', user.User.fnUserID]);
  }
  constructor(private router: Router) {}
  users: UserRecord[] = [];
  selectedUser: UserRecord | null = null;
  showDetailsPopup: boolean = false;

  // Navigation to edit user page (to be implemented)
  navigateToEditUser(user: UserRecord, index: number) {
    this.router.navigate(['/edit-user', user.User.fnUserID]);
  }

  ngOnInit() {
    this.users = [
      {
        User: {
          fnUserID: 1,
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
          TimeZoneID: 1
        },
        Department: { fnDepartmentID: 1, fcDepartmentName: 'IT' },
        UserAccess: { fnAccessID: 1, fcAccessDescription: 'Admin' },
        TimeZoneOffset: { TimeZoneID: 1, TimeZoneCode: 'EST', TimeZoneName: 'Eastern', std_Offset: -5, daylight_Offset: -4 }
      }
    ];
  }

  openDetailsPopup(user: UserRecord) {
    this.selectedUser = user;
    this.showDetailsPopup = true;
  }

  closeDetailsPopup() {
    this.selectedUser = null;
    this.showDetailsPopup = false;
  }


  openAddUser() {
    this.router.navigate(['/create-user']);
  }

}
