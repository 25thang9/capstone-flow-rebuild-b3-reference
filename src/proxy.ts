import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Kiểm tra "lạc quan" ở tầng proxy (tên mới của middleware trong Next.js 16):
 * chưa có cookie phiên thì chuyển ngay về trang đăng nhập, khỏi phải render trang.
 *
 * Đây KHÔNG phải lớp bảo mật: cookie có thể bị giả. Quyền thật sự được kiểm tra
 * lại trong src/lib/dal.ts ở mọi page, Server Action và Route Handler.
 */
export function proxy(request: NextRequest) {
  if (getSessionCookie(request)) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/lecturer/:path*", "/admin/:path*", "/my-registrations/:path*"],
};
