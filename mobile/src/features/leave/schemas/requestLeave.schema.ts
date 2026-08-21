import { z } from "zod";

import { LEAVE_TYPES } from "@/types/leave";
import { todayDateOnly } from "@/utils/date";

const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;

export const requestLeaveSchema = z
  .object({
    leaveType: z.enum(LEAVE_TYPES),
    startDate: z.string().min(1, "Start date is required.").regex(dateOnlyPattern, "Enter a valid start date."),
    endDate: z.string().min(1, "End date is required.").regex(dateOnlyPattern, "Enter a valid end date."),
    reason: z.string().trim().min(1, "Reason is required.").max(500, "Reason must be 500 characters or less.")
  })
  .refine((values) => values.startDate <= values.endDate, {
    message: "Start date cannot be after end date.",
    path: ["endDate"]
  })
  .refine((values) => values.startDate >= todayDateOnly(), {
    message: "Start date cannot be in the past.",
    path: ["startDate"]
  })
  .refine((values) => values.endDate >= todayDateOnly(), {
    message: "End date cannot be in the past.",
    path: ["endDate"]
  });

export type RequestLeaveFormValues = z.infer<typeof requestLeaveSchema>;
