import { LightningElement, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';
import TIMESLOT_OBJECT from '@salesforce/schema/TimeSlot__c';
import DAY_OF_WEEK_FIELD from '@salesforce/schema/TimeSlot__c.Day_of_Week__c';
import COURSE_OBJECT from '@salesforce/schema/Course__c';
import SEMESTER_FIELD from '@salesforce/schema/Course__c.Semester__c';
import getTimeSlots from '@salesforce/apex/CourseCalendarController.getTimeSlots';
import getConfig from '@salesforce/apex/CourseCalendarController.getConfig';
import { logError } from 'c/errorLogger';

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
    selectedSemester = '';
    selectedInstructor = '';
    selectedCourse = '';
    selectedClassroom = '';
    semesterOptions = [{ label: 'All', value: '' }];
    _slots = undefined;
    _days = undefined;
    _config = undefined;
    _semesterInitialized = false;
    _overlapMap = new Map();

    @wire(getObjectInfo, { objectApiName: TIMESLOT_OBJECT })
    _objectInfo;

    @wire(getObjectInfo, { objectApiName: COURSE_OBJECT })
    _courseInfo;

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
            logError('courseCalendar', 'wiredPicklistValues: ' + JSON.stringify(error), '');
        }
    }

    @wire(getPicklistValues, {
        recordTypeId: '$_courseInfo.data.defaultRecordTypeId',
        fieldApiName: SEMESTER_FIELD
    })
    wiredSemesterValues({ data, error }) {
        if (data) {
            this.semesterOptions = [
                { label: 'All', value: '' },
                ...data.values.map(v => ({ value: v.value, label: v.label }))
            ];
        } else if (error) {
            this.error = error;
            logError('courseCalendar', 'wiredSemesterValues: ' + JSON.stringify(error), '');
        }
    }

    @wire(getTimeSlots, { semester: '$selectedSemester' })
    wiredSlots({ data, error }) {
        if (data) {
            if (!Array.isArray(data)) return;
            this.error = undefined;
            this._slots = data;
            this._rebuildIfReady();
        } else if (error) {
            this.error = error;
            this.calendarDays = [];
            logError('courseCalendar', 'wiredSlots: ' + JSON.stringify(error), '');
        }
    }

    @wire(getConfig)
    wiredConfig({ data, error }) {
        if (data) {
            if (Array.isArray(data) || !('Grid_Start_Hour__c' in data)) return;
            this._config = {
                gridStartHour: data.Grid_Start_Hour__c,
                gridEndHour: data.Grid_End_Hour__c,
                palette: (data.Palette__c || '').split(',').map(c => c.trim()).filter(Boolean),
                heightPixels: data.Height_Pixels__c
            };
            if (!this._semesterInitialized) {
                this._semesterInitialized = true;
                this.selectedSemester = data.Semester__c || '';
            }
            this._rebuildIfReady();
        } else if (error) {
            this.error = error;
            logError('courseCalendar', 'wiredConfig: ' + JSON.stringify(error), '');
        }
    }

    handleSlotClick(event) {
        const recordId = event.currentTarget.dataset.recordId;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: { recordId, objectApiName: 'Course__c', actionName: 'view' }
        });
    }

    handleGroupClick(event) {
        event.stopPropagation();
        const key = event.currentTarget.dataset.groupKey;
        const group = this._overlapMap.get(key);
        const popoverWidth = 300;
        const popoverHeight = 240;
        const left = event.clientX + 8 + popoverWidth > window.innerWidth
            ? event.clientX - 8 - popoverWidth
            : event.clientX + 8;
        const top = event.clientY + popoverHeight > window.innerHeight
            ? Math.max(0, event.clientY - popoverHeight)
            : event.clientY;
        this.popoverStyle = `position:fixed;top:${top}px;left:${left}px;z-index:1000;`;
        this.activeOverlapSlots = group;
    }

    handleContainerClick() {
        this.activeOverlapSlots = null;
    }

    handleSemesterChange(event) {
        this.selectedInstructor = '';
        this.selectedCourse = '';
        this.selectedClassroom = '';
        this.selectedSemester = event.detail.value;
    }

    handleInstructorChange(event) {
        this.selectedInstructor = event.detail.value;
        this._rebuildIfReady();
    }

    handleCourseChange(event) {
        this.selectedCourse = event.detail.value;
        this._rebuildIfReady();
    }

    handleClassroomChange(event) {
        this.selectedClassroom = event.detail.value;
        this._rebuildIfReady();
    }

    handlePopoverItemClick(event) {
        event.stopPropagation();
        const recordId = event.currentTarget.dataset.recordId;
        this.activeOverlapSlots = null;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: { recordId, objectApiName: 'Course__c', actionName: 'view' }
        });
    }

    _rebuildIfReady() {
        if (this._slots && this._days && this._config) {
            this.calendarDays = this._buildCalendar(this._applyFilters(this._slots), this._days);
        }
    }

    _applyFilters(slots) {
        return slots.filter(slot => {
            const course = slot.Course__r || {};
            if (this.selectedInstructor &&
                course.Instructor_User__r?.Name !== this.selectedInstructor) {
                return false;
            }
            if (this.selectedCourse &&
                course.Course_Name__c !== this.selectedCourse) {
                return false;
            }
            if (this.selectedClassroom &&
                course.Classroom__c !== this.selectedClassroom) {
                return false;
            }
            return true;
        });
    }

    _distinctOptions(accessor) {
        const values = new Set();
        for (const slot of this._slots || []) {
            const value = accessor(slot.Course__r || {});
            if (value) values.add(value);
        }
        return [
            { label: 'All', value: '' },
            ...[...values].sort().map(v => ({ label: v, value: v }))
        ];
    }

    get instructorOptions() {
        return this._distinctOptions(c => c.Instructor_User__r?.Name);
    }

    get courseOptions() {
        return this._distinctOptions(c => c.Course_Name__c);
    }

    get classroomOptions() {
        return this._distinctOptions(c => c.Classroom__c);
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
                instructor: slot.Course__r.Instructor_User__r?.Name,
                timeLabel: `${formatTime(slot.Start_Time__c)} – ${formatTime(slot.End_Time__c)}`,
                color,
                swatchStyle: `background-color:${color};`,
                startMs: slot.Start_Time__c,
                endMs: slot.End_Time__c
            });
        }

        const renderablesByDay = new Map();
        for (const [day, daySlots] of byDay.entries()) {
            daySlots.sort((a, b) => a.startMs - b.startMs);
            renderablesByDay.set(day, this._resolveOverlaps(daySlots, gridStartHour, totalHours));
        }

        return days.map(d => {
            const slots = renderablesByDay.get(d.value);
            return { key: d.value, label: d.label, slots, hasOverlap: slots.some(s => s.isGroup) };
        });
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

        const renderables = [];

        for (const indices of groups.values()) {
            if (indices.length === 1) {
                const s = daySlots[indices[0]];
                const top = hoursToPct(msToHours(s.startMs), gridStartHour, totalHours);
                const height = hoursToPct(msToHours(s.endMs), gridStartHour, totalHours) - top;
                renderables.push({
                    key: s.key,
                    isCard: true,
                    wrapperStyle: `top:${top}%;height:${height}%;`,
                    cardStyle: `background-color:${s.color};`,
                    recordId: s.recordId,
                    courseName: s.courseName,
                    instructor: s.instructor,
                    timeLabel: s.timeLabel
                });
            } else {
                const groupStartMs = Math.min(...indices.map(i => daySlots[i].startMs));
                const groupEndMs = Math.max(...indices.map(i => daySlots[i].endMs));
                const groupDurationMs = groupEndMs - groupStartMs;
                const top = hoursToPct(msToHours(groupStartMs), gridStartHour, totalHours);
                const height = hoursToPct(msToHours(groupEndMs), gridStartHour, totalHours) - top;

                const n = indices.length;
                const slotsSorted = indices.map(i => daySlots[i]).sort((a, b) => a.startMs - b.startMs);

                const strips = slotsSorted.map((s, idx) => {
                    const stripTop = ((s.startMs - groupStartMs) / groupDurationMs) * 100;
                    const stripHeight = ((s.endMs - s.startMs) / groupDurationMs) * 100;
                    const stripLeft = (idx / n) * 100;
                    const stripWidth = (1 / n) * 100;
                    return {
                        key: s.key,
                        style: `top:${stripTop}%;height:${stripHeight}%;left:${stripLeft}%;width:${stripWidth}%;background-color:${s.color};`
                    };
                });

                const groupKey = `group-${slotsSorted[0].key}`;
                this._overlapMap.set(groupKey, slotsSorted);

                renderables.push({
                    key: groupKey,
                    isGroup: true,
                    count: n,
                    wrapperStyle: `top:${top}%;height:${height}%;`,
                    strips
                });
            }
        }

        return renderables;
    }
}