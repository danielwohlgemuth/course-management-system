import { LightningElement, wire } from 'lwc';
import getTimeSlots from '@salesforce/apex/CourseCalendarController.getTimeSlots';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const GRID_START_HOUR = 7;
const GRID_END_HOUR = 21;
const TOTAL_HOURS = GRID_END_HOUR - GRID_START_HOUR;
const PALETTE = ['#4C9BE8', '#E8734C', '#4CE87B', '#E8D24C', '#9B4CE8', '#4CE8D2', '#E84C9B', '#88C0D0'];

function msToHours(ms) {
    return ms / 3_600_000;
}

function hoursToPct(h) {
    return ((h - GRID_START_HOUR) / TOTAL_HOURS) * 100;
}

function formatTime(ms) {
    const totalMins = Math.floor(ms / 60_000);
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}

export default class CourseCalendar extends LightningElement {
    calendarDays = [];
    error = undefined;

    @wire(getTimeSlots)
    wiredSlots({ data, error }) {
        if (data) {
            this.error = undefined;
            this.calendarDays = this._buildCalendar(data);
        } else if (error) {
            this.error = error;
            this.calendarDays = [];
        }
    }

    get timeAxisLabels() {
        const labels = [];
        for (let h = GRID_START_HOUR; h <= GRID_END_HOUR; h++) {
            const pct = ((h - GRID_START_HOUR) / TOTAL_HOURS) * 100;
            labels.push({
                key: h,
                label: `${h % 12 || 12} ${h < 12 ? 'AM' : 'PM'}`,
                style: `top:${pct}%`
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

    _buildCalendar(slots) {
        const colourMap = new Map();
        const byDay = new Map(DAYS.map(d => [d, []]));
        for (const slot of slots) {
            if (!byDay.has(slot.Day_of_Week__c)) continue;
            const startH = msToHours(slot.Start_Time__c);
            const endH = msToHours(slot.End_Time__c);
            const top = hoursToPct(startH);
            const height = hoursToPct(endH) - top;
            if (!colourMap.has(slot.Course__c)) {
                colourMap.set(slot.Course__c, PALETTE[colourMap.size % PALETTE.length]);
            }
            byDay.get(slot.Day_of_Week__c).push({
                key: slot.Id,
                courseName: slot.Course__r.Course_Name__c,
                instructor: slot.Course__r.Instructor__c,
                timeLabel: `${formatTime(slot.Start_Time__c)} – ${formatTime(slot.End_Time__c)}`,
                style: `top:${top}%;height:${height}%;background-color:${colourMap.get(slot.Course__c)};`
            });
        }
        return DAYS.map(d => ({ key: d, label: d, slots: byDay.get(d) }));
    }
}