import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../navbar.component';

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss']
})
export class UserDetailsComponent {
  userId: number | null = null;
  user: any = null;

  constructor(private route: ActivatedRoute) {
    this.route.params.subscribe(params => {
      this.userId = +params['id'];
      // TODO: Fetch user by ID from a service or mock data
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
    });
  }
}
