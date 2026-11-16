"use client";

import { useActionState, useRef } from "react";

import { FormField, controlProps } from "@/components/shared/form-field";
import { FormError, fieldState, useFocusFirstInvalid } from "@/components/shared/form-helpers";
import { SubmitButton } from "@/components/shared/submit-button";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { idleState } from "@/lib/action-state";

import { signInAction, signUpAction } from "../actions";

/** `next`: trang sẽ quay lại sau khi đăng nhập (đã được kiểm tra là đường dẫn nội bộ ở server). */
export function SignInForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState(signInAction, idleState);
  const formRef = useRef<HTMLFormElement>(null);
  useFocusFirstInvalid(state, formRef);
  const email = fieldState(state, "email");
  const password = fieldState(state, "password");

  return (
    <form ref={formRef} action={formAction} noValidate>
      <FieldGroup>
        <FormError state={state} />
        {next ? <input type="hidden" name="next" value={next} /> : null}

        <FormField id="email" label="Email" required error={email.error}>
          <Input
            name="email"
            type="email"
            autoComplete="username"
            defaultValue={email.value ?? ""}
            {...controlProps("email", { error: email.error, required: true })}
          />
        </FormField>

        <FormField id="password" label="Mật khẩu" required error={password.error}>
          <Input
            name="password"
            type="password"
            autoComplete="current-password"
            {...controlProps("password", { error: password.error, required: true })}
          />
        </FormField>

        <SubmitButton pendingLabel="Đang đăng nhập…" size="lg" className="w-full">
          Đăng nhập
        </SubmitButton>
      </FieldGroup>
    </form>
  );
}

export function SignUpForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState(signUpAction, idleState);
  const formRef = useRef<HTMLFormElement>(null);
  useFocusFirstInvalid(state, formRef);
  const name = fieldState(state, "name");
  const email = fieldState(state, "email");
  const password = fieldState(state, "password");
  const confirmPassword = fieldState(state, "confirmPassword");
  const passwordHint = "Ít nhất 8 ký tự.";

  return (
    <form ref={formRef} action={formAction} noValidate>
      <FieldGroup>
        <FormError state={state} />
        {next ? <input type="hidden" name="next" value={next} /> : null}

        <FormField id="name" label="Họ và tên" required error={name.error}>
          <Input
            name="name"
            autoComplete="name"
            defaultValue={name.value ?? ""}
            maxLength={80}
            {...controlProps("name", { error: name.error, required: true })}
          />
        </FormField>

        <FormField id="email" label="Email" required error={email.error}>
          <Input
            name="email"
            type="email"
            autoComplete="username"
            defaultValue={email.value ?? ""}
            {...controlProps("email", { error: email.error, required: true })}
          />
        </FormField>

        <FormField id="password" label="Mật khẩu" required error={password.error} hint={passwordHint}>
          <Input
            name="password"
            type="password"
            autoComplete="new-password"
            {...controlProps("password", { error: password.error, hint: passwordHint, required: true })}
          />
        </FormField>

        <FormField id="confirmPassword" label="Nhập lại mật khẩu" required error={confirmPassword.error}>
          <Input
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            {...controlProps("confirmPassword", { error: confirmPassword.error, required: true })}
          />
        </FormField>

        <SubmitButton pendingLabel="Đang tạo tài khoản…" size="lg" className="w-full">
          Tạo tài khoản sinh viên
        </SubmitButton>
      </FieldGroup>
    </form>
  );
}
