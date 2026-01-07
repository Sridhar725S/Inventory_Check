import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  login() {
  this.auth.login(this.username, this.password).subscribe({
    next: (res: any) => {
      if (res.token) {
        // ✅ success case
        this.router.navigate(['/products']);
      } else {
        // ❌ error case (backend sent error JSON instead of 200)
        this.error = res.error?.message || 'Login failed';
      }
    },
    error: () => {
      // this will only trigger if the request totally fails (like server down)
      this.error = 'Server not reachable, please try again later!';
    }
  });
}

}
