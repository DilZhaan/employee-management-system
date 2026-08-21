import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { getMutationError } from "@/features/common/form-errors";
import { createEmployeeSchema, updateEmployeeSchema, type CreateEmployeeFormValues, type UpdateEmployeeFormValues } from "@/features/employees/schemas/employee.schema";
import { sanitizeEmail, sanitizeName, sanitizePhone, sanitizeSingleLineText } from "@/lib/sanitize";
import { EMPLOYEE_ROLES } from "@/types/auth";
import type { DepartmentResponse } from "@/types/department";
import type { CreateEmployeeRequest, EmployeeResponse, UpdateEmployeeRequest } from "@/types/employee";

type EmployeeFormValues = CreateEmployeeFormValues | UpdateEmployeeFormValues;

interface EmployeeFormProps {
  mode: "create" | "edit";
  employee?: EmployeeResponse;
  departments: DepartmentResponse[];
  managers: EmployeeResponse[];
  isSubmitting: boolean;
  error: unknown;
  onSubmit: (values: CreateEmployeeRequest | UpdateEmployeeRequest) => void;
  onCancel: () => void;
}

export function EmployeeForm({ mode, employee, departments, managers, isSubmitting, error, onSubmit, onCancel }: EmployeeFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const mutationError = getMutationError(error);
  const isCreate = mode === "create";
  const schema = isCreate ? createEmployeeSchema : updateEmployeeSchema;
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: getDefaultValues(mode, employee)
  });
  const availableManagers = managers.filter((manager) => manager.id !== employee?.id);

  function submit(values: EmployeeFormValues) {
    onSubmit({
      ...values,
      employeeCode: "employeeCode" in values ? sanitizeSingleLineText(values.employeeCode) : undefined,
      firstName: sanitizeName(values.firstName),
      lastName: sanitizeName(values.lastName),
      email: sanitizeEmail(values.email),
      phoneNumber: values.phoneNumber ? sanitizePhone(values.phoneNumber) : null,
      managerId: values.managerId || null
    } as CreateEmployeeRequest | UpdateEmployeeRequest);
  }

  const firstNameField = register("firstName", {
    onChange: (event) => setValue("firstName", sanitizeName(event.target.value), { shouldValidate: false })
  });
  const lastNameField = register("lastName", {
    onChange: (event) => setValue("lastName", sanitizeName(event.target.value), { shouldValidate: false })
  });
  const phoneField = register("phoneNumber", {
    onChange: (event) => setValue("phoneNumber", sanitizePhone(event.target.value), { shouldValidate: false })
  });

  return (
    <form className="space-y-5" onSubmit={handleSubmit(submit)}>
      {mutationError ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800" role="alert">
          {mutationError.detail ?? mutationError.title}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {isCreate ? (
          <Field id="employee-code" label="Employee code" error={"employeeCode" in errors ? errors.employeeCode?.message : undefined}>
            <Input id="employee-code" autoComplete="off" {...register("employeeCode" as never)} />
          </Field>
        ) : null}

        <Field id="employee-first-name" label="First name" error={errors.firstName?.message}>
          <Input id="employee-first-name" autoComplete="given-name" {...firstNameField} />
        </Field>

        <Field id="employee-last-name" label="Last name" error={errors.lastName?.message}>
          <Input id="employee-last-name" autoComplete="family-name" {...lastNameField} />
        </Field>

        <Field id="employee-email" label="Email" error={errors.email?.message}>
          <Input id="employee-email" type="email" autoComplete="email" {...register("email")} />
        </Field>

        <Field id="employee-phone" label="Phone" error={errors.phoneNumber?.message}>
          <Input id="employee-phone" type="tel" inputMode="tel" autoComplete="tel" {...phoneField} />
        </Field>

        {isCreate ? (
          <Field id="employee-password" label="Password" error={"password" in errors ? errors.password?.message : undefined}>
            <div className="relative">
              <Input id="employee-password" type={showPassword ? "text" : "password"} autoComplete="new-password" className="pr-11" {...register("password" as never)} />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1 size-8"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
              </Button>
            </div>
          </Field>
        ) : null}

        <Field id="employee-department" label="Department" error={errors.departmentId?.message}>
          <Select id="employee-department" {...register("departmentId")}>
            <option value="">Select department</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.code} - {department.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field id="employee-role" label="Role" error={errors.role?.message}>
          <Select id="employee-role" {...register("role")}>
            {EMPLOYEE_ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </Select>
        </Field>

        <Field id="employee-manager" label="Manager" error={errors.managerId?.message}>
          <Select id="employee-manager" {...register("managerId")}>
            <option value="">No manager</option>
            {availableManagers.map((manager) => (
              <option key={manager.id} value={manager.id}>
                {manager.employeeCode} - {manager.firstName} {manager.lastName}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : isCreate ? "Create employee" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
    </div>
  );
}

function getDefaultValues(mode: "create" | "edit", employee?: EmployeeResponse): EmployeeFormValues {
  if (mode === "edit" && employee) {
    return {
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phoneNumber: employee.phoneNumber ?? "",
      departmentId: employee.departmentId,
      role: employee.role,
      managerId: employee.managerId ?? ""
    };
  }

  return {
    employeeCode: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
    departmentId: "",
    role: "Employee",
    managerId: ""
  };
}
