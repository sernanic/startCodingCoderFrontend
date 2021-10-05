import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../shared/services';
import { ToastrService } from 'ngx-toastr';

@Component({
  templateUrl: 'forgot.component.html'
})
export class ForgotComponent {
  private Auth: AuthService;
  public credentials = {
    email: ''
  };
  public submitted: Boolean = false;
  public appConfig: any;

  constructor(auth: AuthService, public router: Router, private toasty: ToastrService, private route: ActivatedRoute) {
    this.Auth = auth;

    // if (auth.isLoggedIn()) {
    // 	this.router.navigate(['/']);
    // }
    this.appConfig = this.route.snapshot.data.appConfig;
  }

  login(frm: any) {
    this.submitted = true;
    if (frm.invalid) {
      return;
    }

    this.Auth.forgot(this.credentials.email)
      .then(() => {
        this.toasty.success('An email was sent to your address');
        this.router.navigate(['/auth/login']);
      })
      .catch(() => this.toasty.error('Error, Please check your email again!'));
  }
}
