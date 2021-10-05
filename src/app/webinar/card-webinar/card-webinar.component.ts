import { AuthService } from '../../shared/services/auth.service';
import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { IWebinar } from '../interface';
import { ActivatedRoute } from '@angular/router';
import { WebinarService } from '../webinar.service';
declare var jQuery: any;
@Component({
  selector: 'app-card-webinar',
  templateUrl: './card-webinar.html'
})
export class CardWebinarComponent implements OnInit, AfterViewInit {
  @Input() webinar: IWebinar;
  public description: string;
  @Input() config: any;
  constructor(private route: ActivatedRoute, private auth: AuthService, private webinarService: WebinarService) {
    this.config = this.route.snapshot.data['appConfig'];
  }

  ngOnInit() {}

  ngAfterViewInit() {}
}
