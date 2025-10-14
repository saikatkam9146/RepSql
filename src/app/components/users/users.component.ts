// ...existing code...
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../services/users.service';
import { UserRecord } from '../../models/user.model';
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
  constructor(private router: Router, private usersService: UsersService) {}
  users: UserRecord[] = [];
  selectedUser: UserRecord | null = null;
  showDetailsPopup: boolean = false;
  loading = false;
  error: string | null = null;

  // Navigation to edit user page (to be implemented)
  navigateToEditUser(user: UserRecord, index: number) {
    this.router.navigate(['/edit-user', user.User.fnUserID]);
  }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.usersService.getUsers().subscribe({
      next: (res) => {
        this.users = res;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load users';
        console.error(err);
        this.loading = false;
      }
    });
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

  deleteUser(userId: number) {
    if (!confirm('Delete this user?')) return;
    this.usersService.deleteUser(userId).subscribe({
      next: () => this.users = this.users.filter(u => u.User.fnUserID !== userId),
      error: (err) => console.error(err)
    });
  }

}
