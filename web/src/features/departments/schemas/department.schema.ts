import { z } from "zod";

const namePattern = /^[^0-9]+$/;

export const departmentSchema = z.object({
  name: z.string().trim().min(1, "Department name is required.").max(100, "Department name must be 100 characters or less.").regex(namePattern, "Department name cannot contain numbers."),
  code: z.string().trim().min(1, "Department code is required.").max(50, "Department code must be 50 characters or less.")
});

export type DepartmentFormValues = z.infer<typeof departmentSchema>;
