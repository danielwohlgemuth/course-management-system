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
    activeOverlapSlots = null;
    popoverStyle = '';
    _slots = undefined;
    _days = undefined;
    _config = undefined;
    _overlapMap = new Map();

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

    handleBadgeClick(event) {
        event.stopPropagation();
        const key = event.currentTarget.dataset.slotKey;
        const group = this._overlapMap.get(key);
        const rect = event.currentTarget.getBoundingClientRect();
        this.popoverStyle = `position:fixed;top:${rect.bottom + 4}px;left:${rect.left}px;z-index:1000;`;
        this.activeOverlapSlots = group;
    }

    handleContainerClick() {
        this.activeOverlapSlots = null;
    }

    handlePopoverItemClick(event) {
        event.stopPropagation();
        const recordId = event.currentTarget.dataset.recordId;
        this.activeOverlapSlots = null;
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

    get hasActivePopover() {
        return Boolean(this.activeOverlapSlots);
    }

    _buildCalendar(slots, days) {
        const { gridStartHour, gridEndHour, palette } = this._config;
        const totalHours = gridEndHour - gridStartHour;
        const colorMap = new Map();
        const byDay = new Map(days.map(d => [d.value, []]));
        this._overlapMap = new Map();

        for (const slot of slots) {
            if (!byDay.has(slot.Day_of_Week__c)) continue;
            if (!colorMap.has(slot.Course__c)) {
                colorMap.set(slot.Course__c, palette[colorMap.size % palette.length]);
            }
            const color = colorMap.get(slot.Course__c);
            byDay.get(slot.Day_of_Week__c).push({
                key: slot.Id,
                recordId: slot.Course__c,
                courseName: slot.Course__r.Course_Name__c,
                instructor: slot.Course__r.Instructor__c,
                timeLabel: `${formatTime(slot.Start_Time__c)} – ${formatTime(slot.End_Time__c)}`,
                color,
                swatchStyle: `background-color:${color};`,
                startMs: slot.Start_Time__c,
                endMs: slot.End_Time__c,
                overlapCount: 0,
                style: ''
            });
        }

        for (const daySlots of byDay.values()) {
            daySlots.sort((a, b) => a.startMs - b.startMs);
            this._resolveOverlaps(daySlots, gridStartHour, totalHours);
        }

        return days.map(d => ({ key: d.value, label: d.label, slots: byDay.get(d.value) }));
    }

    _resolveOverlaps(daySlots, gridStartHour, totalHours) {
        const parent = daySlots.map((_, i) => i);
        const find = i => {
            while (parent[i] !== i) { parent[i] = parent[parent[i]]; i = parent[i]; }
            return i;
        };
        const union = (i, j) => { parent[find(i)] = find(j); };

        for (let i = 0; i < daySlots.length; i++) {
            for (let j = i + 1; j < daySlots.length; j++) {
                if (daySlots[i].startMs < daySlots[j].endMs && daySlots[i].endMs > daySlots[j].startMs) {
                    union(i, j);
                }
            }
        }

        const groups = new Map();
        for (let i = 0; i < daySlots.length; i++) {
            const root = find(i);
            if (!groups.has(root)) groups.set(root, []);
            groups.get(root).push(i);
        }

        for (const indices of groups.values()) {
            if (indices.length === 1) {
                const s = daySlots[indices[0]];
                const top = hoursToPct(msToHours(s.startMs), gridStartHour, totalHours);
                const height = hoursToPct(msToHours(s.endMs), gridStartHour, totalHours) - top;
                s.style = `top:${top}%;height:${height}%;background-color:${s.color};`;
            } else {
                const groupStartMs = Math.min(...indices.map(i => daySlots[i].startMs));
                const groupEndMs = Math.max(...indices.map(i => daySlots[i].endMs));
                const top = hoursToPct(msToHours(groupStartMs), gridStartHour, totalHours);
                const height = hoursToPct(msToHours(groupEndMs), gridStartHour, totalHours) - top;

                const primaryIdx = indices.reduce((a, b) => daySlots[a].startMs <= daySlots[b].startMs ? a : b);
                const primary = daySlots[primaryIdx];
                const group = indices.map(i => daySlots[i]);

                primary.style = `top:${top}%;height:${height}%;background-color:${primary.color};`;
                primary.overlapCount = group.length - 1;
                this._overlapMap.set(primary.key, group);

                for (const idx of indices) {
                    if (idx !== primaryIdx) {
                        daySlots[idx].style = 'display:none;';
                    }
                }
            }
        }
    }
}
