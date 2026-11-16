import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TopicList } from "@/features/topics/components/topic-list";
import type { TopicCardData } from "@/features/topics/queries";

function makeTopic(overrides: Partial<TopicCardData> = {}): TopicCardData {
  return {
    id: "topic-1",
    title: "Hệ đo nhiệt độ dùng ESP32",
    description: "Thu thập nhiệt độ và hiển thị trên web.",
    maxStudents: 3,
    status: "OPEN",
    updatedAt: new Date("2026-11-10T02:00:00.000Z"),
    lecturer: { name: "Trần Minh Khoa" },
    department: { name: "Vật lý Điện tử", slug: "vat-ly-dien-tu" },
    tags: [
      { name: "ESP32", slug: "esp32" },
      { name: "IoT", slug: "iot" },
    ],
    _count: { registrations: 1 },
    ...overrides,
  };
}

describe("TopicList", () => {
  it("mỗi đề tài có liên kết tới trang chi tiết và đủ thông tin chính", () => {
    render(<TopicList topics={[makeTopic()]} />);

    const link = screen.getByRole("link", { name: "Hệ đo nhiệt độ dùng ESP32" });
    expect(link).toHaveAttribute("href", "/topics/topic-1");
    const row = link.closest("li") as HTMLElement;
    expect(within(row).getByText("Trần Minh Khoa")).toBeInTheDocument();
    expect(within(row).getByText("1/3 sinh viên")).toBeInTheDocument();
    expect(within(row).getByText("10/11/2026")).toBeInTheDocument();
    expect(within(row).getByText("Đang nhận")).toBeInTheDocument();
  });

  it("hiện danh sách thẻ của đề tài", () => {
    render(<TopicList topics={[makeTopic()]} />);
    const tags = within(screen.getByRole("list", { name: "Thẻ" })).getAllByRole("listitem");
    expect(tags.map((tag) => tag.textContent)).toEqual(["ESP32", "IoT"]);
  });

  it("đề tài nhận đủ sinh viên hiện nhãn “Đã đủ” dù trạng thái vẫn OPEN", () => {
    render(<TopicList topics={[makeTopic({ maxStudents: 2, _count: { registrations: 2 } })]} />);
    expect(screen.getByText("Đã đủ")).toBeInTheDocument();
    expect(screen.queryByText("Đang nhận")).not.toBeInTheDocument();
  });

  it("đề tài đã đóng hiện nhãn “Đã đóng”", () => {
    render(<TopicList topics={[makeTopic({ status: "CLOSED" })]} />);
    expect(screen.getByText("Đã đóng")).toBeInTheDocument();
  });
});
