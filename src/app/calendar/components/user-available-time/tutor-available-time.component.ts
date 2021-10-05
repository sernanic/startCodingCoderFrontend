import { Component, Input, Output, EventEmitter, OnInit, ViewChild, OnChanges, AfterViewInit } from '@angular/core';
import { CalendarService } from '../../services/calendar.service';
import { AppointmentService } from '../../../appointment/services/appointment.service';
import * as moment from 'moment';
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
  selector: 'app-tutor-available-time',
  templateUrl: 'tutor-available-time.html'
})
export class UserAvailableTimeComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() tutorId: any;
  @Input() timeSelected: any = {};
  @Input() isFree: boolean = false;
  @Output() onSelect = new EventEmitter();
  private startTime;
  private toTime;
  public weekText = '';
  public states: any = {
    active: ''
  };
  public appointments: any;
  public availableTimes: any;
  public calendarEvents: EventInput[] = [];
  public calendarVisible = true;
  public calendarOptions: CalendarOptions = {
    editable: false,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'timeGridWeek,timeGridDay'
    },
    initialEvents: [],
    selectable: false,
    initialView: 'timeGridWeek',
    eventOverlap: false,
    locale: 'en',
    // select: this.select.bind(this),
    eventClick: this.onSelectSlot.bind(this),
    eventDidMount: function (info) {
      const { item, isDisabled } = info.event.extendedProps;
      if (!isDisabled) {
        const element = info.el;
        element.querySelector('.fc-event-title').innerHTML =
          '<a class="book-now" style="color: white;" href="javascript:void(0)">' + 'Book now' + '</a>';
      }
    },
    datesSet: this.changeWeek.bind(this)
    //slotDuration: '00:15:00'
  };
  // public currentEvents: EventApi[] = [];
  public calendarApi: CalendarApi;
  @ViewChild('calendar') calendarComponent: FullCalendarComponent;
  constructor(private service: CalendarService, private appointmentServie: AppointmentService) {}

  ngOnInit() {
    if (this.timeSelected && this.timeSelected.startTime) {
      this.select(this.timeSelected);
    }
  }

  async ngOnChanges() {
    if (this.startTime && this.toTime) {
      this.calendarEvents = [];
      this.calendarApi.removeAllEvents();
      await this.query();
      this.calendarApi.addEventSource(this.calendarEvents);
    }
  }

  ngAfterViewInit() {
    this.calendarApi = this.calendarComponent.getApi();
    // this.calendarApi.next();
  }

  async query() {
    await Promise.all([
      this.appointmentServie
        .appointmentTutor(this.tutorId, {
          startTime: this.startTime,
          toTime: this.toTime,
          targetType: 'subject',
          status: 'booked,pending',
          isFree: this.isFree
        })
        .then(resp => {
          this.appointments = resp.data.items;
          return this.appointments;
        }),
      this.service
        .search({
          tutorId: this.tutorId,
          startTime: this.startTime,
          toTime: this.toTime,
          take: 10000,
          type: 'subject',
          isFree: this.isFree
        })
        .then(resp => {
          this.availableTimes = resp.data.items;
          return this.availableTimes;
        })
    ]);
    this.mappingData(this.availableTimes);
  }

  mappingData(items: any) {
    if (items.length !== 0) {
      items.map(item => {
        this.createChunks(item);
      });
    }
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
        title: ''
      };
      if (moment().utc().add(15, 'minute').isAfter(moment.utc(slot.start))) {
        slot.backgroundColor = '#ddd';
        slot.isDisabled = true;
        slot.title = 'Not available';
      }
      this.appointments.forEach(appointment => {
        if (moment.utc(appointment.startTime).format() === moment.utc(slot.start).format()) {
          slot.backgroundColor = '#ddd';
          slot.isDisabled = true;
          slot.title = 'Not available';
        }
      });
      this.calendarEvents.push(slot);
      startTime = toTime;
    } while (moment(startTime).isBefore(item.toTime));
    return this.calendarEvents;
  }

  select(time: any) {
    this.states.active = time.startTime;
    this.onSelect.emit(time);
  }

  async changeWeek($event: CalendarApi) {
    this.calendarEvents = [];
    const calendarApi = $event.view.calendar;
    calendarApi.removeAllEvents();
    this.startTime = moment($event.view.activeStart).toDate().toISOString();
    this.toTime = moment($event.view.activeEnd).toDate().toISOString();
    await this.query();
    calendarApi.addEventSource(this.calendarEvents);
  }

  onSelectSlot($event: EventClickArg) {
    const { item, isDisabled } = $event.event.extendedProps;
    if (isDisabled) {
      return;
    }
    this.onSelect.emit($event.event);
  }
}
