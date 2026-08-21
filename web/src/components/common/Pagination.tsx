import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

interface PaginationProps {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

const pageSizes = [10, 20, 50];

export function Pagination({ page, pageSize, totalCount, totalPages, onPageChange, onPageSizeChange }: PaginationProps) {
  const first = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, totalCount);
  const canPrevious = page > 1;
  const canNext = totalPages > 0 && page < totalPages;

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-600">
        Showing <span className="font-medium text-slate-950">{first}</span>-<span className="font-medium text-slate-950">{last}</span> of{" "}
        <span className="font-medium text-slate-950">{totalCount}</span>
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          Rows
          <Select className="h-9 w-20" value={String(pageSize)} onChange={(event) => onPageSizeChange(Number(event.target.value))}>
            {pageSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </Select>
        </label>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onPageChange(page - 1)} disabled={!canPrevious} aria-label="Previous page">
            <ChevronLeft className="size-4" aria-hidden="true" />
            Previous
          </Button>
          <span className="min-w-20 text-center text-sm text-slate-600">
            Page {totalPages === 0 ? 0 : page} of {totalPages}
          </span>
          <Button variant="outline" size="sm" onClick={() => onPageChange(page + 1)} disabled={!canNext} aria-label="Next page">
            Next
            <ChevronRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}
