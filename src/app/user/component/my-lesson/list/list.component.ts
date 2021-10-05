import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { AuthService, AppointmentService, SeoService } from '../../../../shared/services';
import { IMylesson, IUser } from '../../../interface';
import { from } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
declare var $: any;
@Component({
  selector: 'app-list-lesson',
  templateUrl: './list.html'
})
export class ListLessonComponent implements OnInit {
  public currentUser: IUser;
  public currentPage: Number = 1;
  public pageSize: Number = 10;
  public total: Number = 2;
  public searchFields: any = {};
  public sortOption = {
    sortBy: 'createdAt',
    sortType: 'desc'
  };
  public appointments: IMylesson[] = [];
  public count: Number = 0;
  public loading: boolean = false;
  public config: any;
  public timeout: any;
  public joining: boolean = false;
  constructor(
    private auth: AuthService,
    private appointmentService: AppointmentService,
    private route: ActivatedRoute,
    private seoService: SeoService,
    private toasty: ToastrService
  ) {
    seoService.update('My Lessons');
    this.config = this.route.snapshot.data['appConfig'];
  }

  ngOnInit() {
    if (this.auth.isLoggedin()) {
      this.auth.getCurrentUser().then(resp => {
        this.currentUser = resp;
        this.query();
      });
    }
  }

  query() {
    this.loading = true;
    let params = Object.assign(
      {
        page: this.currentPage,
        take: this.pageSize,
        sort: `${this.sortOption.sortBy}`,
        sortType: `${this.sortOption.sortType}`,
        userId: this.currentUser._id
      },
      this.searchFields
    );
    this.appointmentService
      .search(params)
      .then(resp => {
        this.count = resp.data.count;
        this.appointments = resp.data.items;
        this.total = resp.data.count;
        this.loading = false;
      })
      .catch(() => {
        this.loading = false;
        alert('Something went wrong, please try again!');
      });
  }

  sortBy(field: string, type: string) {
    this.sortOption.sortBy = field;
    this.sortOption.sortType = type;
    this.query();
  }

  onSort(evt) {
    this.sortOption = evt;
    this.query();
  }

  pageChange() {
    $('html, body').animate({ scrollTop: 0 });
    this.query();
  }

  doSearch(evt) {
    const searchText = evt.target.value; // this is the search text
    if (this.timeout) {
      window.clearTimeout(this.timeout);
    }
    this.timeout = window.setTimeout(() => {
      this.searchFields.description = searchText;
      this.query();
    }, 400);
  }

  joinMeeting(appointmentId: string) {
    if (!this.joining) {
      this.joining = true;
      this.appointmentService
        .joinMeeting(appointmentId)
        .then(resp => {
          this.joining = false;
          if (resp.data && resp.data.zoomUrl) {
            window.open(resp.data.zoomUrl, '_blank').focus();
          }
        })
        .catch(err => {
          this.joining = false;
          return this.toasty.error(
            (err.data && err.data.data && err.data.data.message) ||
              err.data.message ||
              'Something went wrong, please try again!'
          );
        });
    } else {
      this.toasty.success('Connecting...');
    }
  }
}
