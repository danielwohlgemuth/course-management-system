import { LightningElement, wire } from "lwc";
import { refreshApex } from "@salesforce/apex";
import getMyPlans from "@salesforce/apex/CoursePlanController.getMyPlans";
import { logError } from "c/errorLogger";
import TITLE from "@salesforce/label/c.CoursePlanManager_Title";
import NEW_BUTTON_LABEL from "@salesforce/label/c.CoursePlanManager_NewButtonLabel";
import EMPTY_MESSAGE from "@salesforce/label/c.CoursePlanManager_EmptyMessage";
import NAME_COLUMN_HEADER from "@salesforce/label/c.CoursePlanManager_NameColumnHeader";
import COURSE_NAME_COLUMN_HEADER from "@salesforce/label/c.CoursePlanManager_CourseNameColumnHeader";
import CLASSROOM_COLUMN_HEADER from "@salesforce/label/c.CoursePlanManager_ClassroomColumnHeader";
import SEMESTER_COLUMN_HEADER from "@salesforce/label/c.CoursePlanManager_SemesterColumnHeader";
import STATUS_COLUMN_HEADER from "@salesforce/label/c.CoursePlanManager_StatusColumnHeader";
import SELECT_BUTTON_LABEL from "@salesforce/label/c.CoursePlanManager_SelectButtonLabel";
import CREATE_SECTION_TITLE from "@salesforce/label/c.CoursePlanManager_CreateSectionTitle";
import CANCEL_BUTTON_LABEL from "@salesforce/label/c.CoursePlanManager_CancelButtonLabel";
import SAVE_BUTTON_LABEL from "@salesforce/label/c.CoursePlanManager_SaveButtonLabel";
import UNEXPECTED_ERROR_MESSAGE from "@salesforce/label/c.CoursePlanManager_UnexpectedErrorMessage";

export default class CoursePlanManager extends LightningElement {
  selectedPlanId;
  showCreateForm = false;
  actionError = "";
  _plansResult;

  @wire(getMyPlans)
  wiredPlans(result) {
    this._plansResult = result;
  }

  get title() {
    return TITLE;
  }

  get newButtonLabel() {
    return NEW_BUTTON_LABEL;
  }

  get emptyMessage() {
    return EMPTY_MESSAGE;
  }

  get nameColumnHeader() {
    return NAME_COLUMN_HEADER;
  }

  get courseNameColumnHeader() {
    return COURSE_NAME_COLUMN_HEADER;
  }

  get classroomColumnHeader() {
    return CLASSROOM_COLUMN_HEADER;
  }

  get semesterColumnHeader() {
    return SEMESTER_COLUMN_HEADER;
  }

  get statusColumnHeader() {
    return STATUS_COLUMN_HEADER;
  }

  get selectButtonLabel() {
    return SELECT_BUTTON_LABEL;
  }

  get createSectionTitle() {
    return CREATE_SECTION_TITLE;
  }

  get cancelButtonLabel() {
    return CANCEL_BUTTON_LABEL;
  }

  get saveButtonLabel() {
    return SAVE_BUTTON_LABEL;
  }

  get plans() {
    const data = this._plansResult?.data;
    if (!data) {
      return [];
    }
    return data.map((plan) => ({
      id: plan.Id,
      name: plan.Name,
      courseName: plan.Course_Name__c,
      classroom: plan.Classroom__c,
      semester: plan.Semester__c,
      status: plan.Status__c
    }));
  }

  get hasPlans() {
    return this.plans.length > 0;
  }

  get showList() {
    return !this.selectedPlanId;
  }

  handleNewClick() {
    this.actionError = "";
    this.showCreateForm = true;
  }

  handleCancelCreate() {
    this.showCreateForm = false;
  }

  handleSelect(event) {
    this.selectedPlanId = event.target.dataset.id;
  }

  handleBack() {
    this.selectedPlanId = undefined;
    refreshApex(this._plansResult);
  }

  async handleCreateSuccess(event) {
    this.showCreateForm = false;
    this.actionError = "";
    await refreshApex(this._plansResult);
    this.selectedPlanId = event.detail.id;
  }

  handleError(event) {
    this.actionError = this.extractMessage(event.detail);
    logError("coursePlanManager.handleError", this.actionError, null);
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
