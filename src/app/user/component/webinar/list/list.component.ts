import { ParticipantFormComponent } from '../modal-participants/participants-form';
import { SeoService } from '../../../../shared/services/seo.service';
import { Component, OnInit } from '@angular/core';
import { WebinarService, AuthService } from '../../../../shared/services';
import { ActivatedRoute, Router } from '@angular/router';
import { ActiveToast, ToastrService } from 'ngx-toastr';
import { IWebinar } from '../../../../webinar/interface';
import { IUser } from '../../../interface';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
declare var $: any;

@Component({
  selector: 'webinar-listing',
  templateUrl: './list.html'
})
export class WebinarListingComponent implements OnInit {
  public total: number = 0;
  public items: IWebinar[];
  public currentPage: number = 1;
  public pageSize: number = 10;
  public searchFields: any = {};
  public sortOption = {
    sortBy: 'createdAt',
    sortType: 'desc'
  };
  public currentUser: IUser;
  public fromItem: number = 0;
  public toItem: number = 0;
  public timeout: any;
  public config: any;
  constructor(
    private router: Router,
    private webinarService: WebinarService,
    private toasty: ToastrService,
    private auth: AuthService,
    private route: ActivatedRoute,
    private seoService: SeoService,
    private modalService: NgbModal
  ) {
    seoService.update('My Group Classes');
    this.config = this.route.snapshot.data['appConfig'];
  }

  ngOnInit() {
    this.auth.getCurrentUser().then(resp => {
      this.currentUser = resp;
      if (this.currentUser._id) {
        this.query();
      }
    });
  }

  query() {
    let params = Object.assign(
      {
        page: this.currentPage,
        take: this.pageSize,
        sort: `${this.sortOption.sortBy}`,
        sortType: `${this.sortOption.sortType}`,
        tutorId: this.currentUser._id
      },
      this.searchFields
    );
    this.webinarService
      .search(params)
      .then(resp => {
        this.total = resp.data.count;
        this.items = resp.data.items;
        if (this.currentPage === 1) {
          this.fromItem = this.currentPage;
          this.toItem = this.items.length;
        } else if (this.currentPage > 1) {
          this.fromItem =
            this.currentPage * this.pageSize > this.total
              ? (this.currentPage - 1) * this.pageSize
              : this.currentPage * this.pageSize;
          this.toItem = this.fromItem + this.items.length;
        }
      })
      .catch(() => alert('Something went wrong, please try again!'));
  }

  doSearch(evt) {
    const searchText = evt.target.value; // this is the search text
    if (this.timeout) {
      window.clearTimeout(this.timeout);
    }
    this.timeout = window.setTimeout(() => {
      this.searchFields.name = searchText;
      this.query();
    }, 400);
  }

  showChange(evt) {
    this.pageSize = evt.target.value;
    this.query();
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

  remove(item: any, index: number) {
    if (window.confirm('Are you sure want to delete this webinar?')) {
      this.webinarService
        .delete(item._id)
        .then(() => {
          this.toasty.success('Item has been deleted!');
          this.items.splice(index, 1);
        })
        .catch(e => this.toasty.error(e.data.data.message));
    }
  }
  pageChange() {
    $('html, body').animate({ scrollTop: 0 });
    this.query();
  }
  showParticipants(webinar: any) {
    const modalRef = this.modalService.open(ParticipantFormComponent, {
      centered: true,
      backdrop: 'static',
      size: 'lg'
    });
    modalRef.componentInstance.webinarId = webinar._id;
  }
}
