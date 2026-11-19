# AI_LOG – Nhật ký sử dụng AI

> Mức AI của bài này: Mức 4 – AI toàn phần có kiểm soát (xem Hướng dẫn sử dụng AI của môn học).
> Khai báo trung thực không bị trừ điểm. Không khai báo = vi phạm liêm chính học thuật.

Mỗi thành viên tự ghi phần của mình vào bảng dưới đây, mỗi lần dùng AI một dòng.

| Ngày | Thành viên | Công cụ | Việc nhờ AI | Prompt (tóm tắt) | Kết quả dùng thế nào | Mình đã kiểm chứng / sửa gì | Commit/PR |
|---|---|---|---|---|---|---|---|
| 2026-11-15 | (ghi tên người chạy phiên này) | Claude Code (Claude Fable 5.2) | Dựng lại toàn bộ bản nền trên nhánh `rebuild/b3-reference` để làm bản tham chiếu theo yêu cầu B.3: chuyển sang TypeScript, Tailwind v4 + shadcn/ui, Prisma 7, Better Auth 3 vai trò; thiết kế lại giao diện; viết unit/component/E2E test, CI, AGENTS.md, README | "Clone repo, làm lại giao diện chỉn chu nhưng không quá AI, phù hợp phạm vi đồ án môn học, đề xuất chỗ sai logic" + gửi đề bài PDF và chọn phương án "bản tham chiếu đủ B.3" | AI sinh gần như toàn bộ mã của nhánh này. Dùng làm BẢN THAM CHIẾU; chưa merge vào `main` | AI đã tự chạy: lint, typecheck, 85 unit/component test, 10 kịch bản E2E, build production, mở từng trang trên trình duyệt. **Thành viên chưa tự kiểm chứng** – cần đọc hiểu, chạy lại và ghi kết quả vào đây trước khi dùng | chưa commit |
| 2026-11-19 | Nguyễn Nhật Đăng | Copilot SDK trong VS Code | Hoàn thiện giao diện trang chủ và điều hướng responsive: hero, 4 thẻ đề tài, hai logo ở header, menu mobile tích hợp tài khoản và đổi theme | "Chỉnh giao diện trang chủ và header theo các yêu cầu: đưa Tự xuống dòng mới, cân kích thước hai logo, gom điều hướng vào menu trên màn hình nhỏ" | Dùng các thay đổi giao diện và test được cập nhật trên nhánh `main` | AI đã chạy lint, typecheck và Vitest: 88 test đạt. Thành viên cần tự đọc hiểu và kiểm tra giao diện trước khi nộp | [b23ec86](https://github.com/LinhHoang28/capstone-flow-rebuild-b3-reference/commit/b23ec8689550d1636d385e406d562d20b5c690a7) |
| 2026-11-20 | Nguyễn Hoàng Châu | ChatGPT (GPT-6) | Hướng dẫn bổ sung mã số sinh viên, giảng viên tại trang quản trị | "Hướng dẫn từng file để thêm institutionCode vào Prisma, seed, queries và bảng người dùng" | Tự chỉnh sửa code trong VS Code theo hướng dẫn, bổ sung migration và kiểm tra giao diện | Đã kiểm tra mã số hiển thị trên localhost, kiểm tra dữ liệu Neon; bổ sung kết quả lint/typecheck/test/build sau khi chạy | PR đang tạo |
## Lưu ý khi dùng bản tham chiếu 

- Đề bài không chấp nhận việc dùng công cụ sinh toàn bộ ứng dụng, và chỉ tính điểm phần mỗi người giải thích được khi vấn đáp. Vì vậy nhánh này để đọc, đối chiếu và học cách làm; phần nộp phải do từng thành viên tự đưa vào qua PR của mình (mỗi người ≥ 5 PR, ≥ 5 lần review) và hiểu rõ từng dòng.
- Khi chép hay phỏng theo đoạn nào từ nhánh này, ghi một dòng vào bảng trên: lấy phần nào, đã sửa gì, đã kiểm chứng bằng cách nào.

## Tự đánh giá cuối bài

Mỗi thành viên viết một mục riêng.

### Nguyễn Nhật Đăng
- Phần mình tự làm hoàn toàn:
- Phần AI giúp nhiều nhất và mình đã hiểu nó thế nào:
- Một lần AI sai và cách mình phát hiện:
