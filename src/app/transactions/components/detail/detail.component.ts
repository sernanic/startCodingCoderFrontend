import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import * as _ from 'lodash';
import { AppointmentService } from '../../../appointment/services/appointment.service';
import { Location } from '@angular/common';
import { TransactionService } from '../../services/transaction.service';
import { AuthService } from '../../../shared/services';
import { RequestRefundService } from '../../../refund/services/request-refund.service';
import { ITransaction } from '../../interface';
@Component({
  selector: 'detail-appointment',
  templateUrl: './detail.html'
})
export class AppointmentDetailComponent implements OnInit {
  public transaction: ITransaction = {};
  public options: any = {
    transactionId: '',
    type: 'appointment',
    tutorId: '',
    userId: ''
  };
  private aId: any;
  public type: any;
  public submitted: boolean = false;
  public reason: string = '';
  public config: any;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private toasty: ToastrService,
    private appointmentService: AppointmentService,
    private location: Location,
    private authService: AuthService,
    private transactionService: TransactionService,
    private refundService: RequestRefundService
  ) {
    this.config = this.route.snapshot.data['appConfig'];
  }

  ngOnInit() {
    this.aId = this.route.snapshot.paramMap.get('id');
    this.authService.getCurrentUser().then(resp => {
      this.type = resp.type;
    });
    this.findOne();
  }
  findOne() {
    this.transactionService.findOne(this.aId).then(resp => {
      this.transaction = resp.data;
      this.options.transactionId = this.transaction._id;
      this.options.tutorId = this.transaction.tutor._id;
      this.options.userId = this.transaction.user._id;
    });
  }

  cancelEvent(info: any) {
    if (!info && info.status !== 'canceled') {
      return this.toasty.error('An error has occurred. Try Again.');
    }
    this.transaction.status = 'canceled';
  }

  request(type?: string) {
    this.submitted = true;
    if (this.reason === '') {
      return this.toasty.error('Please enter reason');
    }
    this.refundService
      .create({
        transactionId: this.transaction._id,
        reason: this.reason,
        type,
        targetType: this.transaction.targetType
      })
      .then(resp => {
        this.toasty.success('Request successfully!');
      })
      .catch(e => this.toasty.error(e.data.message));
  }
}
