import type { RegistrationStatus, Role, TopicStatus } from "@/generated/prisma/enums";

/**
 * Luật nghiệp vụ của việc đăng ký đề tài, viết thành hàm thuần (không đụng database)
 * để giao diện và Server Action dùng chung một bộ luật, và để unit test dễ dàng.
 */

export type TopicCapacity = {
  status: TopicStatus;
  maxStudents: number;
  /** Số đăng ký đang ở trạng thái ACCEPTED. */
  acceptedCount: number;
};

export type Availability = "OPEN" | "FULL" | "CLOSED";

export function remainingSlots(topic: Pick<TopicCapacity, "maxStudents" | "acceptedCount">): number {
  return Math.max(0, topic.maxStudents - topic.acceptedCount);
}

/** "Đã đủ" được ưu tiên hơn "Đã đóng" vì nó cho sinh viên biết lý do rõ hơn. */
export function getAvailability(topic: TopicCapacity): Availability {
  if (remainingSlots(topic) === 0) return "FULL";
  return topic.status === "OPEN" ? "OPEN" : "CLOSED";
}

// ───────────── Sinh viên gửi đăng ký ─────────────

export type RegisterBlock =
  | "NOT_SIGNED_IN"
  | "NOT_STUDENT"
  | "ALREADY_REGISTERED"
  | "TOPIC_FULL"
  | "TOPIC_CLOSED";

export const REGISTER_BLOCK_MESSAGE: Record<RegisterBlock, string> = {
  NOT_SIGNED_IN: "Bạn cần đăng nhập bằng tài khoản sinh viên để đăng ký.",
  NOT_STUDENT: "Chỉ tài khoản sinh viên mới đăng ký được đề tài.",
  ALREADY_REGISTERED: "Bạn đã đăng ký đề tài này rồi.",
  TOPIC_FULL: "Đề tài đã nhận đủ sinh viên.",
  TOPIC_CLOSED: "Đề tài hiện không nhận đăng ký mới.",
};

/** Trả về lý do KHÔNG được đăng ký, hoặc null nếu được phép. */
export function checkCanRegister(input: {
  role: Role | null;
  topic: TopicCapacity;
  alreadyRegistered: boolean;
}): RegisterBlock | null {
  if (input.role === null) return "NOT_SIGNED_IN";
  if (input.role !== "STUDENT") return "NOT_STUDENT";
  if (input.alreadyRegistered) return "ALREADY_REGISTERED";
  if (remainingSlots(input.topic) === 0) return "TOPIC_FULL";
  if (input.topic.status !== "OPEN") return "TOPIC_CLOSED";
  return null;
}

/** Sinh viên chỉ được rút đăng ký khi giảng viên chưa phản hồi. */
export function canWithdraw(status: RegistrationStatus): boolean {
  return status === "PENDING";
}

// ───────────── Giảng viên phản hồi ─────────────

export type RespondBlock = "SAME_STATUS" | "TOPIC_FULL";

export const RESPOND_BLOCK_MESSAGE: Record<RespondBlock, string> = {
  SAME_STATUS: "Đăng ký này đã ở trạng thái đó.",
  TOPIC_FULL: "Đề tài đã nhận đủ số sinh viên. Hãy tăng số lượng nếu muốn nhận thêm.",
};

/**
 * @param topic.acceptedCount số sinh viên đã nhận, KHÔNG tính đăng ký đang xử lý.
 */
export function checkCanRespond(input: {
  current: RegistrationStatus;
  next: RegistrationStatus;
  topic: Pick<TopicCapacity, "maxStudents" | "acceptedCount">;
}): RespondBlock | null {
  if (input.current === input.next) return "SAME_STATUS";
  if (input.next === "ACCEPTED" && remainingSlots(input.topic) === 0) return "TOPIC_FULL";
  return null;
}

/** Nhận thêm sinh viên này có làm đề tài đủ chỗ (và cần tự đóng) hay không. */
export function willFillTopic(input: {
  next: RegistrationStatus;
  topic: Pick<TopicCapacity, "maxStudents" | "acceptedCount">;
}): boolean {
  return input.next === "ACCEPTED" && input.topic.acceptedCount + 1 >= input.topic.maxStudents;
}

// ───────────── Giảng viên sửa đề tài ─────────────

export type TopicSaveBlock = "BELOW_ACCEPTED" | "OPEN_WHILE_FULL";

/** Không cho giảm số lượng xuống dưới số đã nhận, và không cho mở đề tài đã đủ chỗ. */
export function checkTopicCapacity(topic: TopicCapacity): TopicSaveBlock | null {
  if (topic.maxStudents < topic.acceptedCount) return "BELOW_ACCEPTED";
  if (topic.status === "OPEN" && topic.acceptedCount >= topic.maxStudents) return "OPEN_WHILE_FULL";
  return null;
}
