import type { RegistrationStatus } from "@/generated/prisma/enums";
import type { Availability } from "@/features/registrations/rules";
import { AVAILABILITY_LABEL, REGISTRATION_STATUS_LABEL } from "@/lib/labels";
import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "danger" | "neutral";

const TONE_CLASS: Record<Tone, string> = {
  success: "border-success/25 bg-success-soft text-success",
  warning: "border-warning/30 bg-warning-soft text-warning",
  danger: "border-destructive/25 bg-danger-soft text-destructive",
  neutral: "border-border bg-muted text-muted-foreground",
};

/** Nhãn trạng thái: luôn có chữ đi kèm, không truyền đạt thông tin chỉ bằng màu. */
export function StatusBadge({ tone, children, className }: { tone: Tone; children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        TONE_CLASS[tone],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {children}
    </span>
  );
}

const AVAILABILITY_TONE: Record<Availability, Tone> = {
  OPEN: "success",
  FULL: "warning",
  CLOSED: "neutral",
};

export function AvailabilityBadge({ availability }: { availability: Availability }) {
  return <StatusBadge tone={AVAILABILITY_TONE[availability]}>{AVAILABILITY_LABEL[availability]}</StatusBadge>;
}

const REGISTRATION_TONE: Record<RegistrationStatus, Tone> = {
  PENDING: "warning",
  ACCEPTED: "success",
  REJECTED: "danger",
};

export function RegistrationStatusBadge({ status }: { status: RegistrationStatus }) {
  return <StatusBadge tone={REGISTRATION_TONE[status]}>{REGISTRATION_STATUS_LABEL[status]}</StatusBadge>;
}
