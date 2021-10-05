import { Router } from '@angular/router';
import { Component, OnInit, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../shared/services';
import { FavoriteService, LanguageService } from '../../../shared/services';
import { IUser } from '../../../user/interface';
@Component({
  selector: 'tutor-card',
  templateUrl: './tutor-card.html'
})
export class TutorCardComponent implements OnInit {
  @Input() tutor: IUser;
  public isLoggedin: boolean;
  public currentUser: IUser = {};
  avatarOptions: any = {};

  ngOnInit() {
    if (this.authService.isLoggedin()) {
      this.currentUser = this.authService.getCurrentUser();
      this.isLoggedin = true;
    }
  }
  constructor(
    private authService: AuthService,
    private tutorFavoriteService: FavoriteService,
    private toastService: ToastrService,
    public languageService: LanguageService,
    public router: Router
  ) {}

  favorite() {
    if (!this.isLoggedin) this.toastService.error('Please loggin to use this feature!');
    else {
      let params = Object.assign(
        {
          tutorId: this.tutor._id,
          type: 'tutor'
        },
        {}
      );
      this.tutorFavoriteService
        .favorite(params, 'tutor')
        .then(res => {
          this.tutor.isFavorite = true;
          this.toastService.success('Added to your favorite tutor list successfully!');
        })
        .catch(() => this.toastService.error('Something went wrong, please try again!'));
    }
  }

  unFavorite() {
    if (!this.isLoggedin) this.toastService.error('Please loggin to use this feature!');
    else {
      this.tutorFavoriteService
        .unFavorite(this.tutor._id, 'tutor')
        .then(res => {
          this.tutor.isFavorite = false;
          this.toastService.success('Deleted from your favorite tutor list successfully!');
        })
        .catch(() => this.toastService.error('Something went wrong, please try again!'));
    }
  }

  bookFree() {
    const queryParams = {
      isFree: true
    };
    this.router.navigate(['/appointments', this.tutor.username], {
      queryParams: queryParams
    });
  }
}
