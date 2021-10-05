import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import * as _ from 'lodash';
import * as moment from 'moment';
// import { CalendarComponent } from 'ng-fullcalendar';
import { Options } from 'fullcalendar';
import { CalendarService } from '../../services/calendar.service';

import { AppointmentService } from '../../../appointment/services/appointment.service';
import { AuthService } from '../../../shared/services';
import {
  CalendarOptions,
  DateSelectArg,
  EventClickArg,
  EventApi,
  CalendarApi,
  FullCalendarComponent,
  EventInput,
  Calendar
} from '@fullcalendar/angular';
@Component({
  selector: 'app-schedule-calendar',
  templateUrl: './schedule.html'
})
export class ScheduleEditComponent implements OnInit {
  @Input() webinarId: any;
  @Input() type: string;
  @Input() hashWebinar: string;
  @Input() isFree: boolean = false;
  @Output() onChange = new EventEmitter();
  public today = moment();
  public getMonth = moment().get('month');
  public month = moment().set('month', this.getMonth);
  public day: any;
  public date: any = [];
  public i: any;
  public showTime: any;
  public startTime: any;
  public toTime: any;
  public events: any = [];
  public currentUser: any;
  public calendarEvents: EventInput[] = [];
  public calendarVisible = true;
  public appointments: any[];
  public calendarOptions: CalendarOptions = {
    editable: true,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'timeGridWeek,timeGridDay'
    },
    initialEvents: [],
    selectable: true,
    initialView: 'timeGridWeek',
    eventOverlap: false,
    locale: 'en',
    select: this.select.bind(this),
    eventClick: this.eventClick.bind(this),
    eventsSet: this.handleEvents.bind(this),
    eventDrop: this.updateEvent.bind(this),
    datesSet: this.loadInitialEvents.bind(this),
    eventResize: this.updateEvent.bind(this),
    eventAllow: this.dragAllow.bind(this),
    longPressDelay: 100,
    eventLongPressDelay: 100,
    selectLongPressDelay: 100
  };
  public currentEvents: EventApi[] = [];
  public calendarApi: CalendarApi;
  public initialized = false;

  @ViewChild('calendar') calendarComponent: FullCalendarComponent;

  constructor(
    private calendar: CalendarService,
    private toasty: ToastrService,
    private authService: AuthService,
    private appointmentServie: AppointmentService
  ) {}

  ngOnInit() {}

  handleEvents(events: EventApi[]) {
    this.currentEvents = events;
  }

  dragAllow(dropInfo, _) {
    const startTime = new Date(dropInfo.start);
    const toTime = new Date(dropInfo.end);
    const duration = moment.duration((moment(toTime).unix() - moment(startTime).unix()) * 1000);
    if ((duration.minutes() > 0 && duration.hours() === 1) || duration.hours() > 1) {
      this.toasty.error('Maximum time allowed is 1 hours!');
      return false;
    }
    if (moment().isAfter(startTime)) {
      this.toasty.error('Cannot update slot in the past!');
      return false;
    }
    return true;
  }

  reRender() {
    this.calendarComponent.getApi().render();
  }

  clearEvents() {
    this.events = [];
  }

  loadStatic() {
    this.calendarEvents = [];
    this.calendarApi.removeAllEvents();
    this.authService.getCurrentUser().then(user => {
      if (user && user.id) {
        this.calendar
          .search({
            startTime: moment(this.calendarApi.view.activeStart).toDate().toISOString(),
            toTime: moment(this.calendarApi.view.activeEnd).toDate().toISOString(),
            webinarId: this.webinarId || '',
            take: 10000,
            type: this.type || 'subject',
            tutorId: user.id,
            hashWebinar: this.hashWebinar || ''
            // isFree: this.isFree
          })
          .then(async resp => {
            this.events = resp.data.items;
            this.mappingData(this.events);
            this.calendarApi.addEventSource(this.calendarEvents);
          });
      }
    });
  }

  loadInitialEvents($event: CalendarApi) {
    this.calendarEvents = [];
    const calendarApi = $event.view.calendar;
    this.calendarApi = calendarApi;
    calendarApi.removeAllEvents();
    this.authService.getCurrentUser().then(async user => {
      if (user && user.id) {
        if (!this.type || this.type === 'subject') {
          await Promise.all([
            this.appointmentServie
              .appointmentTutor(user._id, {
                startTime: moment($event.view.activeStart).toDate().toISOString(),
                toTime: moment($event.view.activeEnd).toDate().toISOString(),
                targetType: 'subject'
              })
              .then(resp => {
                this.appointments = resp.data.items;
                return this.appointments;
              }),
            this.calendar
              .search({
                tutorId: user._id,
                startTime: moment($event.view.activeStart).toDate().toISOString(),
                toTime: moment($event.view.activeEnd).toDate().toISOString(),
                take: 10000,
                type: 'subject'
              })
              .then(resp => {
                this.events = resp.data.items;
                return this.events;
              })
          ]);

          this.mappingData(this.events);
          calendarApi.addEventSource(this.calendarEvents);
        } else {
          this.calendar
            .search({
              startTime: moment($event.view.activeStart).toDate().toISOString(),
              toTime: moment($event.view.activeEnd).toDate().toISOString(),
              webinarId: this.webinarId || '',
              take: 10000,
              type: this.type || 'subject',
              tutorId: user.id,
              hashWebinar: this.hashWebinar || ''
            })
            .then(async resp => {
              this.events = resp.data.items;
              this.events.forEach(e => {
                const calendarevent = {
                  start: moment(e.startTime).toDate(),
                  end: moment(e.toTime).toDate(),
                  item: e,
                  backgroundColor: '#e4465a'
                };
                this.calendarEvents.push(calendarevent);
                if (moment().utc().isAfter(moment.utc(calendarevent.start))) {
                  calendarevent.backgroundColor = '#ddd';
                }
              });
              calendarApi.addEventSource(this.calendarEvents);
            });
        }
      }
    });
  }

  mappingData(items: any) {
    if (items.length !== 0) {
      items.map(item => {
        this.createChunks(item);
      });
    }
  }

  eventClick($event: EventClickArg) {
    const { isDisabled } = $event.event.extendedProps;
    if (isDisabled) {
      return;
    }
    if (window.confirm('Do you want to delete event?')) {
      const item = $event.event.extendedProps.item;
      this.calendar
        .delete(item.id)
        .then(() => {
          $event.event.remove();
          this.toasty.success('Deleted');
          this.onChange.emit(this.isFree);
        })
        .catch(e => this.toasty.error(e.data.data.message || 'Something went wrong, please try again'));
    }
  }

  updateEvent($event: any) {
    const oldEvent = {
      start: $event.oldEvent.start,
      end: $event.oldEvent.end,
      item: $event.oldEvent.extendedProps.item
    };

    const calendarApi = $event.view.calendar;
    const item = $event.event.extendedProps.item;
    const startTime = moment($event.event.start).toDate();
    if (moment().isAfter(startTime)) {
      return this.toasty.error('Cannot update slot in the past!');
    }
    let toTime = moment($event.event.end).toDate();

    // const duration = moment.duration((moment(toTime).unix() - moment(startTime).unix()) * 1000);
    // if (duration.minutes() === 30 && this.type === 'subject') {
    //   toTime = moment(toTime).add(30, 'minutes').toDate();
    //   $event.event.end = moment($event.event.end).add(30, 'minutes');
    // }

    this.calendar
      .update(item._id, {
        startTime,
        toTime,
        webinarId: this.webinarId,
        type: this.type || 'subject',
        hashWebinar: this.hashWebinar || ''
      })
      .then(resp => {
        const el = {
          start: startTime,
          end: toTime,
          item
        };
        for (let index = 0; index < this.calendarEvents.length; index++) {
          if (this.calendarEvents[index].item._id === item._id) {
            this.calendarEvents[index] = el;
          }
        }
        this.toasty.success('Updated');
        this.onChange.emit(this.isFree);
      })
      .catch(e => {
        for (let index = 0; index < this.calendarEvents.length; index++) {
          if (this.calendarEvents[index].item._id === item._id) {
            this.calendarEvents[index] = oldEvent;
          }
        }
        calendarApi.removeAllEvents();
        calendarApi.addEventSource(this.calendarEvents);
        this.toasty.error(e.data ? e.data.message : e.message);
        // this.toasty.error((e.data && e.data.data && e.data.data.message) || e.data.message);
      });
  }

  select($event: any) {
    const startTime = moment($event.start).toDate();
    const calendarApi = $event.view.calendar;
    this.calendarApi = calendarApi;
    if (moment().isAfter(startTime)) {
      return this.toasty.error('Cannot create slot in the past!');
    }
    let toTime = moment($event.end).toDate();
    const duration = moment.duration((moment(toTime).unix() - moment(startTime).unix()) * 1000);
    if ((duration.minutes() > 0 && duration.hours() === 1) || duration.hours() > 1) {
      return this.toasty.error('Maximum time allowed is 1 hours!');
    }
    // if (duration.minutes() === 30) {
    //   toTime = moment(toTime).add(30, 'minutes').toDate();
    // }

    // TODO - need modal?
    // otherwise we can submit a range, then system can create multiple events

    this.calendar
      .create({
        startTime,
        toTime,
        webinarId: this.webinarId || '',
        type: this.type || 'subject',
        hashWebinar: this.hashWebinar || '',
        isFree: this.isFree
      })
      .then(resp => {
        calendarApi.addEvent({
          item: resp.data,
          start: startTime,
          end: toTime
        });
        this.calendarEvents.push({
          item: resp.data,
          start: startTime,
          end: toTime
        });
        this.toasty.success('Created successfully');
        this.onChange.emit(this.isFree);
        // this.ucCalendar.fullCalendar('renderEvent', el);
        // this.ucCalendar.fullCalendar('rerenderEvents');
      })
      .catch(e =>
        this.toasty.error(e.data && e.data.data && e.data.data.message ? e.data.data.message : e.data.message)
      );
  }

  createChunks(item: any) {
    let startTime = moment.utc(item.startTime).toDate();
    do {
      const toTime = moment.utc(item.toTime).toDate();
      const slot = {
        start: startTime,
        end: toTime,
        backgroundColor: '#e4465a',
        item,
        isDisabled: false,
        title: '',
        isFree: item.isFree
      };
      if (moment().utc().add(30, 'minute').isAfter(moment.utc(slot.start))) {
        slot.backgroundColor = '#ddd';
        slot.isDisabled = true;
        slot.title = 'Not available';
      }

      if (slot.isFree !== this.isFree) {
        slot.backgroundColor = '#ddd';
        slot.isDisabled = true;
        slot.title = slot.isFree ? 'Free slot' : 'Paid slot';
      }
      this.appointments.forEach(appointment => {
        if (moment.utc(appointment.startTime).format() === moment.utc(slot.start).format()) {
          slot.backgroundColor = '#ddd';
          slot.isDisabled = true;

          slot.title = appointment.isFree ? 'Free slot - Booked' : 'Paid slot - Booked';
        }
      });
      this.calendarEvents.push(slot);
      startTime = toTime;
    } while (moment(startTime).isBefore(item.toTime));
    return this.calendarEvents;
  }
}
