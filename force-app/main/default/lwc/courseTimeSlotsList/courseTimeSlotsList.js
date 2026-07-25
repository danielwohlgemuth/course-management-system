import { LightningElement, api, wire } from "lwc";
import getTimeSlotsForCourse from "@salesforce/apex/CourseCalendarController.getTimeSlotsForCourse";
import { logError } from "c/errorLogger";
import TITLE from "@salesforce/label/c.CourseTimeSlotsList_Title";
import DAY_COLUMN_HEADER from "@salesforce/label/c.CourseTimeSlotsList_DayColumnHeader";
import START_COLUMN_HEADER from "@salesforce/label/c.CourseTimeSlotsList_StartColumnHeader";
import END_COLUMN_HEADER from "@salesforce/label/c.CourseTimeSlotsList_EndColumnHeader";
import EMPTY_MESSAGE from "@salesforce/label/c.CourseTimeSlotsList_EmptyMessage";
import ERROR_MESSAGE from "@salesforce/label/c.CourseTimeSlotsList_ErrorMessage";

// Salesforce Time fields arrive as milliseconds since midnight
function formatTime(ms) {
  const totalMins = Math.floor(ms / 60_000);
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

export default class CourseTimeSlotsList extends LightningElement {
  @api recordId;

  error = false;
  _slots;

  @wire(getTimeSlotsForCourse, { courseId: "$recordId" })
  wiredSlots({ data, error }) {
    if (data) {
      this.error = false;
      this._slots = data;
    } else if (error) {
      this.error = true;
      this._slots = undefined;
      logError(
        "courseTimeSlotsList",
        "wiredSlots: " + JSON.stringify(error),
        this.recordId
      );
    }
  }

  get title() {
    return TITLE;
  }

  get dayColumnHeader() {
    return DAY_COLUMN_HEADER;
  }

  get startColumnHeader() {
    return START_COLUMN_HEADER;
  }

  get endColumnHeader() {
    return END_COLUMN_HEADER;
  }

  get emptyMessage() {
    return EMPTY_MESSAGE;
  }

  get errorMessage() {
    return ERROR_MESSAGE;
  }

  get slots() {
    if (!this._slots) {
      return [];
    }
    return this._slots.map((slot) => ({
      id: slot.Id,
      day: slot.Day_of_Week__c,
      startLabel: formatTime(slot.Start_Time__c),
      endLabel: formatTime(slot.End_Time__c)
    }));
  }

  get hasSlots() {
    return this.slots.length > 0;
  }

  get isEmpty() {
    return !this.error && !this.hasSlots;
  }
}
