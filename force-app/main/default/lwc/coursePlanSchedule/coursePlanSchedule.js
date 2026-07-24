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
import DRAFT_HELP_TEXT from "@salesforce/label/c.CoursePlanSchedule_DraftHelpText";
import SCHEDULED_HELP_TEXT from "@salesforce/label/c.CoursePlanSchedule_ScheduledHelpText";
import LOCKED_ERROR_HELP_TEXT from "@salesforce/label/c.CoursePlanSchedule_LockedErrorHelpText";
import LOCK_BUTTON_LABEL_VALUE from "@salesforce/label/c.CoursePlanSchedule_LockButtonLabel";
import UNLOCK_BUTTON_LABEL_VALUE from "@salesforce/label/c.CoursePlanSchedule_UnlockButtonLabel";
import UNLOCK_CONFIRM_MESSAGE from "@salesforce/label/c.CoursePlanSchedule_UnlockConfirmMessage";
import UNLOCK_CONFIRM_ENROLLMENT_WARNING from "@salesforce/label/c.CoursePlanSchedule_UnlockConfirmEnrollmentWarning";

const PLAN_FIELDS = [
  STATUS_FIELD,
  SCHEDULING_ERROR_FIELD,
  GENERATED_COURSE_FIELD
];

export const STATUS_DRAFT = "Draft";
export const STATUS_LOCKED = "Locked";
export const UNLOCK_BUTTON_LABEL = UNLOCK_BUTTON_LABEL_VALUE;

// Salesforce Time fields arrive as milliseconds since midnight
function formatTime(ms) {
  const totalMins = Math.floor(ms / 60_000);
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

function formatLabel(label, values) {
  return values.reduce(
    (text, value, index) => text.replace(`{${index}}`, value),
    label
  );
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

  get lockButtonLabel() {
    return LOCK_BUTTON_LABEL_VALUE;
  }

  get draftHelpText() {
    return DRAFT_HELP_TEXT;
  }

  get scheduledHelpText() {
    return SCHEDULED_HELP_TEXT;
  }

  get lockedErrorHelpText() {
    return LOCKED_ERROR_HELP_TEXT;
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
      count > 0 ? formatLabel(UNLOCK_CONFIRM_ENROLLMENT_WARNING, [count]) : "";
    const confirmed = await LightningConfirm.open({
      message: formatLabel(UNLOCK_CONFIRM_MESSAGE, [enrollmentWarning]),
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
