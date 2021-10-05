import { Component, OnInit } from '@angular/core';
import { AccountService } from '../../services';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SeoService } from '../../../shared/services';
import * as _ from 'lodash';
import { IPayoutAccount } from '../interface';
@Component({
  selector: 'account-create',
  templateUrl: './form.html'
})
export class AccountCreateComponent implements OnInit {
  public isSubmitted: boolean = false;
  public accounts: IPayoutAccount[] = [];
  public account: IPayoutAccount = {
    type: 'bank-account',
    paypalAccount: '',
    accountHolderName: '',
    accountNumber: '',
    iban: '',
    bankName: '',
    bankAddress: '',
    sortCode: '',
    routingNumber: '',
    swiftCode: '',
    ifscCode: '',
    routingCode: ''
  };

  constructor(
    private router: Router,
    private accountService: AccountService,
    private toasty: ToastrService,
    private seoService: SeoService,
    private route: ActivatedRoute
  ) {
    seoService.update('Create account');
  }

  ngOnInit() {
    this.accounts = this.route.snapshot.data['account'];
  }

  submit(frm: any) {
    this.isSubmitted = true;
    if (frm.invalid) {
      return this.toasty.error('Form is invalid, please try again.');
    }
    if (this.account.type === 'paypal' && this.account.paypalAccount == '') {
      return this.toasty.error('If you select type payout is paypal, please enter Paypal Account');
    }

    this.accountService.create(this.account).then(
      () => {
        this.toasty.success('Account has been created');
        this.router.navigate(['/users/payout/account']);
      },
      err => this.toasty.error(err.data.data.message || 'Something went wrong, please check and try again!')
    );
  }
}
