import { describe, expect, it } from "vitest";

import { parseRegistrationFilters, registrationFilterParams } from "@/features/registrations/filters";
import {
  hasActiveFilters,
  parseLecturerTopicFilters,
  parseTopicFilters,
  topicFilterParams,
} from "@/features/topics/filters";
import { parseUserFilters } from "@/features/users/filters";

describe("parseTopicFilters", () => {
  it("không có tham số thì dùng mặc định: đề tài đang nhận, trang 1", () => {
    expect(parseTopicFilters({})).toEqual({ q: "", department: "", tag: "", status: "OPEN", page: 1 });
  });

  it("đọc đủ bộ lọc từ URL", () => {
    expect(
      parseTopicFilters({ q: "  esp32 ", department: "vat-ly-dien-tu", tag: "iot", status: "all", page: "2" }),
    ).toEqual({ q: "esp32", department: "vat-ly-dien-tu", tag: "iot", status: "ALL", page: 2 });
  });

  it("bỏ qua slug và trạng thái không hợp lệ thay vì báo lỗi", () => {
    const filters = parseTopicFilters({ department: "Vật lý'; DROP TABLE", tag: "../x", status: "HACK" });
    expect(filters).toMatchObject({ department: "", tag: "", status: "OPEN" });
  });

  it("cắt từ khoá quá dài và lấy giá trị đầu khi tham số lặp lại", () => {
    const filters = parseTopicFilters({ q: ["a".repeat(300), "b"] });
    expect(filters.q).toHaveLength(100);
  });
});

describe("hasActiveFilters / topicFilterParams", () => {
  it("bộ lọc mặc định không tính là đang lọc", () => {
    expect(hasActiveFilters(parseTopicFilters({}))).toBe(false);
    expect(hasActiveFilters(parseTopicFilters({ status: "ALL" }))).toBe(true);
    expect(hasActiveFilters(parseTopicFilters({ q: "laser" }))).toBe(true);
  });

  it("lược bỏ trạng thái mặc định khi dựng lại URL", () => {
    expect(topicFilterParams(parseTopicFilters({ q: "laser" })).status).toBe("");
    expect(topicFilterParams(parseTopicFilters({ status: "CLOSED" }), 3)).toMatchObject({ status: "CLOSED", page: 3 });
  });
});

describe("bộ lọc khu giảng viên và quản trị", () => {
  it("đề tài của giảng viên mặc định hiện tất cả trạng thái", () => {
    expect(parseLecturerTopicFilters({}).status).toBe("ALL");
    expect(parseLecturerTopicFilters({ status: "closed" }).status).toBe("CLOSED");
  });

  it("đăng ký: chỉ nhận trạng thái có thật và mã đề tài đúng dạng", () => {
    expect(parseRegistrationFilters({ status: "pending", topic: "cmabc123" })).toMatchObject({
      status: "PENDING",
      topicId: "cmabc123",
    });
    expect(parseRegistrationFilters({ status: "DELETED", topic: "x' OR 1=1" })).toMatchObject({
      status: "ALL",
      topicId: "",
    });
  });

  it("đăng ký: dựng lại tham số URL bỏ giá trị mặc định", () => {
    expect(registrationFilterParams(parseRegistrationFilters({}))).toEqual({ q: "", status: "", topic: "", page: 1 });
  });

  it("người dùng: vai trò lạ được coi là tất cả", () => {
    expect(parseUserFilters({ role: "lecturer" }).role).toBe("LECTURER");
    expect(parseUserFilters({ role: "ROOT" }).role).toBe("ALL");
  });
});
