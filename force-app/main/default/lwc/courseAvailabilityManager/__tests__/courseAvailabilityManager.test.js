import { createElement } from "@lwc/engine-dom";
import CourseAvailabilityManager from "c/courseAvailabilityManager";
import { deleteRecord } from "lightning/uiRecordApi";
import LightningConfirm from "lightning/confirm";
// @salesforce/apex/* all map to one shared mock wire adapter (see jest.config.cjs
// and coursePlanSchedule.test.js) -- do NOT jest.mock this path.
import getAvailabilityWindows from "@salesforce/apex/CoursePlanController.getAvailabilityWindows";

jest.mock("c/errorLogger", () => ({ logError: jest.fn() }), { virtual: true });

const PLAN_ID = "a03000000000001AAA";

// Salesforce Time fields arrive as milliseconds since midnight
const MOCK_WINDOWS = [
  {
    Id: "a04000000000001AAA",
    Day_of_Week__c: "Monday",
    Start_Time__c: 32_400_000, // 09:00
    End_Time__c: 36_000_000 // 10:00
  }
];

async function flushPromises() {
  return Promise.resolve();
}

function buildComponent(isDraft = true) {
  const element = createElement("c-course-availability-manager", {
    is: CourseAvailabilityManager
  });
  element.recordId = PLAN_ID;
  element.isDraft = isDraft;
  document.body.appendChild(element);
  return element;
}

function buttonWithLabel(element, label) {
  return [...element.shadowRoot.querySelectorAll("lightning-button")].find(
    (button) => button.label === label
  );
}

describe("c-course-availability-manager", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
  });

  it("shows the empty message and add button for a draft plan with no windows", async () => {
    const element = buildComponent(true);
    getAvailabilityWindows.emit([]);
    await flushPromises();

    expect(
      element.shadowRoot.querySelector('[data-id="availability-table"]')
    ).toBeNull();
    expect(buttonWithLabel(element, "Add Availability Window")).toBeTruthy();
  });

  it("shows the windows table for a draft plan", async () => {
    const element = buildComponent(true);
    getAvailabilityWindows.emit(MOCK_WINDOWS);
    await flushPromises();

    const table = element.shadowRoot.querySelector(
      '[data-id="availability-table"]'
    );
    expect(table).not.toBeNull();
    const cells = table.querySelectorAll("tbody td");
    expect(cells[0].textContent).toBe("Monday");
    expect(cells[1].textContent).toBe("9:00 AM");
    expect(cells[2].textContent).toBe("10:00 AM");
  });

  it("shows the add form with a hidden plan lookup when Add is clicked", async () => {
    const element = buildComponent(true);
    getAvailabilityWindows.emit([]);
    await flushPromises();

    buttonWithLabel(element, "Add Availability Window").click();
    await flushPromises();

    const inputFields = [
      ...element.shadowRoot.querySelectorAll("lightning-input-field")
    ];
    const hiddenPlanField = inputFields.find(
      (field) => field.fieldName === "Course_Plan__c"
    );
    expect(hiddenPlanField).toBeTruthy();
    expect(hiddenPlanField.value).toBe(PLAN_ID);
    expect(buttonWithLabel(element, "Add Availability Window")).toBeFalsy();
  });

  it("hides add/edit/delete affordances and shows the locked help text once the plan is not a draft", async () => {
    const element = buildComponent(false);
    getAvailabilityWindows.emit(MOCK_WINDOWS);
    await flushPromises();

    expect(buttonWithLabel(element, "Add Availability Window")).toBeFalsy();
    expect(buttonWithLabel(element, "Edit")).toBeFalsy();
    expect(buttonWithLabel(element, "Delete")).toBeFalsy();
    expect(element.shadowRoot.textContent).toContain(
      "Availability windows can only be changed while the plan is in Draft status."
    );
  });

  it("does not delete when the confirmation is declined", async () => {
    jest.spyOn(LightningConfirm, "open").mockResolvedValue(false);
    const element = buildComponent(true);
    getAvailabilityWindows.emit(MOCK_WINDOWS);
    await flushPromises();

    buttonWithLabel(element, "Delete").click();
    await flushPromises();

    expect(deleteRecord).not.toHaveBeenCalled();
  });

  it("deletes the window after the confirmation is accepted", async () => {
    jest.spyOn(LightningConfirm, "open").mockResolvedValue(true);
    const element = buildComponent(true);
    getAvailabilityWindows.emit(MOCK_WINDOWS);
    await flushPromises();

    buttonWithLabel(element, "Delete").click();
    await flushPromises();

    expect(deleteRecord).toHaveBeenCalledWith(MOCK_WINDOWS[0].Id);
  });
});
