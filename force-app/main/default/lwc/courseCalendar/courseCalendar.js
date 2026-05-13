import { LightningElement, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';
import TIMESLOT_OBJECT from '@salesforce/schema/TimeSlot__c';
import DAY_OF_WEEK_FIELD from '@salesforce/schema/TimeSlot__c.Day_of_Week__c';
import getTimeSlots from '@salesforce/apex/CourseCalendarController.getTimeSlots';
import getConfig from '@salesforce/apex/CourseCalendarController.getConfig';

function msToHours(ms) {
    return ms / 3_600_000;
}

function hoursToPct(h, gridStart, totalHours) {
    return ((h - gridStart) / totalHours) * 100;
}

function formatTime(ms) {
    const totalMins = Math.floor(ms / 60_000);
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}

export default class CourseCalendar extends NavigationMixin(LightningElement) {
    calendarDays = [];
    error = undefined;
    _slots = undefined;
    _days = undefined;
    _config = undefined;

    @wire(getObjectInfo, { objectApiName: TIMESLOT_OBJECT })
    _objectInfo;

    @wire(getPicklistValues, {
        recordTypeId: '$_objectInfo.data.defaultRecordTypeId',
        fieldApiName: DAY_OF_WEEK_FIELD
    })
    wiredPicklistValues({ data, error }) {
        if (data) {
            this._days = data.values.map(v => ({ value: v.value, label: v.label }));
            this._rebuildIfReady();
        } else if (error) {
            this.error = error;
        }
    }

    @wire(getTimeSlots)
    wiredSlots({ data, error }) {
        if (data) {
            this.error = undefined;
            this._slots = data;
            this._rebuildIfReady();
        } else if (error) {
            this.error = error;
            this.calendarDays = [];
        }
    }

    @wire(getConfig)
    wiredConfig({ data, error }) {
        if (data) {
            this._config = {
                gridStartHour: data.Grid_Start_Hour__c,
                gridEndHour: data.Grid_End_Hour__c,
                palette: data.Palette__c.split(',').map(c => c.trim()),
                heightPixels: data.Height_Pixels__c
            };
            this._rebuildIfReady();
        } else if (error) {
            this.error = error;
        }
    }

    handleSlotClick(event) {
        const recordId = event.currentTarget.dataset.recordId;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: { recordId, actionName: 'view' }
        });
    }

    _rebuildIfReady() {
        if (this._slots && this._days && this._config) {
            this.calendarDays = this._buildCalendar(this._slots, this._days);
        }
    }

    get calendarBodyStyle() {
        if (!this._config) return '';
        return `height:${this._config.heightPixels}px`;
    }

    get timeAxisLabels() {
        if (!this._config) return [];
        const { gridStartHour, gridEndHour } = this._config;
        const totalHours = gridEndHour - gridStartHour;
        const labels = [];
        for (let h = gridStartHour; h <= gridEndHour; h++) {
            const pct = hoursToPct(h, gridStartHour, totalHours);
            labels.push({
                key: h,
                label: `${h % 12 || 12} ${h < 12 ? 'AM' : 'PM'}`,
                style: `top:${pct}%;transform:translateY(${pct === 0 ? '0' : '-50%'})`
            });
        }
        return labels;
    }

    get hasError() {
        return Boolean(this.error);
    }

    get isLoading() {
        return !this.calendarDays.length && !this.error;
    }

    _buildCalendar(slots, days) {
        const { gridStartHour, gridEndHour, palette } = this._config;
        const totalHours = gridEndHour - gridStartHour;
        const colourMap = new Map();
        const byDay = new Map(days.map(d => [d.value, []]));
        for (const slot of slots) {
            if (!byDay.has(slot.Day_of_Week__c)) continue;
            const startH = msToHours(slot.Start_Time__c);
            const endH = msToHours(slot.End_Time__c);
            const top = hoursToPct(startH, gridStartHour, totalHours);
            const height = hoursToPct(endH, gridStartHour, totalHours) - top;
            if (!colourMap.has(slot.Course__c)) {
                colourMap.set(slot.Course__c, palette[colourMap.size % palette.length]);
            }
            byDay.get(slot.Day_of_Week__c).push({
                key: slot.Id,
                recordId: slot.Course__c,
                courseName: slot.Course__r.Course_Name__c,
                instructor: slot.Course__r.Instructor__c,
                timeLabel: `${formatTime(slot.Start_Time__c)} – ${formatTime(slot.End_Time__c)}`,
                style: `top:${top}%;height:${height}%;background-color:${colourMap.get(slot.Course__c)};`
            });
        }
        return days.map(d => ({ key: d.value, label: d.label, slots: byDay.get(d.value) }));
    }
}