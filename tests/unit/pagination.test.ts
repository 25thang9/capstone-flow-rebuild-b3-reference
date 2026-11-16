import { describe, expect, it } from "vitest";

import { buildHref, pageWindow, paginate, parsePage } from "@/lib/pagination";

describe("parsePage", () => {
  it("đọc số trang hợp lệ", () => {
    expect(parsePage("3")).toBe(3);
    expect(parsePage(["2", "9"])).toBe(2);
  });

  it("giá trị thiếu hoặc rác đều về trang 1", () => {
    for (const value of [undefined, "", "abc", "-2", "0", "1.5", "2e3", "9999999"]) {
      expect(parsePage(value)).toBe(1);
    }
  });
});

describe("paginate", () => {
  it("tính skip và khoảng hiển thị cho trang giữa", () => {
    expect(paginate(22, 2, 8)).toMatchObject({
      page: 2,
      totalPages: 3,
      skip: 8,
      from: 9,
      to: 16,
      hasPrev: true,
      hasNext: true,
    });
  });

  it("trang cuối chỉ hiển thị phần còn lại", () => {
    expect(paginate(22, 3, 8)).toMatchObject({ from: 17, to: 22, hasNext: false });
  });

  it("trang vượt quá tổng số trang được kéo về trang cuối", () => {
    expect(paginate(22, 99, 8)).toMatchObject({ page: 3, skip: 16 });
  });

  it("không có kết quả vẫn là 1 trang, from/to bằng 0", () => {
    expect(paginate(0, 1, 8)).toMatchObject({ page: 1, totalPages: 1, from: 0, to: 0, hasPrev: false, hasNext: false });
  });
});

describe("pageWindow", () => {
  it("ít trang thì liệt kê hết", () => {
    expect(pageWindow(2, 3)).toEqual([1, 2, 3]);
  });

  it("nhiều trang thì rút gọn bằng dấu ba chấm hai phía", () => {
    expect(pageWindow(6, 12)).toEqual([1, "ellipsis", 5, 6, 7, "ellipsis", 12]);
  });

  it("khoảng trống đúng một trang thì hiện luôn số trang đó thay vì dấu ba chấm", () => {
    expect(pageWindow(3, 6)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(pageWindow(2, 8)).toEqual([1, 2, 3, "ellipsis", 8]);
  });
});

describe("buildHref", () => {
  it("bỏ tham số rỗng và page=1 để URL gọn", () => {
    expect(buildHref("/topics", { q: "", department: null, tag: undefined, page: 1 })).toBe("/topics");
  });

  it("giữ bộ lọc khi sang trang khác và mã hoá ký tự đặc biệt", () => {
    expect(buildHref("/topics", { q: "xử lý ảnh", status: "ALL", page: 2 })).toBe(
      "/topics?q=x%E1%BB%AD+l%C3%BD+%E1%BA%A3nh&status=ALL&page=2",
    );
  });
});
