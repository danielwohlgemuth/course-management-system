import { LightningElement, api, wire } from "lwc";
import {
  getRecord,
  getFieldValue,
  notifyRecordUpdateAvailable
} from "lightning/uiRecordApi";
import { refreshApex } from "@salesforce/apex";
import { NavigationMixin } from "lightning/navigation";
import LightningConfirm from "lightning/confirm";
import STATUS_FIELD from "@salesforce/schema/CoursePlan__c.Status__c";
import SCHEDULING_ERROR_FIELD from "@salesforce/schema/CoursePlan__c.Scheduling_Error__c";
import GENERATED_COURSE_FIELD from "@salesforce/schema/CoursePlan__c.Generated_Course__c";
import lockPlan from "@salesforce/apex/CoursePlanController.lockPlan";
import unlockPlan from "@salesforce/apex/CoursePlanController.unlockPlan";
import getPlanDetails from "@salesforce/apex/CoursePlanController.getPlanDetails";
import { logError } from "c/errorLogger";

const PLAN_FIELDS = [
  STATUS_FIELD,
  SCHEDULING_ERROR_FIELD,
  GENERATED_COURSE_FIELD
];

export const STATUS_DRAFT = "Draft";
export const STATUS_LOCKED = "Locked";
export const UNLOCK_BUTTON_LABEL = "Unlock plan";

// Salesforce Time fields arrive as milliseconds since midnight
function formatTime(ms) {
  const totalMins = Math.floor(ms / 60_000);
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

export default class CoursePlanSchedule extends NavigationMixin(
  LightningElement
) {
  @api recordId;
  actionError = "";
  working = false;
  _detailsResult;

  @wire(getRecord, { recordId: "$recordId", fields: PLAN_FIELDS })
  plan;

  @wire(getPlanDetails, { planId: "$recordId" })
  wiredDetails(result) {
    this._detailsResult = result;
  }

  get status() {
    return getFieldValue(this.plan.data, STATUS_FIELD);
  }

  get schedulingError() {
    return getFieldValue(this.plan.data, SCHEDULING_ERROR_FIELD);
  }

  get generatedCourseId() {
    return getFieldValue(this.plan.data, GENERATED_COURSE_FIELD);
  }

  get isDraft() {
    return this.status === STATUS_DRAFT;
  }

  get isScheduled() {
    return this.status === STATUS_LOCKED && !!this.generatedCourseId;
  }

  get isLockedWithError() {
    return this.status === STATUS_LOCKED && !this.generatedCourseId;
  }

  get unlockButtonLabel() {
    return UNLOCK_BUTTON_LABEL;
  }

  get sessions() {
    const details = this._detailsResult?.data;
    if (!details) {
      return [];
    }
    return details.sessions.map((slot) => ({
      id: slot.Id,
      day: slot.Day_of_Week__c,
      startLabel: formatTime(slot.Start_Time__c),
      endLabel: formatTime(slot.End_Time__c)
    }));
  }

  get enrollmentCount() {
    return this._detailsResult?.data?.enrollmentCount ?? 0;
  }

  async handleLock() {
    this.actionError = "";
    this.working = true;
    try {
      await lockPlan({ planId: this.recordId });
      await this.refreshAll();
    } catch (error) {
      this.actionError = this.extractMessage(error);
      logError("coursePlanSchedule.handleLock", this.actionError, error?.stack);
    } finally {
      this.working = false;
    }
  }

  async handleUnlock() {
    const count = this.enrollmentCount;
    const enrollmentWarning =
      count > 0 ? ` and ${count} student enrollment(s)` : "";
    const confirmed = await LightningConfirm.open({
      message: `Unlocking deletes the generated course and its schedule${enrollmentWarning}. Continue?`,
      label: UNLOCK_BUTTON_LABEL,
      theme: "warning"
    });
    if (!confirmed) {
      return;
    }
    this.actionError = "";
    this.working = true;
    try {
      await unlockPlan({ planId: this.recordId });
      await this.refreshAll();
    } catch (error) {
      this.actionError = this.extractMessage(error);
      logError(
        "coursePlanSchedule.handleUnlock",
        this.actionError,
        error?.stack
      );
    } finally {
      this.working = false;
    }
  }

  handleViewCourse() {
    this[NavigationMixin.Navigate]({
      type: "standard__recordPage",
      attributes: {
        recordId: this.generatedCourseId,
        objectApiName: "Course__c",
        actionName: "view"
      }
    });
  }

  async refreshAll() {
    await notifyRecordUpdateAvailable([{ recordId: this.recordId }]);
    await refreshApex(this._detailsResult);
  }

  extractMessage(error) {
    return (
      error?.body?.message || error?.message || "An unexpected error occurred."
    );
  }
}
