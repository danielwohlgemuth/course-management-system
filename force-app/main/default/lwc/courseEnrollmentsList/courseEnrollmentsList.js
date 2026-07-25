import { LightningElement, api, wire } from "lwc";
import getEnrollments from "@salesforce/apex/CoursePdfReportController.getEnrollments";
import { logError } from "c/errorLogger";
import TITLE from "@salesforce/label/c.CourseEnrollmentsList_Title";
import STUDENT_COLUMN_HEADER from "@salesforce/label/c.CourseEnrollmentsList_StudentColumnHeader";
import EMPTY_MESSAGE from "@salesforce/label/c.CourseEnrollmentsList_EmptyMessage";
import ERROR_MESSAGE from "@salesforce/label/c.CourseEnrollmentsList_ErrorMessage";

export default class CourseEnrollmentsList extends LightningElement {
  @api recordId;

  error = false;
  _enrollments;

  @wire(getEnrollments, { courseId: "$recordId" })
  wiredEnrollments({ data, error }) {
    if (data) {
      this.error = false;
      this._enrollments = data;
    } else if (error) {
      this.error = true;
      this._enrollments = undefined;
      logError(
        "courseEnrollmentsList",
        "wiredEnrollments: " + JSON.stringify(error),
        this.recordId
      );
    }
  }

  get title() {
    return TITLE;
  }

  get studentColumnHeader() {
    return STUDENT_COLUMN_HEADER;
  }

  get emptyMessage() {
    return EMPTY_MESSAGE;
  }

  get errorMessage() {
    return ERROR_MESSAGE;
  }

  get enrollments() {
    if (!this._enrollments) {
      return [];
    }
    return this._enrollments.map((enrollment) => ({
      id: enrollment.Id,
      studentName: enrollment.Student__r.Name
    }));
  }

  get hasEnrollments() {
    return this.enrollments.length > 0;
  }

  get isEmpty() {
    return !this.error && !this.hasEnrollments;
  }
}
