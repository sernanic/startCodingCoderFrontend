import { ToastrService } from 'ngx-toastr';
import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, SeoService, FavoriteService } from '../../../shared/services';
import { IUser, ISubject } from '../../../user/interface';
import { IWebinar } from '../../../webinar/interface';
declare var $: any;
@Component({
  templateUrl: 'favorite.html'
})
export class FavoriteComponent implements OnInit {
  public type: string;
  public page: any = 1;
  public pageSize: number = 9;
  public items: any = {
    tutor: [] as IUser[],
    webinar: [] as IWebinar[]
  };
  public total: any = 0;
  public sortOption = {
    sortBy: 'createdAt',
    sortType: 'desc'
  };
  public loading: boolean = false;
  public haveResults: boolean = false;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private seoService: SeoService,
    private authService: AuthService,
    private toasty: ToastrService,
    private favoriteService: FavoriteService
  ) {
    this.seoService.update('My favorite');
    this.route.params.subscribe(params => {
      this.type = params.type;
      this.query();
    });
  }

  ngOnInit() {}
  reset() {
    this.page = 1;
    this.items.tutor = [];
    this.items.webinar = [];
    this.loading = false;
  }
  query() {
    this.reset();
    let params = Object.assign({
      page: this.page,
      take: this.pageSize,
      sort: this.sortOption.sortBy,
      sortType: this.sortOption.sortType
    });

    if (!this.loading) {
      if (this.type) {
        this.loading = true;
        this.favoriteService
          .search(params, this.type)
          .then(resp => {
            if (resp && resp.data && resp.data.items && resp.data.items.length) {
              this.items[this.type] = resp.data.items;
              this.total = resp.data.count;
            }
            this.loading = false;
          })
          .catch(() => {
            this.loading = false;
            alert('Something went wrong, please try again!');
          });
      }
    }
  }
  pageChange() {
    $('html, body').animate({ scrollTop: 0 });
    this.query();
  }
}
