"use client";

import { useActionState, useState } from "react";
import { PlusIcon } from "lucide-react";

import { controlProps } from "@/components/shared/form-field";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type ActionState, idleState } from "@/lib/action-state";

type FormAction = (state: ActionState, formData: FormData) => Promise<ActionState>;

/** Form một dòng để thêm bộ môn / thẻ. Thêm xong, ô nhập tự xoá trắng để nhập tiếp. */
export function CatalogAddForm({ action, label, inputId }: { action: FormAction; label: string; inputId: string }) {
  const [state, formAction] = useActionState(action, idleState);
  useSuccessToast(state);
  const name = fieldState(state, "name");

  return (
    <form action={formAction} noValidate>
      <Label htmlFor={inputId}>{label}</Label>
      <div className="mt-1.5 flex gap-2">
        <Input
          name="name"
          defaultValue={name.value ?? ""}
          maxLength={60}
          autoComplete="off"
          {...controlProps(inputId, { error: name.error, required: true })}
        />
        <SubmitButton pendingLabel="Đang thêm…">
          <PlusIcon aria-hidden="true" />
          Thêm
        </SubmitButton>
      </div>
      {name.error ? (
        <FieldError id={`${inputId}-error`} className="mt-1.5">
          {name.error}
        </FieldError>
      ) : null}
      <div className="mt-2 empty:hidden">
        <FormError state={state} />
      </div>
    </form>
  );
}

/** Hộp thoại đổi tên một bộ môn / thẻ. */
export function CatalogRenameDialog({ action, currentName }: { action: FormAction; currentName: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(action, idleState);
  useSuccessToast(state, () => setOpen(false));
  const name = fieldState(state, "name");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" aria-label={`Đổi tên ${currentName}`}>
          Đổi tên
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Đổi tên</DialogTitle>
          <DialogDescription>Tên mới áp dụng cho mọi đề tài đang dùng “{currentName}”.</DialogDescription>
        </DialogHeader>
        <form action={formAction} noValidate className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="rename-input">Tên mới</Label>
            <Input
              name="name"
              defaultValue={name.value ?? currentName}
              maxLength={60}
              autoComplete="off"
              {...controlProps("rename-input", { error: name.error, required: true })}
            />
            {name.error ? <FieldError id="rename-input-error">{name.error}</FieldError> : null}
          </div>
          <FormError state={state} />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Huỷ
              </Button>
            </DialogClose>
            <SubmitButton pendingLabel="Đang lưu…">Lưu</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
