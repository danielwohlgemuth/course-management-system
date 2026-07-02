import { createElement } from '@lwc/engine-dom';
import CourseDownloadPdfReport from 'c/courseDownloadPdfReport';

describe('c-course-download-pdf-report', () => {
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        jest.restoreAllMocks();
    });

    it('opens the Visualforce PDF page for the current record when clicked', () => {
        const openSpy = jest.spyOn(window, 'open').mockImplementation(() => {});
        const element = createElement('c-course-download-pdf-report', {
            is: CourseDownloadPdfReport
        });
        element.recordId = 'a00000000000001';
        document.body.appendChild(element);

        const button = element.shadowRoot.querySelector('lightning-button');
        button.click();

        expect(openSpy).toHaveBeenCalledWith('/sfsites/c/apex/CoursePdfReport?id=a00000000000001', '_blank');
    });
});
