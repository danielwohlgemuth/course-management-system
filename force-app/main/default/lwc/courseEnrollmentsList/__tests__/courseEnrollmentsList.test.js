import { createElement } from "@lwc/engine-dom";
import CourseEnrollmentsList from "c/courseEnrollmentsList";
import getEnrollmentsAdapter from "@salesforce/apex/CoursePdfReportController.getEnrollments";

jest.mock("c/errorLogger", () => ({ logError: jest.fn() }), {
  virtual: true
});

const MOCK_ENROLLMENTS = [
  { Id: "a02000000000001", Student__r: { Name: "Alice Adams" } },
  { Id: "a02000000000002", Student__r: { Name: "Bob Baker" } }
];

function setup() {
  const element = createElement("c-course-enrollments-list", {
    is: CourseEnrollmentsList
  });
  element.recordId = "a00000000000001";
  document.body.appendChild(element);
  return element;
}

describe("c-course-enrollments-list", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
  });

  it("renders a row per enrollment when many are returned", async () => {
    const element = setup();
    getEnrollmentsAdapter.emit(MOCK_ENROLLMENTS);
    await Promise.resolve();

    const rows = element.shadowRoot.querySelectorAll(
      '[data-id="enrollment-row"]'
    );
    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toBe("Alice Adams");
  });

  it("renders a single row when one enrollment is returned", async () => {
    const element = setup();
    getEnrollmentsAdapter.emit([MOCK_ENROLLMENTS[0]]);
    await Promise.resolve();

    const rows = element.shadowRoot.querySelectorAll(
      '[data-id="enrollment-row"]'
    );
    expect(rows.length).toBe(1);
  });

  it("renders the empty message when no enrollments are returned", async () => {
    const element = setup();
    getEnrollmentsAdapter.emit([]);
    await Promise.resolve();

    expect(
      element.shadowRoot.querySelector('[data-id="empty-message"]').textContent
    ).toBe("No students are enrolled in this course yet.");
    expect(
      element.shadowRoot.querySelector('[data-id="enrollments-table"]')
    ).toBeNull();
  });

  it("renders an error message when the wire adapter errors", async () => {
    const element = setup();
    getEnrollmentsAdapter.error();
    await Promise.resolve();

    expect(
      element.shadowRoot.querySelector('[data-id="error-message"]').textContent
    ).toBe("Failed to load enrollments. Please refresh.");
  });
});
