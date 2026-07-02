import { LightningElement, api } from 'lwc';

export default class CourseDownloadPdfReport extends LightningElement {
    @api recordId;

    handleClick() {
        window.open(`/sfsites/c/apex/CoursePdfReport?id=${this.recordId}`, '_blank');
    }
}
