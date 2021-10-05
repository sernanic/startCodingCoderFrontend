import { Component, OnInit } from '@angular/core';
import { AccountService } from '../../services';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import * as _ from 'lodash';
import { SeoService } from '../../../shared/services';
import { IPayoutAccount } from '../interface';
@Component({
  selector: 'account-update',
  templateUrl: '../create-account/form.html'
})
export class AccountUpdateComponent implements OnInit {
  public isSubmitted: boolean = false;
  public account: IPayoutAccount;

  constructor(
    private router: Router,
    private accountService: AccountService,
    private route: ActivatedRoute,
    private toasty: ToastrService,
    private seoService: SeoService
  ) {
    seoService.update('Update account');
  }

  ngOnInit() {
    let id = this.route.snapshot.paramMap.get('id');

    this.accountService.findOne(id).then(resp => {
      this.account = resp.data;
    });
  }

  submit(frm) {
    this.isSubmitted = true;
    if (frm.$invalid) {
      this.toasty.error('Invalid form, please try again.');
    }

    if (this.account.type === 'paypal' && this.account.paypalAccount == '') {
      return this.toasty.error('If you select type payout is paypal, please enter Paypal Account');
    } else if (this.account.type === 'bank-account' && this.account.paypalAccount) {
      this.account.paypalAccount = '';
    }

    let param = {
      type: this.account.type,
      paypalAccount: this.account.paypalAccount,
      accountHolderName: this.account.accountHolderName,
      accountNumber: this.account.accountNumber,
      iban: this.account.iban,
      bankName: this.account.bankName,
      bankAddress: this.account.bankAddress,
      sortCode: this.account.sortCode,
      routingNumber: this.account.routingNumber,
      swiftCode: this.account.swiftCode,
      ifscCode: this.account.ifscCode,
      routingCode: this.account.routingCode
    };

    this.accountService.update(this.account._id, param).then(resp => {
      this.toasty.success('Updated successfully.');
    });
  }
}
