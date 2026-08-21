import { z } from "zod";
import { EMPLOYEE_ROLES } from "@/types/auth";

const requiredGuid = (message: string) => z.string().min(1, message).uuid(message);
const optionalGuid = z.union([z.literal(""), z.string().uuid("Select a valid manager.")]).optional();
const namePattern = /^[^0-9]+$/;
const phonePattern = /^[0-9+() -]*$/;

export const createEmployeeSchema = z.object({
  employeeCode: z.string().trim().min(1, "Employee code is required.").max(50, "Employee code must be 50 characters or less."),
  firstName: z.string().trim().min(1, "First name is required.").max(100, "First name must be 100 characters or less.").regex(namePattern, "First name cannot contain numbers."),
  lastName: z.string().trim().min(1, "Last name is required.").max(100, "Last name must be 100 characters or less.").regex(namePattern, "Last name cannot contain numbers."),
  email: z.string().trim().toLowerCase().min(1, "Email is required.").email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  phoneNumber: z.string().trim().regex(phonePattern, "Phone can contain only numbers and phone symbols.").optional(),
  departmentId: requiredGuid("Department is required."),
  role: z.enum(EMPLOYEE_ROLES),
  managerId: optionalGuid
});

export const updateEmployeeSchema = createEmployeeSchema.omit({ employeeCode: true, password: true });

export type CreateEmployeeFormValues = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeFormValues = z.infer<typeof updateEmployeeSchema>;
