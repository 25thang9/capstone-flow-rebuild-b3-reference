import { describe, expect, it } from "vitest";

import {
  canWithdraw,
  checkCanRegister,
  checkCanRespond,
  checkTopicCapacity,
  getAvailability,
  remainingSlots,
  willFillTopic,
} from "@/features/registrations/rules";

const openTopic = { status: "OPEN", maxStudents: 3, acceptedCount: 1 } as const;

describe("remainingSlots / getAvailability", () => {
  it("tính số chỗ còn lại", () => {
    expect(remainingSlots({ maxStudents: 3, acceptedCount: 1 })).toBe(2);
  });

  it("không bao giờ trả số âm khi dữ liệu lệch (đã nhận nhiều hơn tối đa)", () => {
    expect(remainingSlots({ maxStudents: 2, acceptedCount: 5 })).toBe(0);
  });

  it("đề tài mở và còn chỗ là OPEN", () => {
    expect(getAvailability(openTopic)).toBe("OPEN");
  });

  it("đề tài đóng nhưng còn chỗ là CLOSED", () => {
    expect(getAvailability({ ...openTopic, status: "CLOSED" })).toBe("CLOSED");
  });

  it("hết chỗ luôn là FULL, kể cả khi trạng thái vẫn OPEN", () => {
    expect(getAvailability({ status: "OPEN", maxStudents: 2, acceptedCount: 2 })).toBe("FULL");
    expect(getAvailability({ status: "CLOSED", maxStudents: 2, acceptedCount: 2 })).toBe("FULL");
  });
});

describe("checkCanRegister", () => {
  const base = { role: "STUDENT", topic: openTopic, alreadyRegistered: false } as const;

  it("sinh viên đăng ký được đề tài mở còn chỗ", () => {
    expect(checkCanRegister(base)).toBeNull();
  });

  it("khách chưa đăng nhập bị chặn", () => {
    expect(checkCanRegister({ ...base, role: null })).toBe("NOT_SIGNED_IN");
  });

  it("giảng viên và quản trị viên không đăng ký được", () => {
    expect(checkCanRegister({ ...base, role: "LECTURER" })).toBe("NOT_STUDENT");
    expect(checkCanRegister({ ...base, role: "ADMIN" })).toBe("NOT_STUDENT");
  });

  it("không đăng ký hai lần cùng một đề tài", () => {
    expect(checkCanRegister({ ...base, alreadyRegistered: true })).toBe("ALREADY_REGISTERED");
  });

  it("đề tài đủ sinh viên thì báo FULL trước khi báo CLOSED", () => {
    const full = { status: "CLOSED", maxStudents: 2, acceptedCount: 2 } as const;
    expect(checkCanRegister({ ...base, topic: full })).toBe("TOPIC_FULL");
  });

  it("đề tài đã đóng không nhận đăng ký", () => {
    expect(checkCanRegister({ ...base, topic: { ...openTopic, status: "CLOSED" } })).toBe("TOPIC_CLOSED");
  });
});

describe("canWithdraw", () => {
  it("chỉ rút được khi giảng viên chưa phản hồi", () => {
    expect(canWithdraw("PENDING")).toBe(true);
    expect(canWithdraw("ACCEPTED")).toBe(false);
    expect(canWithdraw("REJECTED")).toBe(false);
  });
});

describe("checkCanRespond / willFillTopic", () => {
  const topic = { maxStudents: 2, acceptedCount: 1 };

  it("nhận được khi còn chỗ", () => {
    expect(checkCanRespond({ current: "PENDING", next: "ACCEPTED", topic })).toBeNull();
  });

  it("không nhận thêm khi đã đủ số lượng", () => {
    const full = { maxStudents: 2, acceptedCount: 2 };
    expect(checkCanRespond({ current: "PENDING", next: "ACCEPTED", topic: full })).toBe("TOPIC_FULL");
  });

  it("từ chối luôn được phép, kể cả khi đề tài đã đủ", () => {
    const full = { maxStudents: 2, acceptedCount: 2 };
    expect(checkCanRespond({ current: "PENDING", next: "REJECTED", topic: full })).toBeNull();
  });

  it("không đổi sang đúng trạng thái hiện tại", () => {
    expect(checkCanRespond({ current: "ACCEPTED", next: "ACCEPTED", topic })).toBe("SAME_STATUS");
  });

  it("nhận sinh viên cuối cùng thì đề tài đầy", () => {
    expect(willFillTopic({ next: "ACCEPTED", topic })).toBe(true);
    expect(willFillTopic({ next: "ACCEPTED", topic: { maxStudents: 3, acceptedCount: 1 } })).toBe(false);
    expect(willFillTopic({ next: "REJECTED", topic })).toBe(false);
  });
});

describe("checkTopicCapacity", () => {
  it("không cho giảm số lượng xuống dưới số đã nhận", () => {
    expect(checkTopicCapacity({ status: "CLOSED", maxStudents: 1, acceptedCount: 2 })).toBe("BELOW_ACCEPTED");
  });

  it("không cho mở lại đề tài đã đủ sinh viên", () => {
    expect(checkTopicCapacity({ status: "OPEN", maxStudents: 2, acceptedCount: 2 })).toBe("OPEN_WHILE_FULL");
  });

  it("đề tài đủ sinh viên vẫn lưu được nếu để ở trạng thái đóng", () => {
    expect(checkTopicCapacity({ status: "CLOSED", maxStudents: 2, acceptedCount: 2 })).toBeNull();
  });

  it("đề tài mới chưa ai đăng ký thì luôn hợp lệ", () => {
    expect(checkTopicCapacity({ status: "OPEN", maxStudents: 1, acceptedCount: 0 })).toBeNull();
  });
});
