"use client";

import { useFormStatus } from "react-dom";
import { Loader2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";

type SubmitButtonProps = React.ComponentProps<typeof Button> & {
  /** Chữ hiển thị trong lúc Server Action đang chạy. */
  pendingLabel?: string;
};

/** Nút gửi form: tự khoá và báo "đang xử lý" để người dùng không bấm hai lần. */
export function SubmitButton({ children, pendingLabel = "Đang xử lý…", disabled, ...props }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending || disabled} aria-busy={pending} {...props}>
      {pending ? (
        <>
          <Loader2Icon className="animate-spin" aria-hidden="true" />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
