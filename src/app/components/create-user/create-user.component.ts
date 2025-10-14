import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
// ...existing code...
import { UsersService } from '../../services/users.service';
import { UserItem } from '../../models/user.model';

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
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

  constructor(private usersService: UsersService, private router: Router) {}

  saveUser() {
    const payload: UserItem = {
      fnUserID: 0,
      fcFirstName: this.newUser.fcFirstName,
      fcLastName: this.newUser.fcLastName,
      fcUserNT: this.newUser.fcUserNT,
      fcUserEmail: this.newUser.fcUserEmail,
      fnDepartmentID: this.newUser.fnDepartmentID,
      fnAccessID: this.newUser.fnAccessID,
      fcApprovalStatus: this.newUser.fcApprovalStatus,
      fcComments: this.newUser.fcComments,
      fnRunConsolePermission: this.newUser.fnRunConsolePermission,
      fbDeveloper: this.newUser.fbDeveloper,
      TimeZoneID: this.newUser.TimeZoneID
    };

    this.usersService.createUser(payload).subscribe({
      next: () => this.router.navigate(['/users']),
      error: (err) => { console.error(err); alert('Failed to create user'); }
    });
  }

  cancel() { this.router.navigate(['/users']); }
}
