import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
// ...existing code...
import { UsersService } from '../../services/users.service';
import { UserEdit, UserItem, DatabaseAccessComplex } from '../../models/user.model';

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss']
})
export class CreateUserComponent implements OnInit {
  userWrapper: UserEdit | null = null;
  dbAccessList: DatabaseAccessComplex[] = [];

  constructor(private usersService: UsersService, private router: Router) {}

  ngOnInit(): void {
    // Call GetUser via POST to retrieve initial lists (departments, timezone, access, databases)
    this.usersService.getUser(0).subscribe(res => {
      if (res) {
        this.userWrapper = this.ensureUserEditShape(res, true);
      } else {
        this.userWrapper = this.createEmptyUserEdit();
      }
      this.syncDbAccessList();
    }, err => {
      console.error('getUser(0) failed for create-user', err);
      this.userWrapper = this.createEmptyUserEdit();
      this.syncDbAccessList();
    });
  }

  private ensureUserEditShape(payload: UserEdit, isNew: boolean): UserEdit {
    const wrapper: UserEdit = payload || ({} as any);
    if (!wrapper.User) (wrapper as any).User = { User: {} } as any;
    if (!wrapper.User.User) (wrapper.User as any).User = {} as any;

    const u = wrapper.User.User as any;
    u.fnUserID = isNew ? 0 : (u.fnUserID ?? 0);
    u.fcFirstName = u.fcFirstName || '';
    u.fcLastName = u.fcLastName || '';
    u.fcUserNT = u.fcUserNT || '';
    u.fcUserEmail = u.fcUserEmail || '';
    u.fnDepartmentID = u.fnDepartmentID ?? null;
    u.fnAccessID = u.fnAccessID ?? null;
    u.fcApprovalStatus = u.fcApprovalStatus || 'Approved';
    u.fcComments = u.fcComments || '';
    u.fnRunConsolePermission = !!u.fnRunConsolePermission;
    u.fbDeveloper = !!u.fbDeveloper;
    u.TimeZoneID = u.TimeZoneID ?? null;

    wrapper.Departments = wrapper.Departments || [];
    wrapper.UserAccess = wrapper.UserAccess || [];
    wrapper.TimeZone = wrapper.TimeZone || [];
    wrapper.DatabaseAccess = wrapper.DatabaseAccess || [];
    return wrapper;
  }

  private createEmptyUserEdit(): UserEdit {
    return {
      User: {
        User: {
          fnUserID: 0,
          fcFirstName: '',
          fcLastName: '',
          fcUserNT: '',
          fcUserEmail: '',
          fnDepartmentID: null,
          fnAccessID: null,
          fcApprovalStatus: 'Approved',
          fcComments: '',
          fnRunConsolePermission: false,
          fbDeveloper: false,
          TimeZoneID: null
        }
      } as any,
      DatabaseAccess: [],
      Departments: [],
      UserAccess: [],
      TimeZone: []
    } as UserEdit;
  }

  private syncDbAccessList() {
    this.dbAccessList = (this.userWrapper?.DatabaseAccess || []).map((item, i) => {
      const conn = item?.DatabaseConnection;
      const dbAccess = item?.DatabaseAccess;
      if (dbAccess) return { DatabaseConnection: conn, DatabaseAccess: dbAccess };
      const defaultAccess = {
        fnDatabaseAccessID: undefined,
        fnUserID: this.userWrapper?.User?.User?.fnUserID || 0,
        fnConnectionID: conn?.fnConnectionID,
        fbImportAccess: false,
        fbExportAccess: false
      };
      return { DatabaseConnection: conn, DatabaseAccess: defaultAccess };
    });
  }

  saveUser() {
    if (!this.userWrapper) return;
    this.userWrapper.DatabaseAccess = this.dbAccessList;
    this.usersService.saveUser(this.userWrapper).subscribe({
      next: () => this.router.navigate(['/users']),
      error: (err) => { console.error(err); alert('Failed to create user'); }
    });
  }

  cancel() { this.router.navigate(['/users']); }
}
