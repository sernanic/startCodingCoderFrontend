import { CountryService } from './../../../shared/services/country.service';
import { ISubject, IMySubject } from './../../interface';
import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { SeoService, LanguageService, UtilService } from '../../../shared/services';
import { UserService } from '../../services/user.service';
import { TutorService } from '../../../tutor/services/tutor.service';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { GradeService } from '../../../tutor/services/grade.service';
import * as _ from 'lodash';
import { NgSelectComponent } from '@ng-select/ng-select';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AvatarUploadComponent } from '../../../media/components/avatar-upload/avatar-upload.component';
import { AddCetificationComponent } from '../../../tutor/components/add-certification/add-certification.component';
import { IUser } from '../../interface';
import { MySubjectService } from '../../../shared/services/my-subject.service';
@Component({
  selector: 'app-profile-update',
  templateUrl: './form.html'
})
export class ProfileUpdateComponent implements OnInit {
  @ViewChild('language') ngSelectComponent: NgSelectComponent;
  public info: IUser;
  public avatarUrl = '';
  public checkAvatar: boolean;
  public isSubmitted = false;
  public avatarOptions: any = {};
  private userId: string;
  public _config: any;
  public uploading: boolean = false;

  @Output() afterCancel = new EventEmitter();

  public Editor = ClassicEditor;
  public isEditProfile: boolean = false;
  public isEditDescription: boolean = false;
  public isEditGrade: boolean = false;
  public isEditSubject: boolean = false;

  public countries: any;
  public languages: any;
  public languageNames: any = [];
  public objectLanguage: any = {};

  public gradeNames: any = [];
  public grades: any;
  public totalUserGrades: number = 0;

  public subjects: ISubject[] = [];
  public tutorSubjects: IMySubject[] = [];

  public emailInvite: string = '';

  public timezone: any;
  public loading: boolean = false;
  public showChar: number = 500;
  public showMore: boolean = false;

  public webUrl: string;

  public introVideoType: string = 'upload';
  public introVideoOptions: any;
  public introVideo: any;
  public introVideoName: string = '';

  public quillConfig = {
    toolbar: {
      container: [
        ['bold', 'italic', 'underline', 'strike'], // toggled buttons
        ['code-block'],
        [{ header: 1 }, { header: 2 }], // custom button values
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ script: 'sub' }, { script: 'super' }], // superscript/subscript
        [{ indent: '-1' }, { indent: '+1' }], // outdent/indent
        [{ direction: 'rtl' }], // text direction

        [{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
        [{ header: [1, 2, 3, 4, 5, 6, false] }],

        [{ font: [] }],
        [{ align: [] }],

        ['clean']
        // ['image']
      ]
    },
    keyboard: {
      bindings: {
        enter: {
          key: 13,
          handler: (range, context) => {
            return true;
          }
        }
      }
    }
  };
  constructor(
    private router: Router,
    private userService: UserService,
    private toasty: ToastrService,
    private route: ActivatedRoute,
    private seoService: SeoService,
    private tutorService: TutorService,
    private gradeService: GradeService,
    private languageService: LanguageService,
    private countryService: CountryService,
    private utilService: UtilService,
    private modalService: NgbModal,
    private mySubjectService: MySubjectService
  ) {
    this._config = this.route.snapshot.data['appConfig'];
    this.subjects = route.snapshot.data.subjects;

    seoService.update('Profile');
    this.webUrl = window.appConfig.url;
  }

