import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { MobileNavMenu } from "@/components/layout/mobile-nav-menu";

describe("MobileNavMenu", () => {
  it("mở menu, hiện các tuỳ chọn và đóng lại khi chọn liên kết", async () => {
    const user = userEvent.setup();
    render(
      <MobileNavMenu links={[{ href: "/topics", label: "Kho đề tài" }]}>
        <a href="/login">Đăng nhập</a>
        <button type="button">Đổi giao diện</button>
      </MobileNavMenu>,
    );

    const trigger = screen.getByRole("button", { name: "Mở menu điều hướng" });
    await user.click(trigger);

    expect(screen.getByRole("button", { name: "Đóng menu điều hướng" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "Kho đề tài" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Đăng nhập" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Đổi giao diện" })).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Kho đề tài" }));
    expect(screen.getByRole("button", { name: "Mở menu điều hướng" })).toHaveAttribute("aria-expanded", "false");
  });

  it("đóng bằng Escape và trả tiêu điểm về nút menu", async () => {
    const user = userEvent.setup();
    render(<MobileNavMenu links={[]}><span>Menu</span></MobileNavMenu>);

    const trigger = screen.getByRole("button", { name: "Mở menu điều hướng" });
    await user.click(trigger);
    await user.keyboard("{Escape}");

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });
});
