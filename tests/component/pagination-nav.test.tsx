import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PaginationNav } from "@/components/shared/pagination-nav";
import { paginate } from "@/lib/pagination";

describe("PaginationNav", () => {
  it("giữ nguyên bộ lọc trên mọi liên kết chuyển trang", () => {
    render(<PaginationNav pagination={paginate(22, 2, 8)} pathname="/topics" params={{ q: "esp32", status: "ALL" }} />);

    expect(screen.getByRole("link", { name: /Trước/ })).toHaveAttribute("href", "/topics?q=esp32&status=ALL");
    expect(screen.getByRole("link", { name: /Sau/ })).toHaveAttribute("href", "/topics?q=esp32&status=ALL&page=3");
    expect(screen.getByRole("link", { name: "Trang 2" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("Hiển thị 9–16 trong 22 kết quả")).toBeInTheDocument();
  });

  it("ở trang đầu, nút Trước bị vô hiệu và không phải là liên kết", () => {
    render(<PaginationNav pagination={paginate(22, 1, 8)} pathname="/topics" />);

    expect(screen.queryByRole("link", { name: /Trước/ })).not.toBeInTheDocument();
    expect(screen.getByText("Trước")).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("link", { name: /Sau/ })).toHaveAttribute("href", "/topics?page=2");
  });

  it("chỉ một trang thì hiện tổng số, không hiện nút chuyển trang", () => {
    render(<PaginationNav pagination={paginate(5, 1, 8)} pathname="/topics" />);

    expect(screen.getByText("Hiển thị 1–5 trong 5 kết quả")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("không có kết quả thì không hiển thị gì", () => {
    const { container } = render(<PaginationNav pagination={paginate(0, 1, 8)} pathname="/topics" />);
    expect(container).toBeEmptyDOMElement();
  });
});
