import { LightningElement, api, wire } from "lwc";
import { getRecord, getFieldValue } from "lightning/uiRecordApi";
import { logError } from "c/errorLogger";
import STATUS_FIELD from "@salesforce/schema/CoursePlan__c.Status__c";
import EDIT_SECTION_TITLE from "@salesforce/label/c.CoursePlanDetail_EditSectionTitle";
import LOCKED_HELP_TEXT from "@salesforce/label/c.CoursePlanDetail_LockedHelpText";
import SAVE_BUTTON_LABEL from "@salesforce/label/c.CoursePlanDetail_SaveButtonLabel";
import BACK_BUTTON_LABEL from "@salesforce/label/c.CoursePlanManager_BackButtonLabel";
import UNEXPECTED_ERROR_MESSAGE from "@salesforce/label/c.CoursePlanManager_UnexpectedErrorMessage";

const STATUS_DRAFT = "Draft";

export default class CoursePlanDetail extends LightningElement {
  @api recordId;

  actionError = "";

  @wire(getRecord, { recordId: "$recordId", fields: [STATUS_FIELD] })
  plan;

  get status() {
    return getFieldValue(this.plan.data, STATUS_FIELD);
  }

  get isDraft() {
    return this.status === STATUS_DRAFT;
  }

  get editSectionTitle() {
    return EDIT_SECTION_TITLE;
  }

  get lockedHelpText() {
    return LOCKED_HELP_TEXT;
  }

  get saveButtonLabel() {
    return SAVE_BUTTON_LABEL;
  }

  get backButtonLabel() {
    return BACK_BUTTON_LABEL;
  }

  handleBack() {
    this.dispatchEvent(new CustomEvent("back"));
  }

  handleSaveSuccess() {
    this.actionError = "";
  }

  handleError(event) {
    this.actionError = this.extractMessage(event.detail);
    logError("coursePlanDetail.handleError", this.actionError, null);
  }

  extractMessage(error) {
    return (
      error?.body?.message ||
      error?.detail?.message ||
      error?.message ||
      UNEXPECTED_ERROR_MESSAGE
    );
  }
}
