import type { RegistrationStatus, TopicStatus } from "@/generated/prisma/enums";
import type { Availability } from "@/features/registrations/rules";

export const TOPIC_STATUS_LABEL: Record<TopicStatus, string> = {
  OPEN: "Đang nhận",
  CLOSED: "Đã đóng",
};

export const AVAILABILITY_LABEL: Record<Availability, string> = {
  OPEN: "Đang nhận",
  FULL: "Đã đủ",
  CLOSED: "Đã đóng",
};

export const REGISTRATION_STATUS_LABEL: Record<RegistrationStatus, string> = {
  PENDING: "Chờ phản hồi",
  ACCEPTED: "Đã nhận",
  REJECTED: "Từ chối",
};
