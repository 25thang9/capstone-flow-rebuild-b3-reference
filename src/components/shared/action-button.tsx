"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { ActionState } from "@/lib/action-state";

type ActionButtonProps = Omit<React.ComponentProps<typeof Button>, "onClick"> & {
  /** Server Action đã bind sẵn tham số. */
  action: () => Promise<ActionState>;
  pendingLabel?: string;
};

/** Nút chạy thẳng một Server Action (không cần form), ví dụ đóng/mở đề tài. Kết quả báo bằng toast. */
export function ActionButton({ action, pendingLabel = "Đang xử lý…", children, disabled, ...props }: ActionButtonProps) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      disabled={pending || disabled}
      aria-busy={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await action();
          if (result.status === "success") toast.success(result.message);
          else if (result.status === "error") toast.error(result.message);
        })
      }
      {...props}
    >
      {pending ? pendingLabel : children}
    </Button>
  );
}
