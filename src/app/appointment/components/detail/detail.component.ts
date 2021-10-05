import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import * as _ from 'lodash';
import { AppointmentService } from '../../../appointment/services/appointment.service';
import { Location } from '@angular/common';
import { AuthService } from '../../../shared/services';
import { IUser, ISubject, IMylesson } from '../../../user/interface';
import { IBooking } from '../../interface';

@Component({
  selector: 'detail-appointment',
  templateUrl: './detail.html'
})
export class AppointmentDetailComponent implements OnInit {
  public appointment: IMylesson;
  public options: any = {
    appointmentId: '',
    type: 'appointment',
    tutorId: '',
    userId: ''
  };
  private aId: any;
  public type: any;
  public config: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private toasty: ToastrService,
    private appointmentService: AppointmentService,
    private location: Location,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.config = this.route.snapshot.data['appConfig'];
    this.authService.getCurrentUser().then(resp => {
      this.type = resp.type;
    });
    this.findOne();
  }
  findOne() {
    this.aId = this.route.snapshot.paramMap.get('id');
    this.appointmentService.findOne(this.aId).then(resp => {
      this.appointment = _.pick(resp.data, [
        'status',
        'tutor',
        'user',
        'startTime',
        'toTime',
        'id',
        'subject',
        'price'
      ]);
      this.options.appointmentId = this.appointment._id;
      this.options.tutorId = this.appointment.tutor._id;
      this.options.userId = this.appointment.user._id;
    });
  }

  cancelEvent(info: any) {
    if (!info && info.status !== 'canceled') {
      return this.toasty.error('Something went wrong, please try again.');
    }
    this.appointment.status = 'canceled';
  }
}
