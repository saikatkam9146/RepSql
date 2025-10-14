import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { UsersService } from '../../services/users.service';
import { UserItem, UserRecord } from '../../models/user.model';

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss']
})
export class EditUserComponent {
  userId: number | null = null;
  userWrapper: UserRecord | null = null;

  constructor(private route: ActivatedRoute, private usersService: UsersService, private router: Router) {
    const idStr = this.route.snapshot.paramMap.get('id');
    this.userId = idStr ? Number(idStr) : null;
    if (this.userId) {
      this.usersService.getUser(this.userId).subscribe(res => {
        if (res) this.userWrapper = res;
      });
    }
  }

  saveUser() {
    if (!this.userId || !this.userWrapper) return;
    this.usersService.updateUser(this.userId, this.userWrapper.User).subscribe({
      next: () => this.router.navigate(['/users']),
      error: (err) => { console.error(err); alert('Failed to update user'); }
    });
  }

  cancel() { this.router.navigate(['/users']); }
}
