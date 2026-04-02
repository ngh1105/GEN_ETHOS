import type { AuditRequest } from "@/types";

export type AuditFormInput = {
  companyId: string;
  officialReportUrl: string;
  iotSensorUrl: string;
  ngoWatchdogUrl: string;
};

export function isAuditFormSubmittable(input: AuditFormInput): boolean {
  return input.companyId.trim().length > 0 && input.officialReportUrl.trim().length > 0;
}

export function sanitizeAuditFormInput(input: AuditFormInput): AuditRequest {
  return {
    company_id: input.companyId.trim(),
    official_report_url: input.officialReportUrl.trim(),
    iot_sensor_url: input.iotSensorUrl.trim(),
    ngo_watchdog_url: input.ngoWatchdogUrl.trim(),
  };
}