  async ngOnInit() {
    this.loading = true;
    this.countries = this.countryService.getCountry();
    this.languages = this.languageService.getLang();
    this.objectLanguage = this.languageService.languages;
    this.avatarOptions = {
      url: window.appConfig.apiBaseUrl + '/users/avatar',
      fileFieldName: 'avatar',
      onFinish: resp => {
        this.avatarUrl = resp.data.url;
      }
    };

    this.introVideoOptions = {
      url: window.appConfig.apiBaseUrl + '/tutors/upload-introVideo',
      fileFieldName: 'file',
      onFinish: resp => {
        this.info.introVideoId = resp.data._id;
        this.introVideoName = resp.data.name;
        this.uploading = false;
      },

      onFileSelect: resp => (this.introVideo = resp[0].file),
      id: 'id-introVideo',
      accept: 'video/*',
      onUploading: resp => (this.uploading = true)
    };

    await this.userService.me().then(resp => {
      this.info = resp.data;
      if (this.info && this.info.bio && this.info.bio.length > this.showChar) {
        this.showMore = true;
      }

      if (this.info.type === 'tutor') {
        this.introVideoType = this.info.introVideoId ? 'upload' : 'youtube';
      }

      if (this.info.introVideo) {
        this.introVideoName = this.info.introVideo.name;
      }

      const params = {
        tutorId: this.info._id
      };
      this.mySubjectService.search(params).then(resp => {
        this.tutorSubjects = resp.data.items;
      });
      this.userId = this.info._id;

      this.avatarUrl = resp.data.avatarUrl;
      if (this.avatarUrl !== 'http://localhost:9000/assets/default-avatar.jpg') this.checkAvatar = true;
    });
    await this.gradeService
      .search({
        take: 100,
        sort: 'ordering',
        sortType: 'asc'
      })
      .then(resp => {
        this.grades = resp.data.items;
      });
    this.mapGradeName(this.info.grades);
    this.mapLanguageName(this.info.languages);
    this.loading = false;
  }

  mapGradeName(gradeKeys: any) {
    this.grades.forEach(key => {
      if (gradeKeys.indexOf(key.id) > -1) {
        this.gradeNames.push(key.name);
      }
    });

    this.totalUserGrades = this.gradeNames.length;
    if (this.totalUserGrades > 4) this.gradeNames = _.chunk(this.gradeNames, 4);
  }
  mapLanguageName(languageKeys: any) {
    languageKeys.forEach(key => {
      this.languageNames.push(this.objectLanguage[key]);
    });
  }

  changeTimezone(event) {
    if (event === 'Asia/Saigon') {
      this.info.timezone = 'Asia/Ho_Chi_Minh';
    } else {
      this.info.timezone = event;
    }
  }

  submit(frm: any, isSubmitForm: boolean = true) {
    if (isSubmitForm) {
      if (this.info.type === 'tutor') {
        if (!this.info.introVideoId && !this.info.introYoutubeId)
          return this.toasty.error('Please upload introduction video');
      }

      if (this.introVideoType === 'youtube') {
        this.info.introVideoId = null;
      } else this.info.introYoutubeId = null;

      if (!frm.valid) {
        return this.toasty.error('Form is invalid, please check again.');
      }
      this.isEditProfile = false;
      this.isEditDescription = false;
      this.isSubmitted = true;
    }

    if (this.info.type === 'tutor') {
      const data = _.pick(this.info, [
        'name',
        'username',
        'subjectIds',
        'bio',
        'email',
        'address',
        'phoneNumber',
        'grades',
        'languages',
        'password',
        'timezone',
        'gender',
        'zipCode',
        'price1On1Class',
        'idYoutube',
        'country',
        'city',
        'state',
        'introYoutubeId',
        'introVideoId'
      ]);

      // if (data.subjectIds.length === 0) {
      //   return this.toasty.error('Veuillez sélectionner au moins un sujet avant de mettre à jour votre profil!');
      // }
      // if (number === 1 && data.grades.length === 0) {
      //   return this.toasty.error("S'il vous plaît sélectionner les grades");
      // }
      this.tutorService
        .update(data)
        .then(resp => {
          this.info = _.merge(resp.data, this.info);

          this.languageNames = [];
          this.mapLanguageName(this.info.languages);
          this.gradeNames = [];
          this.mapGradeName(this.info.grades);
          this.toasty.success('Updated successfully!');
          this.utilService.notifyEvent('profileUpdate', this.info);
        })
        .catch(err => this.toasty.error(`Something went wrong, please try again`));
    }
    if (this.info.type === 'user' || this.info.type === 'student' || this.info.type === 'parent') {
      this.userService
        .updateMe(this.info)
        .then(resp => {
          this.info = _.merge(resp.data, this.info);
          this.toasty.success('Updated successfully!');
          this.utilService.notifyEvent('profileUpdate', this.info);
        })
        .catch(err => this.toasty.error(err.data.message || err.data.email));
    }
  }

