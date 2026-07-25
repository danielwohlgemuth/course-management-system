import { LightningElement, api } from "lwc";
import BUTTON_LABEL from "@salesforce/label/c.CourseDownloadPdfReport_ButtonLabel";

export default class CourseDownloadPdfReport extends LightningElement {
  @api recordId;

  buttonLabel = BUTTON_LABEL;

  handleClick() {
    window.open(
      `/sfsites/c/apex/CoursePdfReport?id=${this.recordId}`,
      "_blank"
    );
  }
}
