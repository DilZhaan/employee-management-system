import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { getMutationError } from "@/features/common/form-errors";
import { leaveRequestSchema, type LeaveRequestFormValues } from "@/features/leave/schemas/leave.schema";
import { todayDateOnly } from "@/lib/date-rules";
import { sanitizeMultilineText } from "@/lib/sanitize";
import { LEAVE_TYPES } from "@/types/leave";

interface LeaveRequestFormProps {
  isSubmitting: boolean;
  error: unknown;
  onSubmit: (values: LeaveRequestFormValues) => void;
}

export function LeaveRequestForm({ isSubmitting, error, onSubmit }: LeaveRequestFormProps) {
  const mutationError = getMutationError(error);
  const today = todayDateOnly();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LeaveRequestFormValues>({
    resolver: zodResolver(leaveRequestSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: {
      leaveType: "Annual",
      startDate: "",
      endDate: "",
      reason: ""
    }
  });

  function submit(values: LeaveRequestFormValues) {
    onSubmit({
      ...values,
      reason: sanitizeMultilineText(values.reason)
    });
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(submit)}>
      {mutationError ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800" role="alert">
          {mutationError.detail ?? mutationError.title}
        </div>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="leave-type">Leave type</Label>
          <Select id="leave-type" {...register("leaveType")}>
            {LEAVE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
          {errors.leaveType ? <p className="text-sm text-rose-700">{errors.leaveType.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="leave-start">Start date</Label>
          <Input id="leave-start" type="date" min={today} {...register("startDate")} />
          {errors.startDate ? <p className="text-sm text-rose-700">{errors.startDate.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="leave-end">End date</Label>
          <Input id="leave-end" type="date" min={today} {...register("endDate")} />
          {errors.endDate ? <p className="text-sm text-rose-700">{errors.endDate.message}</p> : null}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="leave-reason">Reason</Label>
        <Textarea id="leave-reason" {...register("reason")} />
        {errors.reason ? <p className="text-sm text-rose-700">{errors.reason.message}</p> : null}
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit request"}
      </Button>
    </form>
  );
}
