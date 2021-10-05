import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import * as _ from 'lodash';
import { TutorService } from '../../services/tutor.service';
import { ITutorCertificate } from '../../../user/interface';

@Component({
  selector: 'app-add-certification',
  templateUrl: './add-certification.html'
})
export class AddCetificationComponent implements OnInit {
  @Input() certificate: ITutorCertificate;
  @Input() type: string;
  @Input() tutorId: string;
  public maxFileSize: number;
  public submitted: boolean = false;
  public options: Object = {
    placeholderText: 'Enter description',
    charCounterCount: false,
    imageUpload: false
  };
  public mediaOptions: Object;

  constructor(private toasty: ToastrService, public activeModal: NgbActiveModal, private tutorService: TutorService) {
    this.maxFileSize = window.appConfig.maximumFileSize;
  }

  ngOnInit() {
    this.mediaOptions = {
      url: window.appConfig.apiBaseUrl + '/media/files',
      fileFieldName: 'file',
      onFinish: resp => {
        this.certificate.documentId = resp.data._id;
        this.certificate.document = resp.data;
      }
    };
    if (!this.certificate) {
      this.certificate = {
        title: '',
        description: '',
        fromYear: '',
        toYear: '',
        verified: false,
        documentId: '',
        ordering: 0,
        tutorId: '',
        type: '',
        document: null
      };
    }
  }

  submit(frm: any) {
    this.submitted = true;
    if (!frm.valid) {
      return this.toasty.error('Please complete the required fields!');
    }
    if (!this.certificate.documentId) {
      return this.toasty.error('Please upload document!');
    }
    if (this.certificate.toYear < this.certificate.fromYear) {
      return this.toasty.error('To year must be greater than from year!');
    }
    this.certificate.tutorId = this.tutorId;
    this.certificate.type = this.type;
    const data = _.pick(this.certificate, [
      'title',
      'description',
      'fromYear',
      'toYear',
      'type',
      'documentId',
      'tutorId',
      'verified',
      'ordering'
    ]);
    if (this.certificate._id) {
      this.tutorService
        .updateCertificate(this.certificate._id, data)
        .then(resp => {
          this.activeModal.close(resp.data);
          this.submitted = false;
          this.toasty.success('Updated certificate successfully');
        })
        .catch(e => {
          this.toasty.error('Something went wrong, please try again!');
        });
    } else {
      this.tutorService
        .createCertificate(data)
        .then(resp => {
          this.activeModal.close(resp.data);
          this.submitted = false;
          this.toasty.success('Created certificate successfully!');
        })
        .catch(e => {
          this.toasty.error('Something went wrong, please try again!');
        });
    }
  }
}
