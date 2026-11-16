"use client";

import { useActionState } from "react";

import { useSuccessToast } from "@/components/shared/form-helpers";
import { SubmitButton } from "@/components/shared/submit-button";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Role } from "@/generated/prisma/enums";
import { type ActionState, idleState } from "@/lib/action-state";
import { ROLE_LABEL } from "@/lib/roles";

type RoleFormProps = {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  userName: string;
  currentRole: Role;
};

/** Ô chọn vai trò trên mỗi dòng của bảng người dùng. Lỗi hiện ngay dưới ô chọn. */
export function RoleForm({ action, userName, currentRole }: RoleFormProps) {
  const [state, formAction] = useActionState(action, idleState);
  useSuccessToast(state);

  return (
    <form action={formAction}>
      <div className="flex items-center gap-2">
        <NativeSelect name="role" defaultValue={currentRole} size="sm" aria-label={`Vai trò của ${userName}`}>
          {Object.values(Role).map((role) => (
            <NativeSelectOption key={role} value={role}>
              {ROLE_LABEL[role]}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <SubmitButton variant="outline" size="sm" pendingLabel="Đang lưu…">
          Lưu
        </SubmitButton>
      </div>
      {state.status === "error" ? (
        <p role="alert" className="mt-1 max-w-64 text-xs whitespace-normal text-destructive">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
