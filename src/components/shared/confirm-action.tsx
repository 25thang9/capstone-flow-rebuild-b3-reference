"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { ActionState } from "@/lib/action-state";

type ConfirmActionProps = {
  /** Nút mở hộp thoại (một phần tử Button). */
  trigger: React.ReactNode;
  title: string;
  description: React.ReactNode;
  confirmLabel: string;
  destructive?: boolean;
  /** Server Action đã bind sẵn tham số, ví dụ deleteTopicAction.bind(null, id). */
  action: () => Promise<ActionState>;
};

/** Hỏi lại trước thao tác khó hoàn tác (xoá, rút đăng ký), rồi báo kết quả bằng toast. */
export function ConfirmAction({ trigger, title, description, confirmLabel, destructive, action }: ConfirmActionProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function run(event: React.MouseEvent) {
    event.preventDefault();
    startTransition(async () => {
      const result = await action();
      if (result.status === "success") toast.success(result.message);
      else if (result.status === "error") toast.error(result.message);
      setOpen(false);
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={(next) => !pending && setOpen(next)}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Huỷ</AlertDialogCancel>
          <AlertDialogAction variant={destructive ? "destructive" : "default"} disabled={pending} onClick={run}>
            {pending ? "Đang xử lý…" : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
