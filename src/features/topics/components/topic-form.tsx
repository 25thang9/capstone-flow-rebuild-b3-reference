"use client";

import { useActionState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { FormField, controlProps } from "@/components/shared/form-field";
import { FormError, fieldState, useFocusFirstInvalid, useSuccessToast } from "@/components/shared/form-helpers";
import { SubmitButton } from "@/components/shared/submit-button";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { type ActionState, idleState } from "@/lib/action-state";

import { MAX_STUDENTS_PER_TOPIC, MAX_TAGS_PER_TOPIC } from "../schema";

type Option = { id: string; name: string };

export type TopicFormValues = {
  title: string;
  description: string;
  objectives: string;
  requirements: string;
  departmentId: string;
  maxStudents: number;
  status: "OPEN" | "CLOSED";
  tagIds: string[];
};

type TopicFormProps = {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  departments: Option[];
  tags: Option[];
  /** Có giá trị khi sửa; bỏ trống khi tạo mới. */
  topic?: TopicFormValues;
  /** Số sinh viên đã nhận – để nhắc giảng viên không giảm số lượng xuống dưới mức này. */
  acceptedCount?: number;
  submitLabel: string;
};

const EMPTY: TopicFormValues = {
  title: "",
  description: "",
  objectives: "",
  requirements: "",
  departmentId: "",
  maxStudents: 2,
  status: "OPEN",
  tagIds: [],
};

export function TopicForm({ action, departments, tags, topic = EMPTY, acceptedCount = 0, submitLabel }: TopicFormProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(action, idleState);
  const formRef = useRef<HTMLFormElement>(null);
  useSuccessToast(state, () => router.push("/lecturer/topics"));
  useFocusFirstInvalid(state, formRef);

  // Sau khi gửi lỗi, ô nhập lấy lại đúng giá trị người dùng vừa gõ (state.values) thay vì giá trị ban đầu.
  const field = (name: keyof TopicFormValues) => {
    const { error, value } = fieldState(state, name);
    return { error, value: value ?? String(topic[name]) };
  };
  const title = field("title");
  const description = field("description");
  const objectives = field("objectives");
  const requirements = field("requirements");
  const departmentId = field("departmentId");
  const maxStudents = field("maxStudents");
  const status = field("status");
  const tagIds = fieldState(state, "tagIds");
  const selectedTags = new Set(tagIds.value !== undefined ? tagIds.value.split(",") : topic.tagIds);

  const studentsHint =
    acceptedCount > 0
      ? `Từ ${acceptedCount} (số đã nhận) đến ${MAX_STUDENTS_PER_TOPIC}. Nhận đủ số này, đề tài sẽ tự đóng.`
      : `Từ 1 đến ${MAX_STUDENTS_PER_TOPIC}. Nhận đủ số này, đề tài sẽ tự đóng.`;

  return (
    <form ref={formRef} action={formAction} noValidate className="divide-y border-y">
      <FormSection title="Thông tin chung" description="Tên và mô tả là phần sinh viên đọc đầu tiên trong Kho đề tài.">
        <FormField id="title" label="Tên đề tài" required error={title.error}>
          <Input
            name="title"
            defaultValue={title.value}
            maxLength={200}
            placeholder="Ví dụ: Hệ đo nhiệt độ – độ ẩm dùng ESP32, hiển thị trên web"
            {...controlProps("title", { error: title.error, required: true })}
          />
        </FormField>
        <FormField
          id="description"
          label="Mô tả"
          required
          error={description.error}
          hint="Bài toán, đối tượng sử dụng, phạm vi công việc. Ít nhất 30 ký tự."
        >
          <Textarea
            name="description"
            rows={6}
            defaultValue={description.value}
            maxLength={5000}
            {...controlProps("description", { error: description.error, hint: true, required: true })}
          />
        </FormField>
      </FormSection>

      <FormSection title="Nội dung thực hiện" description="Giúp sinh viên tự đánh giá mình có phù hợp hay không.">
        <FormField id="objectives" label="Mục tiêu" error={objectives.error} hint="Mỗi mục tiêu viết trên một dòng.">
          <Textarea
            name="objectives"
            rows={4}
            defaultValue={objectives.value}
            maxLength={3000}
            {...controlProps("objectives", { error: objectives.error, hint: true })}
          />
        </FormField>
        <FormField
          id="requirements"
          label="Yêu cầu đối với sinh viên"
          error={requirements.error}
          hint="Môn đã học, kỹ năng cần có, thời gian làm việc tại phòng thí nghiệm…"
        >
          <Textarea
            name="requirements"
            rows={4}
            defaultValue={requirements.value}
            maxLength={3000}
            {...controlProps("requirements", { error: requirements.error, hint: true })}
          />
        </FormField>
      </FormSection>

      <FormSection title="Phân loại" description="Dùng cho bộ lọc ở Kho đề tài.">
        <FormField id="departmentId" label="Bộ môn" required error={departmentId.error}>
          <NativeSelect
            name="departmentId"
            defaultValue={departmentId.value}
            className="w-full sm:w-72"
            {...controlProps("departmentId", { error: departmentId.error, required: true })}
          >
            <NativeSelectOption value="">Chọn bộ môn…</NativeSelectOption>
            {departments.map((item) => (
              <NativeSelectOption key={item.id} value={item.id}>
                {item.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </FormField>

        <fieldset aria-describedby="tagIds-hint">
          <legend className="text-sm font-medium">
            Thẻ công nghệ, lĩnh vực <span className="font-normal text-muted-foreground">(không bắt buộc)</span>
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <label
                key={tag.id}
                className="inline-flex cursor-pointer items-center gap-2 rounded-md border bg-card px-2.5 py-1.5 text-sm has-checked:border-primary has-checked:bg-secondary has-focus-visible:ring-3 has-focus-visible:ring-ring/50"
              >
                <input
                  type="checkbox"
                  name="tagIds"
                  value={tag.id}
                  defaultChecked={selectedTags.has(tag.id)}
                  className="size-4 accent-primary outline-none"
                />
                {tag.name}
              </label>
            ))}
          </div>
          <p id="tagIds-hint" className="mt-2 text-sm text-muted-foreground">
            Chọn tối đa {MAX_TAGS_PER_TOPIC} thẻ. Thiếu thẻ cần dùng? Nhờ quản trị viên thêm vào danh mục.
          </p>
          {tagIds.error ? <FieldError className="mt-1">{tagIds.error}</FieldError> : null}
        </fieldset>
      </FormSection>

      <FormSection title="Nhận sinh viên" description="Số lượng và trạng thái nhận đăng ký.">
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField id="maxStudents" label="Số sinh viên tối đa" required error={maxStudents.error} hint={studentsHint}>
            <Input
              name="maxStudents"
              type="number"
              inputMode="numeric"
              min={Math.max(1, acceptedCount)}
              max={MAX_STUDENTS_PER_TOPIC}
              defaultValue={maxStudents.value}
              {...controlProps("maxStudents", { error: maxStudents.error, hint: studentsHint, required: true })}
            />
          </FormField>
          <FormField
            id="status"
            label="Trạng thái"
            required
            error={status.error}
            hint="Khi đóng, sinh viên vẫn xem được đề tài nhưng không gửi được đăng ký mới."
          >
            <NativeSelect
              name="status"
              defaultValue={status.value}
              className="w-full"
              {...controlProps("status", { error: status.error, hint: true, required: true })}
            >
              <NativeSelectOption value="OPEN">Đang nhận đăng ký</NativeSelectOption>
              <NativeSelectOption value="CLOSED">Đã đóng</NativeSelectOption>
            </NativeSelect>
          </FormField>
        </div>
      </FormSection>

      <div className="space-y-4 py-6">
        <FormError state={state} />
        {state.status === "error" && state.fieldErrors ? (
          <p role="alert" className="text-sm text-destructive">
            {state.message}
          </p>
        ) : null}
        <div className="flex justify-end gap-2">
          <Button asChild variant="outline">
            <Link href="/lecturer/topics">Huỷ</Link>
          </Button>
          <SubmitButton pendingLabel="Đang lưu…">{submitLabel}</SubmitButton>
        </div>
      </div>
    </form>
  );
}

/** Một nhóm ô trong form: tiêu đề nhóm bên trái, các ô bên phải (xếp dọc trên điện thoại). */
function FormSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-x-10 gap-y-4 py-8 md:grid-cols-[14rem_minmax(0,1fr)]">
      <div>
        <h2 className="font-sans text-base font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="grid gap-6">{children}</div>
    </section>
  );
}
