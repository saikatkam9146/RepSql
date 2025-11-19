import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { UsersService } from '../../services/users.service';
import { UserItem, UserRecord, UserEdit, UserComplex } from '../../models/user.model';

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss']
})
export class EditUserComponent {
  userId: number | null = null;
  userWrapper: UserEdit | null = null;
  // local helper to make template bindings shorter
  dbAccessList: import('../../models/user.model').DatabaseAccessComplex[] = [];

  constructor(private route: ActivatedRoute, private usersService: UsersService, private router: Router) {
    const idStr = this.route.snapshot.paramMap.get('id');
    this.userId = idStr ? Number(idStr) : null;
    if (this.userId) {
      this.usersService.getUser(this.userId).subscribe(res => {
        if (res) {
          this.userWrapper = res;
          // Ensure option lists contain the current selected values so selects show both the current value and the list
          this.mergeMissingOptionLists();
        }
        // sync local db access list when payload arrives
        // Normalize entries where DatabaseAccess is null so the UI has a consistent object to bind to
        this.dbAccessList = (res?.DatabaseAccess || []).map(item => {
          const conn = item?.DatabaseConnection;
          const dbAccess = item?.DatabaseAccess;
          if (dbAccess) return { DatabaseConnection: conn, DatabaseAccess: dbAccess };
          // create a default DatabaseAccess object when server returns null
          const defaultAccess = {
            fnDatabaseAccessID: undefined,
            fnUserID: this.userId || undefined,
            fnConnectionID: conn?.fnConnectionID,
            fbImportAccess: false,
            fbExportAccess: false
          };
          return { DatabaseConnection: conn, DatabaseAccess: defaultAccess };
        });
      });
    }
  }

  // If the API didn't include the currently-selected TimeZone / Access / Department in the lists
  // (common in offline fallback), add lightweight entries so the selects show the current value along with other options.
  private mergeMissingOptionLists() {
    if (!this.userWrapper) return;
    // Ensure arrays exist
    if (!this.userWrapper.TimeZone) this.userWrapper.TimeZone = [];
    if (!this.userWrapper.UserAccess) this.userWrapper.UserAccess = [];
    if (!this.userWrapper.Departments) this.userWrapper.Departments = [];

    try {
      const user = this.userWrapper.User?.User;
      // TimeZone
      const tzId = user?.TimeZoneID;
      if (tzId != null && !this.userWrapper.TimeZone.some(t => t.TimeZoneID === tzId)) {
        const tzName = this.userWrapper.User?.TimeZoneOffset?.TimeZoneName || 'Current';
        this.userWrapper.TimeZone.unshift({ TimeZoneID: tzId, TimeZoneCode: '', TimeZoneName: tzName, std_Offset: 0, daylight_Offset: 0 });
      }

      // Access level
      const accessId = user?.fnAccessID;
      if (accessId != null && !this.userWrapper.UserAccess.some(a => a.fnAccessID === accessId)) {
        // try to get name from singular UserAccess on the user wrapper (some payloads store it there)
        const maybeName = (this.userWrapper.User && (this.userWrapper.User as any).UserAccess?.fcAccessDescription) || undefined;
        this.userWrapper.UserAccess.unshift({ fnAccessID: accessId, fcAccessDescription: maybeName || 'Current' });
      }

      // Department
      const deptId = user?.fnDepartmentID;
      if (deptId != null && !this.userWrapper.Departments.some(d => d.fnDepartmentID === deptId)) {
        const maybeDeptName = this.userWrapper.User?.Department?.fcDepartmentName || undefined;
        this.userWrapper.Departments.unshift({ fnDepartmentID: deptId, fcDepartmentName: maybeDeptName || 'Current' });
      }
    } catch (e) {
      console.error('mergeMissingOptionLists failed', e);
    }
  }

  // Helpers used by the template to cope with missing option lists (offline fallback)
  hasTimeZone(id?: number): boolean {
    if (!id || !this.userWrapper) return false;
    return !!this.userWrapper.TimeZone?.some(t => t.TimeZoneID === id);
  }

  getTimeZoneName(id?: number): string | null {
    if (!id || !this.userWrapper) return null;
    return this.userWrapper.TimeZone?.find(t => t.TimeZoneID === id)?.TimeZoneName || null;
  }

  hasAccess(id?: number): boolean {
    if (!id || !this.userWrapper) return false;
    return !!this.userWrapper.UserAccess?.some(a => a.fnAccessID === id);
  }

  getAccessDescription(id?: number): string | null {
    if (!id || !this.userWrapper) return null;
    return this.userWrapper.UserAccess?.find(a => a.fnAccessID === id)?.fcAccessDescription || null;
  }

  hasDepartment(id?: number): boolean {
    if (!id || !this.userWrapper) return false;
    return !!this.userWrapper.Departments?.some(d => d.fnDepartmentID === id);
  }

  getDepartmentName(id?: number): string | null {
    if (!id || !this.userWrapper) return null;
    return this.userWrapper.Departments?.find(d => d.fnDepartmentID === id)?.fcDepartmentName || null;
  }

  saveUser() {
    if (!this.userId || !this.userWrapper) return;
    // Ensure the server payload contains any updated DatabaseAccess from the UI
    this.userWrapper.DatabaseAccess = this.dbAccessList;

    // expose payload for debugging in browser console and log it
    try { (window as any).__userWrapper = this.userWrapper; } catch {}
    console.log('Saving UserEdit payload for user', this.userId, this.userWrapper);

    // Send the full UserEdit payload to the backend save/update endpoint
    this.usersService.updateUser(this.userId, this.userWrapper).subscribe({
      next: (res) => {
        // service returns { offlineSaved: true } when it used the offline fallback
        if (res && (res as any).offlineSaved) {
          alert('Saved locally (offline mode)');
        } else {
          alert('Saved to server');
        }
        this.router.navigate(['/users']);
      },
      error: (err) => { console.error(err); alert('Failed to update user'); }
    });
  }

  cancel() { this.router.navigate(['/users']); }
}
