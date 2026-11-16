import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FormField, controlProps } from "@/components/shared/form-field";
import { RegistrationStatusBadge } from "@/components/shared/status-badge";

describe("FormField", () => {
  it("liên kết nhãn, gợi ý và lỗi với ô nhập cho trình đọc màn hình", () => {
    const error = "MSSV gồm 6–12 chữ cái hoặc chữ số, viết liền.";
    const hint = "Ghi đúng như trên thẻ sinh viên.";

    render(
      <FormField id="studentCode" label="Mã số sinh viên" required error={error} hint={hint}>
        <input name="studentCode" {...controlProps("studentCode", { error, hint, required: true })} />
      </FormField>,
    );

    const input = screen.getByLabelText(/Mã số sinh viên/);
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-required", "true");
    expect(input).toHaveAccessibleDescription(`${error} ${hint}`);
  });

  it("ô hợp lệ không mang thuộc tính lỗi và được ghi rõ là không bắt buộc", () => {
    render(
      <FormField id="className" label="Lớp">
        <input name="className" {...controlProps("className")} />
      </FormField>,
    );

    const input = screen.getByLabelText(/Lớp/);
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(input).not.toHaveAttribute("aria-describedby");
    expect(screen.getByText("(không bắt buộc)")).toBeInTheDocument();
  });
});

describe("RegistrationStatusBadge", () => {
  it("hiện nhãn tiếng Việt cho từng trạng thái (không chỉ dựa vào màu)", () => {
    render(
      <>
        <RegistrationStatusBadge status="PENDING" />
        <RegistrationStatusBadge status="ACCEPTED" />
        <RegistrationStatusBadge status="REJECTED" />
      </>,
    );

    expect(screen.getByText("Chờ phản hồi")).toBeInTheDocument();
    expect(screen.getByText("Đã nhận")).toBeInTheDocument();
    expect(screen.getByText("Từ chối")).toBeInTheDocument();
  });
});
