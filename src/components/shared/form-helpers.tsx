"use client";

import { useEffect, useEffectEvent } from "react";
import { CircleAlertIcon } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import type { ActionState } from "@/lib/action-state";

/**
 * Báo thành công bằng toast sau khi Server Action chạy xong.
 * Lỗi KHÔNG toast: lỗi luôn hiển thị ngay trong form (FormError / dưới từng ô) để người dùng sửa tại chỗ.
 */
export function useSuccessToast(state: ActionState, onSuccess?: () => void) {
  const handleSuccess = useEffectEvent(() => onSuccess?.());

  useEffect(() => {
    if (state.status !== "success") return;
    toast.success(state.message);
    handleSuccess();
  }, [state]);
}

/**
 * Khi Server Action trả lỗi theo từng ô, đưa con trỏ tới ô lỗi đầu tiên của form
 * để người dùng bàn phím và trình đọc màn hình biết ngay cần sửa ở đâu.
 */
export function useFocusFirstInvalid(state: ActionState, formRef: React.RefObject<HTMLFormElement | null>) {
  useEffect(() => {
    if (state.status !== "error" || !state.fieldErrors) return;
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [state, formRef]);
}

/** Thông báo lỗi chung của form, được trình đọc màn hình đọc ngay khi xuất hiện. */
export function FormError({ state }: { state: ActionState }) {
  // Khi đã có lỗi theo từng ô thì không lặp lại câu "kiểm tra các ô được đánh dấu".
  if (state.status !== "error" || state.fieldErrors) return null;
  return (
    <Alert variant="destructive" role="alert" className="bg-danger-soft">
      <CircleAlertIcon aria-hidden="true" />
      <AlertDescription>{state.message}</AlertDescription>
    </Alert>
  );
}

/** Lấy lỗi và giá trị vừa nhập của một ô từ ActionState. */
export function fieldState(state: ActionState, name: string) {
  if (state.status !== "error") return { error: undefined, value: undefined };
  return { error: state.fieldErrors?.[name]?.[0], value: state.values?.[name] };
}
