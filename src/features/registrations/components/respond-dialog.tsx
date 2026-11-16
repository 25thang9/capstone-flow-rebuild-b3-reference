"use client";

import { useActionState, useState } from "react";

import { FormField, controlProps } from "@/components/shared/form-field";
import { FormError, fieldState, useSuccessToast } from "@/components/shared/form-helpers";
import { SubmitButton } from "@/components/shared/submit-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FieldError } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import type { RegistrationStatus } from "@/generated/prisma/enums";
import { idleState } from "@/lib/action-state";

import { respondAction } from "../actions";

type RespondDialogProps = {
  registration: {
    id: string;
    status: RegistrationStatus;
    lecturerNote: string | null;
    studentName: string;
    topicTitle: string;
  };
};

const DECISIONS = [
  { value: "ACCEPTED", label: "Nhận sinh viên", hint: "Tính vào số lượng của đề tài." },
  { value: "REJECTED", label: "Từ chối", hint: "Sinh viên thấy lời nhắn của bạn." },
] as const;

/** Hộp thoại giảng viên nhận / từ chối một đăng ký, kèm lời nhắn cho sinh viên. */
export function RespondDialog({ registration }: RespondDialogProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(respondAction, idleState);
  useSuccessToast(state, () => setOpen(false));

  const status = fieldState(state, "status");
  const note = fieldState(state, "lecturerNote");
  const noteId = `note-${registration.id}`;
  const isPending = registration.status === "PENDING";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant={isPending ? "default" : "outline"}>
          {isPending ? "Phản hồi" : "Đổi phản hồi"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Phản hồi đăng ký</DialogTitle>
          <DialogDescription>
            {registration.studentName} · {registration.topicTitle}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="grid gap-5">
          <input type="hidden" name="registrationId" value={registration.id} />

          <fieldset>
            <legend className="text-sm font-medium">Quyết định</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {DECISIONS.map((decision) => (
                <label
                  key={decision.value}
                  className="flex cursor-pointer gap-2.5 rounded-md border bg-card p-3 has-checked:border-primary has-checked:bg-secondary has-focus-visible:ring-3 has-focus-visible:ring-ring/50"
                >
                  <input
                    type="radio"
                    name="status"
                    value={decision.value}
                    defaultChecked={(status.value ?? (isPending ? "" : registration.status)) === decision.value}
                    required
                    className="mt-1 size-4 accent-primary outline-none"
                  />
                  <span>
                    <span className="block text-sm font-medium">{decision.label}</span>
                    <span className="block text-xs text-muted-foreground">{decision.hint}</span>
                  </span>
                </label>
              ))}
            </div>
            {status.error ? <FieldError className="mt-2">{status.error}</FieldError> : null}
          </fieldset>

          <FormField id={noteId} label="Lời nhắn cho sinh viên" error={note.error}>
            <Textarea
              name="lecturerNote"
              rows={3}
              maxLength={1000}
              defaultValue={note.value ?? registration.lecturerNote ?? ""}
              placeholder="Ví dụ: Em gặp thầy sáng thứ Ba tại phòng B32."
              {...controlProps(noteId, { error: note.error })}
            />
          </FormField>

          <FormError state={state} />

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Huỷ
              </Button>
            </DialogClose>
            <SubmitButton pendingLabel="Đang gửi…">Gửi phản hồi</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
