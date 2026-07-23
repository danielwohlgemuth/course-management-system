import { createElement } from "@lwc/engine-dom";
import CoursePlanSchedule, {
  STATUS_DRAFT,
  STATUS_LOCKED,
  UNLOCK_BUTTON_LABEL
} from "c/coursePlanSchedule";
import { getRecord } from "lightning/uiRecordApi";
import LightningConfirm from "lightning/confirm";
// The project maps every @salesforce/apex/* module to one shared mock
// (see jest.config.cjs), so these three imports are the same jest.fn-backed
// wire adapter: `.emit(...)` feeds the @wire, direct calls are the imperative
// Apex invocations. Do NOT jest.mock these paths — that would replace the
// shared module and break the wire adapter.
import getPlanDetails from "@salesforce/apex/CoursePlanController.getPlanDetails";
import lockPlan from "@salesforce/apex/CoursePlanController.lockPlan";
import unlockPlan from "@salesforce/apex/CoursePlanController.unlockPlan";

jest.mock("c/errorLogger", () => ({ logError: jest.fn() }), { virtual: true });

const PLAN_ID = "a03000000000001AAA";
const COURSE_ID = "a00000000000001AAA";

function planRecord(status, schedulingError, generatedCourseId) {
  return {
    fields: {
      Status__c: { value: status },
      Scheduling_Error__c: { value: schedulingError },
      Generated_Course__c: { value: generatedCourseId }
    }
  };
}

// Salesforce Time fields arrive as milliseconds since midnight
const MOCK_DETAILS = {
  sessions: [
    {
      Id: "a02000000000001AAA",
      Day_of_Week__c: "Monday",
      Start_Time__c: 32_400_000, // 09:00
      End_Time__c: 36_000_000 // 10:00
    }
  ],
  enrollmentCount: 2
};

async function flushPromises() {
  return Promise.resolve();
}

function buildComponent() {
  const element = createElement("c-course-plan-schedule", {
    is: CoursePlanSchedule
  });
  element.recordId = PLAN_ID;
  document.body.appendChild(element);
  return element;
}

function unlockButtonOf(element) {
  return [...element.shadowRoot.querySelectorAll("lightning-button")].find(
    (button) => button.label === UNLOCK_BUTTON_LABEL
  );
}

describe("c-course-plan-schedule", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
  });

  it("shows the lock button for a draft plan", async () => {
    const element = buildComponent();
    getRecord.emit(planRecord(STATUS_DRAFT, null, null));
    getPlanDetails.emit({ sessions: [], enrollmentCount: 0 });
    await flushPromises();

    const buttons = element.shadowRoot.querySelectorAll("lightning-button");
    expect(buttons).toHaveLength(1);
    expect(buttons[0].label).toBe("Lock plan");
    expect(
      element.shadowRoot.querySelector('[data-id="schedule-table"]')
    ).toBeNull();
  });

  it("shows the schedule table and unlock button for a locked, scheduled plan", async () => {
    const element = buildComponent();
    getRecord.emit(planRecord(STATUS_LOCKED, null, COURSE_ID));
    getPlanDetails.emit(MOCK_DETAILS);
    await flushPromises();

    const table = element.shadowRoot.querySelector(
      '[data-id="schedule-table"]'
    );
    expect(table).not.toBeNull();
    const cells = table.querySelectorAll("tbody td");
    expect(cells[0].textContent).toBe("Monday");
    expect(cells[1].textContent).toBe("9:00 AM");
    expect(cells[2].textContent).toBe("10:00 AM");

    const labels = [
      ...element.shadowRoot.querySelectorAll("lightning-button")
    ].map((b) => b.label);
    expect(labels).toContain(UNLOCK_BUTTON_LABEL);
    expect(labels).toContain("View generated course");
  });

  it("shows the scheduling error for a locked, unscheduled plan", async () => {
    const element = buildComponent();
    getRecord.emit(
      planRecord(
        STATUS_LOCKED,
        "Could only schedule 1 of 3 weekly classes.",
        null
      )
    );
    getPlanDetails.emit({ sessions: [], enrollmentCount: 0 });
    await flushPromises();

    const notification = element.shadowRoot.querySelector(".slds-theme_error");
    expect(notification).not.toBeNull();
    expect(notification.textContent).toContain(
      "Could only schedule 1 of 3 weekly classes."
    );
    expect(unlockButtonOf(element)).toBeTruthy();
  });

  it("locks the plan when the lock button is clicked", async () => {
    lockPlan.mockResolvedValue({
      scheduled: true,
      courseId: COURSE_ID,
      errorMessage: null
    });
    const element = buildComponent();
    getRecord.emit(planRecord(STATUS_DRAFT, null, null));
    getPlanDetails.emit({ sessions: [], enrollmentCount: 0 });
    await flushPromises();

    element.shadowRoot.querySelector("lightning-button").click();
    await flushPromises();

    expect(lockPlan).toHaveBeenCalledWith({ planId: PLAN_ID });
  });

  it("does not unlock when the confirmation is declined", async () => {
    const confirmSpy = jest
      .spyOn(LightningConfirm, "open")
      .mockResolvedValue(false);
    const element = buildComponent();
    getRecord.emit(planRecord(STATUS_LOCKED, "No availability.", null));
    getPlanDetails.emit({ sessions: [], enrollmentCount: 0 });
    await flushPromises();

    unlockButtonOf(element).click();
    await flushPromises();

    expect(confirmSpy).toHaveBeenCalled();
    expect(unlockPlan).not.toHaveBeenCalled();
  });

  it("unlocks after the confirmation is accepted and warns about enrollments", async () => {
    const confirmSpy = jest
      .spyOn(LightningConfirm, "open")
      .mockResolvedValue(true);
    unlockPlan.mockResolvedValue(undefined);
    const element = buildComponent();
    getRecord.emit(planRecord(STATUS_LOCKED, null, COURSE_ID));
    getPlanDetails.emit(MOCK_DETAILS);
    await flushPromises();

    unlockButtonOf(element).click();
    await flushPromises();
    await flushPromises();

    expect(confirmSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("2 student enrollment(s)")
      })
    );
    expect(unlockPlan).toHaveBeenCalledWith({ planId: PLAN_ID });
  });
});
