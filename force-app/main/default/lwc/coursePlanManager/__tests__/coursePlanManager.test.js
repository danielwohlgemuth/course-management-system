import { createElement } from "@lwc/engine-dom";
import CoursePlanManager from "c/coursePlanManager";
// @salesforce/apex/* all map to one shared mock wire adapter (see jest.config.cjs
// and coursePlanSchedule.test.js) -- do NOT jest.mock this path.
import getMyPlans from "@salesforce/apex/CoursePlanController.getMyPlans";

jest.mock("c/errorLogger", () => ({ logError: jest.fn() }), { virtual: true });

const MOCK_PLANS = [
  {
    Id: "a03000000000001AAA",
    Name: "CPL-0001",
    Course_Name__c: "Biology 201",
    Classroom__c: "Room 101",
    Semester__c: "2026 S1",
    Status__c: "Draft"
  }
];

async function flushPromises() {
  return Promise.resolve();
}

function buildComponent() {
  const element = createElement("c-course-plan-manager", {
    is: CoursePlanManager
  });
  document.body.appendChild(element);
  return element;
}

function buttonWithLabel(element, label) {
  return [...element.shadowRoot.querySelectorAll("lightning-button")].find(
    (button) => button.label === label
  );
}

describe("c-course-plan-manager", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
  });

  it("shows the empty message when the instructor has no plans", async () => {
    const element = buildComponent();
    getMyPlans.emit([]);
    await flushPromises();

    expect(
      element.shadowRoot.querySelector('[data-id="plan-table"]')
    ).toBeNull();
    expect(element.shadowRoot.textContent).toContain(
      "You don't have any course plans yet."
    );
  });

  it("shows a row per plan", async () => {
    const element = buildComponent();
    getMyPlans.emit(MOCK_PLANS);
    await flushPromises();

    const table = element.shadowRoot.querySelector('[data-id="plan-table"]');
    expect(table).not.toBeNull();
    const cells = table.querySelectorAll("tbody td");
    expect(cells[0].textContent).toBe("CPL-0001");
    expect(cells[1].textContent).toBe("Biology 201");
    expect(cells[2].textContent).toBe("Room 101");
    expect(cells[3].textContent).toBe("2026 S1");
    expect(cells[4].textContent).toBe("Draft");
  });

  it("shows the create form when New Course Plan is clicked and hides it on cancel", async () => {
    const element = buildComponent();
    getMyPlans.emit([]);
    await flushPromises();

    buttonWithLabel(element, "New Course Plan").click();
    await flushPromises();
    expect(
      element.shadowRoot.querySelector("lightning-record-edit-form")
    ).not.toBeNull();

    buttonWithLabel(element, "Cancel").click();
    await flushPromises();
    expect(
      element.shadowRoot.querySelector("lightning-record-edit-form")
    ).toBeNull();
    expect(buttonWithLabel(element, "New Course Plan")).toBeTruthy();
  });

  it("shows the plan detail component for the selected plan and hides the list", async () => {
    const element = buildComponent();
    getMyPlans.emit(MOCK_PLANS);
    await flushPromises();

    buttonWithLabel(element, "View").click();
    await flushPromises();

    expect(
      element.shadowRoot.querySelector('[data-id="plan-table"]')
    ).toBeNull();
    const detail = element.shadowRoot.querySelector("c-course-plan-detail");
    expect(detail).not.toBeNull();
    expect(detail.recordId).toBe(MOCK_PLANS[0].Id);
  });

  it("returns to the list when the detail component dispatches back", async () => {
    const element = buildComponent();
    getMyPlans.emit(MOCK_PLANS);
    await flushPromises();

    buttonWithLabel(element, "View").click();
    await flushPromises();

    element.shadowRoot
      .querySelector("c-course-plan-detail")
      .dispatchEvent(new CustomEvent("back"));
    await flushPromises();

    expect(
      element.shadowRoot.querySelector('[data-id="plan-table"]')
    ).not.toBeNull();
  });
});
