<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Luật dự án (PHY10615 – Phát triển ứng dụng web)

### Phiên bản & công nghệ (không tự ý đổi)
- Next.js 16.4 App Router, React 19, TypeScript. KHÔNG dùng pages router, getServerSideProps, next/router; dùng proxy.ts (không có middleware.ts).
- Tailwind CSS v4 cấu hình bằng CSS (@theme). KHÔNG tạo tailwind.config.js.
- shadcn/ui dùng Radix: npx shadcn@latest add <component>.
- Prisma ORM 7 (KHÔNG nâng lên 8): generator "prisma-client" có output, adapter @prisma/adapter-pg, URL trong prisma.config.ts.
- Better Auth 1.7 (KHÔNG dùng NextAuth/Auth.js). Session: auth.api.getSession({ headers: await headers() }).
- Zod 4: z.flattenError(), { error: "..." }, z.email().
- Test: Vitest 5 + React Testing Library; E2E: Playwright.

### Bảo mật (bắt buộc)
- Mọi Server Action và Route Handler: gọi requireUser() / requireRole() trước, validate input bằng Zod, mọi truy vấn lọc theo userId lấy từ session.
- Sửa/xoá dùng updateMany/deleteMany với where: { id, <cột chủ sở hữu> } và kiểm tra count.
- Không đưa bí mật vào biến NEXT_PUBLIC_*; không commit .env.
- Không dùng dangerouslySetInnerHTML hoặc $queryRawUnsafe.

### Quy trình
- Trước khi kết thúc: chạy npm run lint, npm run typecheck, npx vitest run.
- Thay đổi logic nghiệp vụ phải kèm test.
- Không tự cài gói npm mới: nêu tên gói, lý do, link npm và chờ người dùng xác nhận.
- Tóm tắt thay đổi ngắn gọn để sinh viên ghi vào AI_LOG.md.

## Quy ước riêng của CapstoneFlow

### Cấu trúc thư mục
- `src/app/` chỉ chứa route (page, layout, route handler). Trang nên mỏng: lấy dữ liệu từ `features/*/queries.ts`, ghép component.
- `src/features/<tên>/` gom mọi thứ của một nghiệp vụ: `schema.ts` (Zod), `rules.ts` (luật nghiệp vụ, hàm thuần), `filters.ts` (đọc searchParams), `queries.ts` (đọc database), `actions.ts` (Server Action), `components/`.
- `src/components/ui/` là mã do shadcn sinh ra; `src/components/shared/` và `src/components/layout/` là component dùng chung của dự án.
- `src/lib/` là hạ tầng: `dal.ts` (phiên và quyền), `auth.ts`, `prisma.ts`, `pagination.ts`, `action-state.ts`.

### Phân quyền
- Ba vai trò: STUDENT, LECTURER, ADMIN (`src/generated/prisma/enums`). Vai trò chỉ đổi qua `changeRoleAction`.
- `src/lib/dal.ts` là nơi DUY NHẤT đọc phiên. Không đọc cookie hay gọi auth.api.getSession ở chỗ khác.
- Không dựa vào layout hay `proxy.ts` để bảo vệ dữ liệu: kiểm tra quyền nằm trong chính hàm truy vấn / action.
- Trang công khai chỉ `select` đúng cột cần hiển thị; không trả email hay số điện thoại ra ngoài khu giảng viên.

### Dữ liệu và form
- Bộ lọc và phân trang nằm trên URL (searchParams), đọc bằng hàm `parse…Filters` và lọc ở server. Không giữ bộ lọc trong state.
- Luật nghiệp vụ viết thành hàm thuần trong `rules.ts`, có unit test trong `tests/unit/`; giao diện và action dùng chung hàm đó.
- Form dùng `useActionState` + Server Action trả `ActionState`; lỗi hiển thị dưới từng ô, không dùng `alert()`.
- Thao tác khó hoàn tác (xoá, rút đăng ký) đi qua `ConfirmAction`.

### Giao diện
- Bật Cache Components: phần đọc database, phiên đăng nhập, `params`, `searchParams` phải nằm trong `<Suspense>` có khung chờ. Không dùng `new Date()` trong phần khung tĩnh.
- Màu, bo góc, phông chữ lấy từ token trong `src/app/globals.css`. Không viết mã màu trực tiếp trong component, không thêm gradient, đổ bóng trang trí hay emoji làm icon.
- Mọi ô nhập có nhãn; trạng thái luôn kèm chữ (không chỉ dùng màu); kiểm tra bằng bàn phím trước khi mở PR.
- Chuỗi hiển thị viết bằng tiếng Việt có dấu; ngày giờ định dạng qua `src/lib/text.ts` (múi giờ Việt Nam).
