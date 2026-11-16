## Mô tả
<!-- Thay đổi gì, vì sao. Closes #... -->

## Ảnh chụp / video (nếu thay đổi giao diện)

## Cách kiểm tra
- [ ] ...

## Checklist
- [ ] `npm run lint`, `npm run typecheck`, `npx vitest run`, `npm run build` đều qua
- [ ] Server Action / Route Handler mới đều gọi `requireUser()` hoặc `requireRole()` và lọc theo người dùng lấy từ phiên
- [ ] Input được validate bằng Zod ở phía server
- [ ] Có hoặc đã cập nhật test cho logic thay đổi
- [ ] Không có secret trong code; biến môi trường mới đã thêm vào `.env.example`
- [ ] UI mới dùng được bằng bàn phím, có nhãn, đủ tương phản
- [ ] Màu, bo góc, phông chữ lấy từ token trong `src/app/globals.css` (không viết mã màu trực tiếp)

## Sử dụng AI
- Mức AI:
- Công cụ & phần AI hỗ trợ (chi tiết trong AI_LOG.md):
- Mình đã kiểm chứng bằng:
