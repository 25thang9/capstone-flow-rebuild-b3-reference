import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FilterForm } from "@/components/shared/filter-form";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

function renderForm() {
  render(
    <FilterForm pathname="/topics" defaults={{ status: "OPEN" }}>
      <label htmlFor="q">Từ khoá</label>
      <input id="q" name="q" type="search" />
      <label htmlFor="status">Trạng thái</label>
      <select id="status" name="status" defaultValue="OPEN">
        <option value="OPEN">Đang nhận</option>
        <option value="ALL">Tất cả</option>
      </select>
      <button type="submit">Lọc</button>
    </FilterForm>,
  );
}

describe("FilterForm", () => {
  beforeEach(() => push.mockClear());

  it("gửi form đưa bộ lọc lên URL, bỏ ô rỗng và giá trị mặc định", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText("Từ khoá"), "  esp32 ");
    await user.click(screen.getByRole("button", { name: "Lọc" }));

    expect(push).toHaveBeenCalledExactlyOnceWith("/topics?q=esp32");
  });

  it("đổi ô chọn là áp dụng ngay, không cần bấm Lọc", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.selectOptions(screen.getByLabelText("Trạng thái"), "ALL");

    expect(push).toHaveBeenCalledExactlyOnceWith("/topics?status=ALL");
  });

  it("không lọc gì thì quay về URL gốc", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: "Lọc" }));

    expect(push).toHaveBeenCalledExactlyOnceWith("/topics");
  });

  it("vẫn là form GET thật để chạy được khi chưa tải JavaScript", () => {
    renderForm();
    const form = screen.getByRole("search");
    expect(form).toHaveAttribute("method", "get");
    expect(form).toHaveAttribute("action", "/topics");
  });
});
