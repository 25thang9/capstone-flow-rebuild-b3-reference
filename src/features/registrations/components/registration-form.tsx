"use client";

import { useActionState, useRef } from "react";

import { FormField, controlProps } from "@/components/shared/form-field";
import { FormError, fieldState, useFocusFirstInvalid, useSuccessToast } from "@/components/shared/form-helpers";
import { SubmitButton } from "@/components/shared/submit-button";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { type ActionState, idleState } from "@/lib/action-state";

type RegistrationFormProps = {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  defaults: { studentCode: string; className: string; phone: string };
};

export function RegistrationForm({ action, defaults }: RegistrationFormProps) {
  const [state, formAction] = useActionState(action, idleState);
  const formRef = useRef<HTMLFormElement>(null);
  useSuccessToast(state);
  useFocusFirstInvalid(state, formRef);

  const studentCode = fieldState(state, "studentCode");
  const className = fieldState(state, "className");
  const phone = fieldState(state, "phone");
  const message = fieldState(state, "message");
  const messageHint = "Giới thiệu ngắn về bạn và lý do chọn đề tài. Tối đa 1000 ký tự.";

  return (
    <form ref={formRef} action={formAction} noValidate>
      <FieldGroup>
        <FormError state={state} />

        <FormField id="studentCode" label="Mã số sinh viên" required error={studentCode.error}>
          <Input
            name="studentCode"
            defaultValue={studentCode.value ?? defaults.studentCode}
            autoComplete="off"
            inputMode="numeric"
            maxLength={12}
            {...controlProps("studentCode", { error: studentCode.error, required: true })}
          />
        </FormField>

        <FormField id="className" label="Lớp" error={className.error}>
          <Input
            name="className"
            defaultValue={className.value ?? defaults.className}
            maxLength={50}
            {...controlProps("className", { error: className.error })}
          />
        </FormField>

        <FormField id="phone" label="Số điện thoại" error={phone.error}>
          <Input
            name="phone"
            type="tel"
            defaultValue={phone.value ?? defaults.phone}
            autoComplete="tel"
            maxLength={10}
            {...controlProps("phone", { error: phone.error })}
          />
        </FormField>

        <FormField id="message" label="Lời nhắn cho giảng viên" error={message.error} hint={messageHint}>
          <Textarea
            name="message"
            rows={4}
            defaultValue={message.value ?? ""}
            maxLength={1000}
            {...controlProps("message", { error: message.error, hint: messageHint })}
          />
        </FormField>

        <SubmitButton pendingLabel="Đang gửi…" className="w-full">
          Gửi đăng ký
        </SubmitButton>
      </FieldGroup>
    </form>
  );
}
