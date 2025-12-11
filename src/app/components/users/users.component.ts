// ...existing code...
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../services/users.service';
import { UserComplex, UserList } from '../../models/user.model';
@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  navigateToUserDetails(user: UserComplex, index: number) {
    this.router.navigate(['/user-details', user.User.fnUserID]);
  }
  constructor(private router: Router, private usersService: UsersService) {}
  users: UserComplex[] = [];
  departments: { fnDepartmentID: number; fcDepartmentName: string }[] = [];
  selectedUser: UserComplex | null = null;
  showDetailsPopup: boolean = false;
  loading = false;
  error: string | null = null;
  lastError: any = null;
  // Pagination
  pageSize = 10;
  currentPage = 1;

  // Filters/search
  statusFilter: 'all' | 'active' | 'inactive' = 'active'; // default to Active
  departmentFilter: number | 'all' = 'all';
  searchText = '';

  // Navigation to edit user page (to be implemented)
  navigateToEditUser(user: UserComplex, index: number) {
    this.router.navigate(['/edit-user', user.User.fnUserID]);
  }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.usersService.getUsers().subscribe({
      next: (res: UserList) => {
        // API returns a UserList wrapper; use the Users array inside
        this.users = res?.Users || [];
        this.departments = res?.Departments || [];
        // default department list selection remains 'all'
        this.loading = false;
      },
      error: (err) => {
        // capture detailed error for debugging; the service logs full details already
        this.lastError = err;
        this.error = err?.message || 'Failed to load users';
        console.error('UsersComponent.loadUsers error', err);
        this.loading = false;
      }
    });
  }

  // Derived list after applying search & filters
  get filteredUsers(): UserComplex[] {
    const term = this.searchText?.toLowerCase().trim();
    return this.users.filter(u => {
      // Status: interpret active as fcApprovalStatus === 'Approved'
      if (this.statusFilter === 'active' && (u.User.fcApprovalStatus || '').toLowerCase() !== 'approved') return false;
      if (this.statusFilter === 'inactive' && (u.User.fcApprovalStatus || '').toLowerCase() === 'approved') return false;

      if (this.departmentFilter !== 'all' && u.User.fnDepartmentID !== this.departmentFilter) return false;

      if (term) {
        const vals = [
          u.User.fnUserID?.toString() || '',
          u.User.fcFirstName || '',
          u.User.fcLastName || '',
          u.User.fcUserEmail || '',
          u.User.fcUserNT || '',
          u.Department?.fcDepartmentName || '',
          u.UserAccess?.fcAccessDescription || ''
        ].join(' ').toLowerCase();
        return vals.includes(term);
      }
      return true;
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredUsers.length / this.pageSize));
  }

  // Items for current page
  get pagedUsers(): UserComplex[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredUsers.slice(start, start + this.pageSize);
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const tp = this.totalPages;
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(tp, start + 4);
    for (let p = start; p <= end; p++) pages.push(p);
    return pages;
  }

  goToPage(page: number) {
    if (page < 1) page = 1;
    if (page > this.totalPages) page = this.totalPages;
    this.currentPage = page;
  }

  // When filters/search change, reset to page 1
  onFilterChange() {
    this.currentPage = 1;
  }

  openDetailsPopup(user: UserComplex) {
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
      next: () => this.users = this.users.filter((u: UserComplex) => u.User.fnUserID !== userId),
      error: (err) => console.error(err)
    });
  }

}
