import Link from "next/link";

import { ConfirmAction } from "@/components/shared/confirm-action";
import { RegistrationStatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/dal";
import { formatDate } from "@/lib/text";

import { registerAction, withdrawAction } from "../actions";
import { getLastStudentInfo, getStudentRegistration } from "../queries";
import { REGISTER_BLOCK_MESSAGE, type TopicCapacity, canWithdraw, checkCanRegister } from "../rules";
import { RegistrationForm } from "./registration-form";

type RegistrationPanelProps = {
  topicId: string;
  lecturerId: string;
  capacity: TopicCapacity;
};

/**
 * Ô "Đăng ký đề tài" ở trang chi tiết. Nội dung thay đổi theo người xem:
 * khách → mời đăng nhập · sinh viên → form hoặc trạng thái đăng ký · giảng viên/quản trị → ghi chú.
 * Giao diện chỉ để hướng dẫn; quyền thật sự được kiểm tra lại trong registerAction.
 */
export async function RegistrationPanel({ topicId, lecturerId, capacity }: RegistrationPanelProps) {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <Panel title="Đăng ký đề tài">
        <p className="text-sm text-muted-foreground">{REGISTER_BLOCK_MESSAGE.NOT_SIGNED_IN}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild>
            <Link href={`/login?next=/topics/${topicId}`}>Đăng nhập</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/register?next=/topics/${topicId}`}>Tạo tài khoản</Link>
          </Button>
        </div>
      </Panel>
    );
  }

  if (user.role !== "STUDENT") {
    const isOwner = user.role === "LECTURER" && user.id === lecturerId;
    return (
      <Panel title={isOwner ? "Đề tài của bạn" : "Đăng ký đề tài"}>
        {isOwner ? (
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href={`/lecturer/registrations?topic=${topicId}`}>Xem đăng ký</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/lecturer/topics/${topicId}/edit`}>Sửa đề tài</Link>
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{REGISTER_BLOCK_MESSAGE.NOT_STUDENT}</p>
        )}
      </Panel>
    );
  }

  const existing = await getStudentRegistration(user.id, topicId);
  if (existing) {
    return (
      <Panel title="Đăng ký của bạn">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-muted-foreground">Gửi ngày {formatDate(existing.createdAt)}</span>
          <RegistrationStatusBadge status={existing.status} />
        </div>
        {existing.lecturerNote ? (
          <blockquote className="user-text mt-3 border-l-2 border-primary pl-3 text-sm">
            <span className="block text-xs text-muted-foreground">Phản hồi của giảng viên</span>
            {existing.lecturerNote}
          </blockquote>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/my-registrations">Đăng ký của tôi</Link>
          </Button>
          {canWithdraw(existing.status) ? (
            <ConfirmAction
              trigger={<Button variant="ghost">Rút đăng ký</Button>}
              title="Rút đăng ký đề tài này?"
              description="Giảng viên sẽ không còn thấy đăng ký của bạn. Bạn có thể đăng ký lại nếu đề tài còn nhận."
              confirmLabel="Rút đăng ký"
              destructive
              action={withdrawAction.bind(null, existing.id)}
            />
          ) : null}
        </div>
      </Panel>
    );
  }

  const block = checkCanRegister({ role: user.role, topic: capacity, alreadyRegistered: false });
  if (block) {
    return (
      <Panel title="Đăng ký đề tài">
        <p className="text-sm text-muted-foreground">{REGISTER_BLOCK_MESSAGE[block]}</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/topics">Xem đề tài khác</Link>
        </Button>
      </Panel>
    );
  }

  const lastInfo = await getLastStudentInfo(user.id);
  return (
    <Panel title="Đăng ký đề tài">
      <p className="mb-4 text-sm text-muted-foreground">
        Đăng ký bằng tài khoản <span className="font-medium text-foreground">{user.name}</span> ({user.email}).
      </p>
      <RegistrationForm
        action={registerAction.bind(null, topicId)}
        defaults={{
          studentCode: lastInfo?.studentCode ?? "",
          className: lastInfo?.className ?? "",
          phone: lastInfo?.phone ?? "",
        }}
      />
    </Panel>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    // aria-label biến <section> thành một "region" có tên, trình đọc màn hình nhảy tới được.
    <section aria-label={title} className="rounded-lg border bg-card p-5">
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}
