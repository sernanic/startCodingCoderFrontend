import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import * as _ from 'lodash';
import { PostService } from '../../../shared/services/posts.service';
import { Location } from '@angular/common';
import { IPost } from '../../interface';
@Component({
  selector: 'detail-post',
  templateUrl: './detail.html'
})
export class PostDetailComponent implements OnInit {
  public post: IPost = {};
  private alias: any;
  public submitted: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private toasty: ToastrService,
    private postService: PostService,
    private location: Location
  ) {
    this.route.params.subscribe(params => {
      this.alias = params.alias;
      this.postService.findOne(this.alias).then(resp => {
        this.post = _.pick(resp.data, ['title', 'alias', 'content', 'type']);
      });
    });
  }
  ngOnInit() {}
}
