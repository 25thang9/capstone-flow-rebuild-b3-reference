import { z } from "zod";

/**
 * Kết quả chung của mọi Server Action gắn với form (dùng cùng useActionState).
 * - fieldErrors: lỗi theo từng ô, hiển thị ngay dưới ô đó.
 * - values: giá trị người dùng vừa nhập, để form không bị xoá trắng khi có lỗi.
 */
export type ActionState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | {
      status: "error";
      message: string;
      fieldErrors?: Record<string, string[] | undefined>;
      values?: Record<string, string>;
    };

export const idleState: ActionState = { status: "idle" };

export function success(message: string): ActionState {
  return { status: "success", message };
}

export function failure(message: string, formData?: FormData): ActionState {
  return { status: "error", message, values: formData ? formValues(formData) : undefined };
}

export function validationFailure(error: z.ZodError, formData: FormData): ActionState {
  return {
    status: "error",
    message: "Vui lòng kiểm tra lại các ô được đánh dấu.",
    fieldErrors: z.flattenError(error).fieldErrors,
    values: formValues(formData),
  };
}

/** Lấy lại giá trị dạng chuỗi của form. Không bao giờ trả mật khẩu về trình duyệt. */
export function formValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value !== "string" || key.toLowerCase().includes("password")) continue;
    // Ô nhiều giá trị (checkbox cùng name) được nối bằng dấu phẩy.
    values[key] = key in values ? `${values[key]},${value}` : value;
  }
  return values;
}
