import { SeoService } from './../../shared/services/seo.service';
import { SystemService } from './../../shared/services/system.service';
import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../shared/services';
import { ToastrService } from 'ngx-toastr';

@Component({
  templateUrl: 'login.component.html'
})
export class LoginComponent {
  private Auth: AuthService;
  public credentials = {
    email: '',
    password: '',
    rememberMe: false
  };
  public submitted: boolean = false;
  public appConfig: any;
  public returnUrl: string;

  constructor(
    auth: AuthService,
    public router: Router,
    private toasty: ToastrService,
    private route: ActivatedRoute,
    private seoService: SeoService
  ) {
    this.appConfig = this.route.snapshot.data.appConfig;
    if (this.appConfig) {
      let title = this.appConfig.siteName + ' - Login';
      seoService.update(title);
    }
    this.Auth = auth;
    this.returnUrl =
      this.route.snapshot.queryParams['returnUrl'] || localStorage.getItem('currentUrl') || '/users/dashboard';
    if (auth.getAccessToken()) {
      this.router.navigate(['/']);
    }
  }

  login(frm: any) {
    this.submitted = true;
    if (frm.invalid) {
      return;
    }
    this.Auth.login(this.credentials)
      .then(resp => {
        this.router.navigateByUrl(this.returnUrl, {
          state: {
            current: resp
          }
        });
      })
      .catch(err => {
        if (err) {
          return this.toasty.error((err.data && err.data.data && err.data.data.message) || err.data.message);
        }
        this.toasty.error('Something went wrong, please try again.');
      });
  }
}
