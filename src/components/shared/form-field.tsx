import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";

type FormFieldProps = {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  /** Ô nhập. Nhớ truyền cho nó {...controlProps(id, { error, hint })}. */
  children: React.ReactNode;
};

/** Một ô của form: nhãn, ô nhập, gợi ý và lỗi được liên kết với nhau cho trình đọc màn hình. */
export function FormField({ id, label, error, hint, required, children }: FormFieldProps) {
  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor={id}>
        {label}
        {required ? (
          <span className="text-destructive" aria-hidden="true">
            *
          </span>
        ) : (
          <span className="font-normal text-muted-foreground">(không bắt buộc)</span>
        )}
      </FieldLabel>
      {children}
      {hint ? <FieldDescription id={`${id}-hint`}>{hint}</FieldDescription> : null}
      {error ? <FieldError id={`${id}-error`}>{error}</FieldError> : null}
    </Field>
  );
}

/** Thuộc tính trợ năng cho ô nhập nằm trong FormField. */
export function controlProps(id: string, options: { error?: string; hint?: string | boolean; required?: boolean } = {}) {
  const describedBy = [options.error ? `${id}-error` : null, options.hint ? `${id}-hint` : null]
    .filter(Boolean)
    .join(" ");
  return {
    id,
    "aria-invalid": options.error ? true : undefined,
    "aria-describedby": describedBy || undefined,
    "aria-required": options.required ? true : undefined,
  } as const;
}
