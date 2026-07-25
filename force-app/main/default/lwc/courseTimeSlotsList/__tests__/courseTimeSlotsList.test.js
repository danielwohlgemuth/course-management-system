import { createElement } from "@lwc/engine-dom";
import CourseTimeSlotsList from "c/courseTimeSlotsList";
import getTimeSlotsForCourseAdapter from "@salesforce/apex/CourseCalendarController.getTimeSlotsForCourse";

jest.mock("c/errorLogger", () => ({ logError: jest.fn() }), {
  virtual: true
});

// Salesforce Time fields arrive as milliseconds since midnight
const MOCK_SLOTS = [
  {
    Id: "a01000000000001",
    Day_of_Week__c: "Monday",
    Start_Time__c: 32_400_000, // 09:00
    End_Time__c: 37_800_000 // 10:30
  },
  {
    Id: "a01000000000002",
    Day_of_Week__c: "Wednesday",
    Start_Time__c: 32_400_000,
    End_Time__c: 37_800_000
  }
];

function setup() {
  const element = createElement("c-course-time-slots-list", {
    is: CourseTimeSlotsList
  });
  element.recordId = "a00000000000001";
  document.body.appendChild(element);
  return element;
}

describe("c-course-time-slots-list", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
  });

  it("renders a row per time slot when many are returned", async () => {
    const element = setup();
    getTimeSlotsForCourseAdapter.emit(MOCK_SLOTS);
    await Promise.resolve();

    const rows = element.shadowRoot.querySelectorAll(
      '[data-id="time-slot-row"]'
    );
    expect(rows.length).toBe(2);
    expect(
      element.shadowRoot.querySelector('[data-id="empty-message"]')
    ).toBeNull();
  });

  it("renders a single row when one time slot is returned", async () => {
    const element = setup();
    getTimeSlotsForCourseAdapter.emit([MOCK_SLOTS[0]]);
    await Promise.resolve();

    const rows = element.shadowRoot.querySelectorAll(
      '[data-id="time-slot-row"]'
    );
    expect(rows.length).toBe(1);
  });

  it("renders the empty message when no time slots are returned", async () => {
    const element = setup();
    getTimeSlotsForCourseAdapter.emit([]);
    await Promise.resolve();

    expect(
      element.shadowRoot.querySelector('[data-id="empty-message"]').textContent
    ).toBe("No time slots have been scheduled for this course yet.");
    expect(
      element.shadowRoot.querySelector('[data-id="time-slots-table"]')
    ).toBeNull();
  });

  it("renders an error message when the wire adapter errors", async () => {
    const element = setup();
    getTimeSlotsForCourseAdapter.error();
    await Promise.resolve();

    expect(
      element.shadowRoot.querySelector('[data-id="error-message"]').textContent
    ).toBe("Failed to load time slots. Please refresh.");
  });
});
