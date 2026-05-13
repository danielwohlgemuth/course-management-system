import { createElement } from '@lwc/engine-dom';
import CourseCalendar from 'c/courseCalendar';
import getTimeSlotsAdapter from '@salesforce/apex/CourseCalendarController.getTimeSlots';

// Salesforce Time fields arrive as milliseconds since midnight
const MOCK_DATA = [
    {
        Id: 'a01000000000001',
        Day_of_Week__c: 'Monday',
        Start_Time__c: 32_400_000, // 09:00
        End_Time__c: 37_800_000,   // 10:30
        Course__c: 'a00000000000001',
        Course__r: {
            Name: 'CRS-0001',
            Course_Name__c: 'Algebra I',
            Instructor__c: 'Smith',
        },
    },
];

describe('c-course-calendar', () => {
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('renders seven day column headers', async () => {
        const el = createElement('c-course-calendar', { is: CourseCalendar });
        document.body.appendChild(el);
        getTimeSlotsAdapter.emit(MOCK_DATA);
        await Promise.resolve();
        const headers = el.shadowRoot.querySelectorAll('.day-header');
        expect(headers.length).toBe(7);
        expect(headers[0].textContent).toBe('Monday');
    });

    it('renders a slot card with correct course name and instructor', async () => {
        const el = createElement('c-course-calendar', { is: CourseCalendar });
        document.body.appendChild(el);
        getTimeSlotsAdapter.emit(MOCK_DATA);
        await Promise.resolve();
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