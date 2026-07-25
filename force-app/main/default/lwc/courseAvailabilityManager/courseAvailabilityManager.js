import { LightningElement, api, wire } from "lwc";
import { deleteRecord } from "lightning/uiRecordApi";
import { refreshApex } from "@salesforce/apex";
import LightningConfirm from "lightning/confirm";
import getAvailabilityWindows from "@salesforce/apex/CoursePlanController.getAvailabilityWindows";
import { logError } from "c/errorLogger";
import TITLE from "@salesforce/label/c.CourseAvailabilityManager_Title";
import ADD_BUTTON_LABEL from "@salesforce/label/c.CourseAvailabilityManager_AddButtonLabel";
import EMPTY_MESSAGE from "@salesforce/label/c.CourseAvailabilityManager_EmptyMessage";
import LOCKED_HELP_TEXT from "@salesforce/label/c.CourseAvailabilityManager_LockedHelpText";
import DAY_COLUMN_HEADER from "@salesforce/label/c.CourseAvailabilityManager_DayColumnHeader";
import START_COLUMN_HEADER from "@salesforce/label/c.CourseAvailabilityManager_StartColumnHeader";
import END_COLUMN_HEADER from "@salesforce/label/c.CourseAvailabilityManager_EndColumnHeader";
import EDIT_BUTTON_LABEL from "@salesforce/label/c.CourseAvailabilityManager_EditButtonLabel";
import DELETE_BUTTON_LABEL from "@salesforce/label/c.CourseAvailabilityManager_DeleteButtonLabel";
import CANCEL_BUTTON_LABEL from "@salesforce/label/c.CourseAvailabilityManager_CancelButtonLabel";
import SAVE_BUTTON_LABEL from "@salesforce/label/c.CourseAvailabilityManager_SaveButtonLabel";
import DELETE_CONFIRM_MESSAGE from "@salesforce/label/c.CourseAvailabilityManager_DeleteConfirmMessage";
import UNEXPECTED_ERROR_MESSAGE from "@salesforce/label/c.CourseAvailabilityManager_UnexpectedErrorMessage";

// Salesforce Time fields arrive as milliseconds since midnight
function formatTime(ms) {
  const totalMins = Math.floor(ms / 60_000);
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

export default class CourseAvailabilityManager extends LightningElement {
  @api recordId;
  @api isDraft = false;

  showAddForm = false;
  editingId;
  actionError = "";
  _windowsResult;

  @wire(getAvailabilityWindows, { planId: "$recordId" })
  wiredWindows(result) {
    this._windowsResult = result;
  }

  get title() {
    return TITLE;
  }

  get addButtonLabel() {
    return ADD_BUTTON_LABEL;
  }

  get emptyMessage() {
    return EMPTY_MESSAGE;
  }

  get lockedHelpText() {
    return LOCKED_HELP_TEXT;
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

  get editButtonLabel() {
    return EDIT_BUTTON_LABEL;
  }

  get deleteButtonLabel() {
    return DELETE_BUTTON_LABEL;
  }

  get cancelButtonLabel() {
    return CANCEL_BUTTON_LABEL;
  }

  get saveButtonLabel() {
    return SAVE_BUTTON_LABEL;
  }

  get windows() {
    const data = this._windowsResult?.data;
    if (!data) {
      return [];
    }
    return data.map((window) => ({
      id: window.Id,
      day: window.Day_of_Week__c,
      startLabel: formatTime(window.Start_Time__c),
      endLabel: formatTime(window.End_Time__c),
      isEditing: window.Id === this.editingId
    }));
  }

  get hasWindows() {
    return this.windows.length > 0;
  }

  get isAddingOrEditing() {
    return this.showAddForm || !!this.editingId;
  }

  handleAddClick() {
    this.editingId = undefined;
    this.showAddForm = true;
  }

  handleEditClick(event) {
    this.showAddForm = false;
    this.editingId = event.target.dataset.id;
  }

  handleCancel() {
    this.showAddForm = false;
    this.editingId = undefined;
  }

  async handleDelete(event) {
    // Capture the row id before the await below: LWC's synthetic shadow
    // retargeting only resolves event.target correctly during the
    // synchronous dispatch, not after an async gap.
    const windowId = event.target.dataset.id;
    const confirmed = await LightningConfirm.open({
      message: DELETE_CONFIRM_MESSAGE,
      label: DELETE_BUTTON_LABEL,
      theme: "warning"
    });
    if (!confirmed) {
      return;
    }
    this.actionError = "";
    try {
      await deleteRecord(windowId);
      await refreshApex(this._windowsResult);
    } catch (error) {
      this.actionError = this.extractMessage(error);
      logError(
        "courseAvailabilityManager.handleDelete",
        this.actionError,
        error?.stack
      );
    }
  }

  async handleSuccess() {
    this.showAddForm = false;
    this.editingId = undefined;
    this.actionError = "";
    await refreshApex(this._windowsResult);
  }

  handleError(event) {
    this.actionError = this.extractMessage(event.detail);
    logError("courseAvailabilityManager.handleError", this.actionError, null);
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
