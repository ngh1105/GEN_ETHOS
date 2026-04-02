import { describe, expect, it } from "vitest";
import { isAuditFormSubmittable, sanitizeAuditFormInput } from "./audit-request";

describe("audit request helpers", () => {
  it("accepts only company id + official report as required fields", () => {
    expect(
      isAuditFormSubmittable({
        companyId: "APPLE_INC",
        officialReportUrl: "https://www.apple.com/environment/",
        iotSensorUrl: "",
        ngoWatchdogUrl: "",
      })
    ).toBe(true);
  });

  it("rejects empty required fields", () => {
    expect(
      isAuditFormSubmittable({
        companyId: "   ",
        officialReportUrl: "https://www.apple.com/environment/",
        iotSensorUrl: "",
        ngoWatchdogUrl: "",
      })
    ).toBe(false);

    expect(
      isAuditFormSubmittable({
        companyId: "APPLE_INC",
        officialReportUrl: "  ",
        iotSensorUrl: "https://example.com/iot",
        ngoWatchdogUrl: "",
      })
    ).toBe(false);
  });

  it("trims all fields and keeps optional urls empty", () => {
    expect(
      sanitizeAuditFormInput({
        companyId: " APPLE_INC ",
        officialReportUrl: " https://www.apple.com/environment/ ",
        iotSensorUrl: " ",
        ngoWatchdogUrl: " ",
      })
    ).toEqual({
      company_id: "APPLE_INC",
      official_report_url: "https://www.apple.com/environment/",
      iot_sensor_url: "",
      ngo_watchdog_url: "",
    });
  });
});
