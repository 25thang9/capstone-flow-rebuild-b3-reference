import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/dal";
import { ROLE_LABEL } from "@/lib/roles";

import { UserMenu } from "./user-menu";

const WORKSPACE_LINK = {
  STUDENT: { href: "/my-registrations", label: "Đăng ký của tôi" },
  LECTURER: { href: "/lecturer", label: "Khu giảng viên" },
  ADMIN: { href: "/admin", label: "Quản trị" },
} as const;

/** Góc phải của header: nút đăng nhập, hoặc lối vào khu làm việc + menu tài khoản. */
export async function UserNav({ mobile = false }: { mobile?: boolean } = {}) {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <>
        <Button asChild variant="ghost">
          <Link href="/login" className={mobile ? "w-full justify-start" : undefined}>
            Đăng nhập
          </Link>
        </Button>
        <Button asChild className={mobile ? "w-full justify-start" : undefined}>
          <Link href="/register">Đăng ký</Link>
        </Button>
      </>
    );
  }

  const workspace = WORKSPACE_LINK[user.role];
  return (
    <>
      {mobile ? null : (
        <Button asChild variant="outline" className="hidden sm:inline-flex">
          <Link href={workspace.href}>{workspace.label}</Link>
        </Button>
      )}
      <UserMenu
        name={user.name}
        email={user.email}
        roleLabel={ROLE_LABEL[user.role]}
        workspace={workspace}
        mobile={mobile}
      />
    </>
  );
}