  changeNotification() {
    this.info.notificationSettings = !this.info.notificationSettings;

    const data = _.pick(this.info, ['notificationSettings']);
    this.userService
      .update(data)
      .then(resp => {
        this.info = _.merge(resp.data, this.info);
        if (this.info.notificationSettings === true) {
          this.toasty.success('Active notification!');
        }
        if (this.info.notificationSettings === false) {
          this.toasty.success('Deactive notification!');
        }
      })
      .catch(err => this.toasty.error(err.data.data.message || err.data.data.email));
  }

  inviteFriend() {
    this.userService.inviteFriend({ email: this.emailInvite }).then(resp => {
      if (resp.data.success) {
        return this.toasty.success('Invited');
      }
      this.toasty.error('Invite fail');
    });
  }

  onChangeLanguage(e: any) {
    this.ngSelectComponent.clearAllText = '';
  }

  onChangeGrade(event: any) {
    this.info.grades = [];
    event.forEach(element => {
      this.info.grades.push(element.id);
    });
    this.submit('', false);
  }

  open() {
    const modalRef = this.modalService.open(AvatarUploadComponent, { centered: true, backdrop: 'static' });
    modalRef.componentInstance.info = this.info;
    modalRef.result.then(
      res => {
        this.afterCancel.emit(res);
        this.info.avatarUrl = res;
        this.checkAvatar = true;
      },
      () => {}
    );
  }

  openCertification(type: string, index = 0, certificate = null) {
    const modalRef = this.modalService.open(AddCetificationComponent, { centered: true, backdrop: 'static' });
    modalRef.componentInstance.tutorId = this.info._id;
    modalRef.componentInstance.certificate = certificate;
    modalRef.componentInstance.type = type || 'education';
    modalRef.result.then(
      res => {
        if (certificate) {
          this.info[type][index] = res;
        } else {
          this.info[type].push(res);
        }
      },
      () => {}
    );
  }

  deleteCer(type: string, index: number, certificate = null) {
    if (window.confirm('Are you sure want to delete this certificate?')) {
      this.tutorService
        .deleteCertificate(certificate._id)
        .then(resp => {
          this.info[type].splice(index, 1);
          this.toasty.success('Deleted certificate successfully');
        })
        .catch(e => {
          this.toasty.error('Something went wrong, please try again!');
        });
    }
  }

  deleteAvatar() {
    if (this.checkAvatar) {
      if (window.confirm('Are you sure want to delete your avatar?')) {
        this.userService
          .deleteAvatar()
          .then(resp => {
            this.info.avatarUrl = 'http://localhost:9000/assets/default-avatar.jpg';
            //console.log(this.info.avatarUrl);
            this.toasty.success('Delete avatar successfully');
            this.checkAvatar = false;
          })
          .catch(e => {
            this.toasty.error('Something went wrong, please try again!');
          });
      }
    } else {
      this.toasty.error('No avatar to delete!');
    }
  }

  deleteSubject(item: IMySubject, index: number) {
    if (window.confirm('Are you sure want to delete this subject?')) {
      this.mySubjectService
        .delete(item._id)
        .then(resp => {
          this.toasty.success('Delete subject successfully');
          this.tutorSubjects.splice(index, 1);
        })
        .catch(e => {
          this.toasty.error('Something went wrong, please try again!');
        });
    }
  }
}
