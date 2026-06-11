import { createElement } from '@lwc/engine-dom';
import CourseCalendar from 'c/courseCalendar';
import getTimeSlotsAdapter from '@salesforce/apex/CourseCalendarController.getTimeSlots';
import getConfigAdapter from '@salesforce/apex/CourseCalendarController.getConfig';
import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';

// Salesforce Time fields arrive as milliseconds since midnight
const MOCK_SLOTS = [
    {
        Id: 'a01000000000001',
        Day_of_Week__c: 'Monday',
        Start_Time__c: 32_400_000, // 09:00
        End_Time__c: 37_800_000,   // 10:30
        Course__c: 'a00000000000001',
        Course__r: {
            Name: 'CRS-0001',
            Course_Name__c: 'Algebra I',
            Instructor_User__r: { Name: 'Smith' },
        },
    },
];

const MOCK_CONFIG = {
    Grid_Start_Hour__c: 8,
    Grid_End_Hour__c: 18,
    Palette__c: '#3498db,#2ecc71,#e74c3c',
    Height_Pixels__c: 800,
};

const MOCK_OBJECT_INFO = {
    defaultRecordTypeId: '012000000000000AAA',
};

const MOCK_PICKLIST_VALUES = {
    values: [
        { value: 'Monday', label: 'Monday' },
        { value: 'Tuesday', label: 'Tuesday' },
        { value: 'Wednesday', label: 'Wednesday' },
        { value: 'Thursday', label: 'Thursday' },
        { value: 'Friday', label: 'Friday' },
        { value: 'Saturday', label: 'Saturday' },
        { value: 'Sunday', label: 'Sunday' },
    ],
};

async function setupCalendar() {
    const el = createElement('c-course-calendar', { is: CourseCalendar });
    document.body.appendChild(el);
    getObjectInfo.emit(MOCK_OBJECT_INFO);
    getPicklistValues.emit(MOCK_PICKLIST_VALUES);
    getConfigAdapter.emit(MOCK_CONFIG);
    getTimeSlotsAdapter.emit(MOCK_SLOTS);
    await Promise.resolve();
    return el;
}

describe('c-course-calendar', () => {
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('renders seven day column headers', async () => {
        const el = await setupCalendar();
        const headers = el.shadowRoot.querySelectorAll('.day-header');
        expect(headers.length).toBe(7);
        expect(headers[0].textContent).toBe('Monday');
    });

    it('renders a slot card with correct course name and instructor', async () => {
        const el = await setupCalendar();
        const cards = el.shadowRoot.querySelectorAll('.slot-card');
        expect(cards.length).toBe(1);
        expect(cards[0].querySelector('.slot-course').textContent).toBe('Algebra I');
        expect(cards[0].querySelector('.slot-instructor').textContent).toBe('Smith');
    });

    it('shows an error message when wire returns an error', async () => {
        const el = createElement('c-course-calendar', { is: CourseCalendar });
        document.body.appendChild(el);
        getTimeSlotsAdapter.error();
        await Promise.resolve();
        const errEl = el.shadowRoot.querySelector('.error-message');
        expect(errEl).not.toBeNull();
    });
});
