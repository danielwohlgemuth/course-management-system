import { createElement } from "@lwc/engine-dom";
import CoursePlanDetail from "c/coursePlanDetail";
import { getRecord } from "lightning/uiRecordApi";

jest.mock("c/errorLogger", () => ({ logError: jest.fn() }), { virtual: true });

const PLAN_ID = "a03000000000001AAA";

function planRecord(status) {
  return {
    fields: {
      Status__c: { value: status }
    }
  };
}

async function flushPromises() {
  return Promise.resolve();
}

function buildComponent() {
  const element = createElement("c-course-plan-detail", {
    is: CoursePlanDetail
  });
  element.recordId = PLAN_ID;
  document.body.appendChild(element);
  return element;
}

describe("c-course-plan-detail", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
  });

  it("shows an editable form for a draft plan", async () => {
    const element = buildComponent();
    getRecord.emit(planRecord("Draft"));
    await flushPromises();

    expect(
      element.shadowRoot.querySelector("lightning-record-edit-form")
    ).not.toBeNull();
    expect(
      element.shadowRoot.querySelector("lightning-record-view-form")
    ).toBeNull();
  });

  it("shows a read-only view and locked help text for a locked plan", async () => {
    const element = buildComponent();
    getRecord.emit(planRecord("Locked"));
    await flushPromises();

    expect(
      element.shadowRoot.querySelector("lightning-record-view-form")
    ).not.toBeNull();
    expect(
      element.shadowRoot.querySelector("lightning-record-edit-form")
    ).toBeNull();
    expect(element.shadowRoot.textContent).toContain(
      "This plan is locked. Unlock it below to make changes."
    );
  });

  it("passes the record id and draft status down to the availability manager", async () => {
    const element = buildComponent();
    getRecord.emit(planRecord("Draft"));
    await flushPromises();

    const availabilityManager = element.shadowRoot.querySelector(
      "c-course-availability-manager"
    );
    expect(availabilityManager.recordId).toBe(PLAN_ID);
    expect(availabilityManager.isDraft).toBe(true);
  });

  it("embeds the course plan schedule component for the same record", async () => {
    const element = buildComponent();
    getRecord.emit(planRecord("Draft"));
    await flushPromises();

    const schedule = element.shadowRoot.querySelector("c-course-plan-schedule");
    expect(schedule).not.toBeNull();
    expect(schedule.recordId).toBe(PLAN_ID);
  });

  it("dispatches a back event when the back button is clicked", async () => {
    const element = buildComponent();
    getRecord.emit(planRecord("Draft"));
    await flushPromises();

    const backHandler = jest.fn();
    element.addEventListener("back", backHandler);

    element.shadowRoot.querySelector("lightning-button").click();

    expect(backHandler).toHaveBeenCalled();
  });
});
