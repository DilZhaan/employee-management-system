import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { departmentSchema, type DepartmentFormValues } from "@/features/departments/schemas/department.schema";
import { sanitizeName, sanitizeSingleLineText } from "@/lib/sanitize";
import type { DepartmentResponse } from "@/types/department";

interface DepartmentFormProps {
  department?: DepartmentResponse;
  isSubmitting: boolean;
  onSubmit: (values: DepartmentFormValues) => void;
  onCancel: () => void;
}

export function DepartmentForm({ department, isSubmitting, onSubmit, onCancel }: DepartmentFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: {
      name: department?.name ?? "",
      code: department?.code ?? ""
    }
  });

  function submit(values: DepartmentFormValues) {
    onSubmit({
      name: sanitizeName(values.name),
      code: sanitizeSingleLineText(values.code)
    });
  }

  const nameField = register("name", {
    onChange: (event) => setValue("name", sanitizeName(event.target.value), { shouldValidate: false })
  });

  return (
    <form className="space-y-5" onSubmit={handleSubmit(submit)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="department-code">Code</Label>
          <Input id="department-code" autoComplete="off" {...register("code")} />
          {errors.code ? <p className="text-sm text-rose-700">{errors.code.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="department-name">Name</Label>
          <Input id="department-name" autoComplete="off" {...nameField} />
          {errors.name ? <p className="text-sm text-rose-700">{errors.name.message}</p> : null}
        </div>
      </div>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : department ? "Save changes" : "Create department"}
        </Button>
      </div>
    </form>
  );
}
