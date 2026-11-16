/**
 * Dữ liệu mẫu cho CapstoneFlow.  Chạy: npx prisma db seed
 *
 * - Chạy lại nhiều lần không nhân bản dữ liệu (tài khoản upsert theo email; đề tài chỉ tạo khi bảng trống).
 * - SEED_RESET=1 xoá sạch dữ liệu trước khi tạo lại – dùng cho database kiểm thử E2E, KHÔNG dùng cho production.
 * - Mọi tài khoản demo dùng chung mật khẩu SEED_PASSWORD trong .env. Tên người là tên giả.
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "better-auth/crypto";

import { PrismaClient } from "../src/generated/prisma/client";
import type { RegistrationStatus, Role, TopicStatus } from "../src/generated/prisma/enums";
import { slugify } from "../src/lib/text";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const DAY = 24 * 60 * 60 * 1000;
// Mốc thời gian cố định để thứ tự "mới cập nhật" giống nhau ở mọi máy.
const BASE_TIME = new Date("2026-11-10T02:00:00.000Z").getTime();

const ACCOUNTS: { email: string; name: string; role: Role }[] = [
  { email: "admin@example.com", name: "Quản trị Khoa", role: "ADMIN" },
  { email: "gv.khoa@example.com", name: "Trần Minh Khoa", role: "LECTURER" },
  { email: "gv.ha@example.com", name: "Lê Thị Thu Hà", role: "LECTURER" },
  { email: "gv.bao@example.com", name: "Phạm Quốc Bảo", role: "LECTURER" },
  { email: "gv.yen@example.com", name: "Nguyễn Hoàng Yến", role: "LECTURER" },
  { email: "sv.an@example.com", name: "Nguyễn Văn An", role: "STUDENT" },
  { email: "sv.bich@example.com", name: "Trần Thị Bích", role: "STUDENT" },
  { email: "sv.cuong@example.com", name: "Lê Hoàng Cường", role: "STUDENT" },
  { email: "sv.dung@example.com", name: "Phạm Thuỳ Dung", role: "STUDENT" },
  { email: "sv.duc@example.com", name: "Võ Minh Đức", role: "STUDENT" },
  { email: "sv.han@example.com", name: "Đặng Gia Hân", role: "STUDENT" },
  { email: "sv.huy@example.com", name: "Bùi Quang Huy", role: "STUDENT" },
  { email: "sv.lan@example.com", name: "Hồ Ngọc Lan", role: "STUDENT" },
];

const DEPARTMENTS = [
  "Vật lý Tin học",
  "Vật lý Điện tử",
  "Vật lý Hạt nhân",
  "Vật lý Ứng dụng",
  "Vật lý Lý thuyết",
  "Vật lý Chất rắn",
];

const TAGS = [
  "Python", "C/C++", "MATLAB", "LabVIEW", "ESP32", "Arduino", "IoT", "Học máy",
  "Xử lý tín hiệu", "Xử lý ảnh", "Monte Carlo", "Geant4", "COMSOL", "Next.js",
  "PostgreSQL", "Thiết kế mạch", "Quang học",
];

type TopicSeed = {
  title: string;
  description: string;
  objectives: string;
  requirements: string;
  department: string;
  tags: string[];
  lecturer: string;
  maxStudents: number;
  status?: TopicStatus;
};

const TOPICS: TopicSeed[] = [
  {
    title: "Hệ đo nhiệt độ – độ ẩm phòng thí nghiệm dùng ESP32, hiển thị trên web",
    description:
      "Xây dựng hệ thống thu thập nhiệt độ, độ ẩm tại nhiều điểm trong phòng thí nghiệm bằng cảm biến SHT31 và vi điều khiển ESP32. Dữ liệu gửi về máy chủ qua Wi-Fi, lưu vào cơ sở dữ liệu và hiển thị bằng đồ thị thời gian thực trên trình duyệt.",
    objectives: "Hoàn thiện 3 nút đo chạy ổn định 72 giờ.\nTrang web xem đồ thị theo giờ, ngày, tuần.\nCảnh báo khi vượt ngưỡng cài đặt.",
    requirements: "Đã học Kỹ thuật vi điều khiển.\nBiết lập trình C cơ bản; ưu tiên sinh viên từng làm web.",
    department: "Vật lý Điện tử",
    tags: ["ESP32", "IoT", "Next.js", "PostgreSQL"],
    lecturer: "gv.khoa@example.com",
    maxStudents: 3,
  },
  {
    title: "Mô phỏng Monte Carlo che chắn bức xạ gamma bằng Geant4",
    description:
      "Dùng bộ công cụ Geant4 mô phỏng sự suy giảm chùm gamma năng lượng 0,662 MeV và 1,25 MeV qua các vật liệu che chắn (chì, bê tông barit, vật liệu composite). So sánh hệ số suy giảm khối mô phỏng với số liệu NIST XCOM.",
    objectives: "Dựng mô hình hình học và nguồn trong Geant4.\nTính hệ số suy giảm cho ít nhất 4 vật liệu.\nĐánh giá sai số so với XCOM.",
    requirements: "Đã học Vật lý hạt nhân đại cương.\nBiết C++ ở mức đọc hiểu và sửa được mã mẫu.",
    department: "Vật lý Hạt nhân",
    tags: ["Geant4", "Monte Carlo", "C/C++"],
    lecturer: "gv.ha@example.com",
    maxStudents: 2,
  },
  {
    title: "Phân loại tín hiệu điện não EEG trạng thái nhắm – mở mắt bằng mạng CNN",
    description:
      "Tiền xử lý bộ dữ liệu EEG công khai (lọc nhiễu, tách đoạn, chuẩn hoá) rồi huấn luyện mạng tích chập nhỏ để phân loại hai trạng thái nhắm mắt và mở mắt. Đánh giá bằng độ chính xác, ma trận nhầm lẫn và so sánh với phương pháp phổ công suất truyền thống.",
    objectives: "Quy trình tiền xử lý có thể chạy lại.\nMô hình đạt độ chính xác trên 85% ở tập kiểm tra.\nBáo cáo so sánh hai phương pháp.",
    requirements: "Biết Python và NumPy.\nĐã học Xử lý tín hiệu số là một lợi thế.",
    department: "Vật lý Tin học",
    tags: ["Python", "Học máy", "Xử lý tín hiệu"],
    lecturer: "gv.bao@example.com",
    maxStudents: 2,
  },
  {
    title: "Thiết kế mạch khuếch đại lock-in giá thành thấp cho phép đo tín hiệu nhỏ",
    description:
      "Thiết kế và chế tạo mạch khuếch đại lock-in hai pha dùng linh kiện phổ thông, dải tần 10 Hz – 10 kHz. Mạch được dùng để đo tín hiệu quang điện mức nanoampe trong các bài thực tập quang học.",
    objectives: "Sơ đồ nguyên lý và mạch in hoàn chỉnh.\nĐo đặc tuyến biên độ – tần số và mức nhiễu nền.\nTài liệu hướng dẫn sử dụng cho sinh viên khoá sau.",
    requirements: "Đã học Điện tử tương tự.\nBiết dùng phần mềm vẽ mạch (KiCad hoặc Altium).",
    department: "Vật lý Điện tử",
    tags: ["Thiết kế mạch", "Xử lý tín hiệu"],
    lecturer: "gv.khoa@example.com",
    maxStudents: 2,
  },
  {
    title: "Mô phỏng phân bố nhiệt trong tấm pin mặt trời bằng COMSOL Multiphysics",
    description:
      "Xây dựng mô hình truyền nhiệt ba chiều của một tấm pin mặt trời silic dưới các điều kiện bức xạ và tốc độ gió khác nhau. Khảo sát ảnh hưởng của nhiệt độ làm việc đến hiệu suất chuyển đổi.",
    objectives: "Mô hình hội tụ với lưới hợp lý.\nBộ kết quả cho 5 kịch bản thời tiết.\nĐề xuất phương án tản nhiệt thụ động.",
    requirements: "Đã học Phương pháp tính.\nSẵn sàng tự học COMSOL trong 2 tuần đầu.",
    department: "Vật lý Ứng dụng",
    tags: ["COMSOL"],
    lecturer: "gv.yen@example.com",
    maxStudents: 2,
  },
  {
    title: "Website quản lý lịch đặt thiết bị phòng thí nghiệm Vật lý",
    description:
      "Phát triển ứng dụng web cho phép sinh viên xem lịch trống và đặt giờ sử dụng thiết bị; cán bộ phòng thí nghiệm duyệt yêu cầu. Hệ thống tự phát hiện trùng lịch và gửi thông báo khi yêu cầu được duyệt.",
    objectives: "Phân quyền sinh viên / cán bộ quản lý.\nKiểm tra trùng lịch ở phía máy chủ.\nTriển khai chạy thử tại một phòng thí nghiệm.",
    requirements: "Biết JavaScript/TypeScript và SQL cơ bản.\nLàm việc được theo nhóm với Git.",
    department: "Vật lý Tin học",
    tags: ["Next.js", "PostgreSQL"],
    lecturer: "gv.bao@example.com",
    maxStudents: 3,
  },
  {
    title: "Xác định hoạt độ phóng xạ trong mẫu đất bằng hệ phổ kế gamma HPGe",
    description:
      "Thu thập và xử lý mẫu đất tại khu vực TP.HCM, đo phổ gamma trên hệ HPGe phông thấp để xác định hoạt độ riêng của các đồng vị 226Ra, 232Th và 40K. Tính các chỉ số nguy hiểm bức xạ và so sánh với giá trị trung bình thế giới.",
    objectives: "Quy trình chuẩn bị mẫu và chuẩn hiệu suất.\nKết quả hoạt độ cho ít nhất 10 mẫu.\nĐánh giá chỉ số nguy hiểm bức xạ.",
    requirements: "Đã học Phương pháp thực nghiệm hạt nhân.\nCẩn thận, tuân thủ quy định an toàn bức xạ.",
    department: "Vật lý Hạt nhân",
    tags: ["Python"],
    lecturer: "gv.ha@example.com",
    maxStudents: 2,
  },
  {
    title: "Nhận dạng vân giao thoa và đo bước sóng tự động bằng xử lý ảnh",
    description:
      "Chụp ảnh hệ vân giao thoa khe Young bằng camera, dùng thuật toán xử lý ảnh xác định khoảng vân và tính bước sóng ánh sáng. Xây dựng công cụ nhỏ để sinh viên thực tập kiểm tra kết quả đo tay.",
    objectives: "Thuật toán tách vân bền với nhiễu và độ nghiêng ảnh.\nSai số bước sóng dưới 2%.\nGiao diện đơn giản chạy trên máy tính phòng thực tập.",
    requirements: "Biết Python.\nĐã hoàn thành Thực tập Quang học.",
    department: "Vật lý Ứng dụng",
    tags: ["Python", "Xử lý ảnh", "Quang học"],
    lecturer: "gv.yen@example.com",
    maxStudents: 2,
  },
  {
    title: "Giải số phương trình Schrödinger một chiều cho giếng thế bất kỳ",
    description:
      "Cài đặt phương pháp sai phân hữu hạn và phương pháp Numerov để tìm trị riêng, hàm riêng của hạt trong giếng thế một chiều có dạng tuỳ ý. Xây dựng công cụ trực quan hoá phục vụ giảng dạy Cơ học lượng tử.",
    objectives: "So sánh hai phương pháp về độ chính xác và tốc độ.\nKiểm chứng với các bài toán có nghiệm giải tích.\nCông cụ vẽ hàm sóng tương tác.",
    requirements: "Đã học Cơ học lượng tử 1.\nBiết Python hoặc MATLAB.",
    department: "Vật lý Lý thuyết",
    tags: ["Python", "MATLAB"],
    lecturer: "gv.bao@example.com",
    maxStudents: 1,
  },
  {
    title: "Chế tạo màng mỏng ZnO pha tạp Al bằng phương pháp sol-gel và khảo sát tính chất quang",
    description:
      "Tổng hợp dung dịch sol, phủ quay tạo màng ZnO:Al trên đế thuỷ tinh, ủ nhiệt ở các nhiệt độ khác nhau. Khảo sát cấu trúc bằng nhiễu xạ tia X và độ truyền qua bằng phổ UV-Vis để xác định độ rộng vùng cấm.",
    objectives: "Quy trình chế tạo lặp lại được.\nBộ số liệu theo nồng độ pha tạp và nhiệt độ ủ.\nXác định điều kiện cho độ truyền qua trên 85%.",
    requirements: "Đã học Vật lý chất rắn.\nCó thể làm việc tại phòng thí nghiệm 3 buổi mỗi tuần.",
    department: "Vật lý Chất rắn",
    tags: ["Quang học"],
    lecturer: "gv.yen@example.com",
    maxStudents: 2,
  },
  {
    title: "Bộ thu thập dữ liệu đa kênh cho bài thực tập Vật lý đại cương dùng Arduino",
    description:
      "Thiết kế bộ thu thập dữ liệu 8 kênh tương tự giá rẻ dựa trên Arduino, kèm phần mềm trên máy tính để ghi và vẽ đồ thị. Thay thế việc đọc số liệu thủ công trong các bài thực tập cơ – nhiệt.",
    objectives: "Phần cứng 8 kênh, tốc độ lấy mẫu 1 kHz mỗi kênh.\nPhần mềm ghi dữ liệu ra tệp CSV.\nThử nghiệm trên 2 bài thực tập.",
    requirements: "Biết lập trình Arduino.\nƯu tiên sinh viên đã học Đo lường điện tử.",
    department: "Vật lý Điện tử",
    tags: ["Arduino", "C/C++", "Python"],
    lecturer: "gv.khoa@example.com",
    maxStudents: 2,
  },
  {
    title: "Dự báo công suất điện mặt trời áp mái bằng mô hình học máy",
    description:
      "Thu thập dữ liệu công suất phát của hệ điện mặt trời áp mái cùng dữ liệu thời tiết, xây dựng mô hình hồi quy và mạng LSTM để dự báo công suất trước 24 giờ. Đánh giá sai số theo mùa.",
    objectives: "Bộ dữ liệu sạch tối thiểu 12 tháng.\nSo sánh ít nhất 3 mô hình.\nSai số MAPE dưới 15% vào ngày nắng.",
    requirements: "Biết Python, pandas.\nCó kiến thức thống kê cơ bản.",
    department: "Vật lý Tin học",
    tags: ["Python", "Học máy"],
    lecturer: "gv.bao@example.com",
    maxStudents: 2,
  },
  {
    title: "Mô phỏng liều hấp thụ trong phantom nước của chùm photon 6 MV",
    description:
      "Mô phỏng đầu máy gia tốc tuyến tính đơn giản hoá và tính phân bố liều theo độ sâu, liều theo phương ngang trong phantom nước. Đối chiếu với số liệu đo thực nghiệm đã công bố.",
    objectives: "Đường cong liều sâu phần trăm cho 3 kích thước trường.\nSai khác với thực nghiệm dưới 3%.\nKhảo sát ảnh hưởng của số lịch sử hạt.",
    requirements: "Đã học Vật lý y khoa hoặc Vật lý hạt nhân ứng dụng.\nBiết C++ cơ bản.",
    department: "Vật lý Hạt nhân",
    tags: ["Geant4", "Monte Carlo", "C/C++"],
    lecturer: "gv.ha@example.com",
    maxStudents: 1,
  },
  {
    title: "Hệ thống giám sát chất lượng không khí PM2.5 tại khuôn viên trường",
    description:
      "Lắp đặt các trạm đo bụi mịn PM2.5 giá thành thấp tại nhiều vị trí trong khuôn viên, hiệu chuẩn với thiết bị tham chiếu và công bố dữ liệu trên bản đồ trực tuyến.",
    objectives: "4 trạm đo hoạt động liên tục 1 tháng.\nĐường chuẩn so với thiết bị tham chiếu.\nBản đồ dữ liệu cập nhật mỗi 5 phút.",
    requirements: "Biết lập trình vi điều khiển.\nCó thể tham gia lắp đặt ngoài trời.",
    department: "Vật lý Ứng dụng",
    tags: ["ESP32", "IoT", "Python"],
    lecturer: "gv.khoa@example.com",
    maxStudents: 3,
  },
  {
    title: "Điều khiển nhiệt độ lò ủ mẫu bằng thuật toán PID trên LabVIEW",
    description:
      "Xây dựng chương trình LabVIEW điều khiển nhiệt độ lò ủ mẫu nhỏ qua bộ thu thập dữ liệu, cho phép lập trình nhiều đoạn gia nhiệt – giữ nhiệt – làm nguội và ghi lại toàn bộ quá trình.",
    objectives: "Độ ổn định nhiệt ±1 °C ở 500 °C.\nGiao diện lập trình chu trình nhiệt nhiều bước.\nTự ngắt an toàn khi quá nhiệt.",
    requirements: "Đã học Kỹ thuật đo lường và điều khiển.\nƯu tiên sinh viên từng dùng LabVIEW.",
    department: "Vật lý Chất rắn",
    tags: ["LabVIEW"],
    lecturer: "gv.yen@example.com",
    maxStudents: 1,
  },
  {
    title: "Mô phỏng mô hình Ising hai chiều và khảo sát chuyển pha sắt từ",
    description:
      "Cài đặt thuật toán Metropolis và Wolff cho mô hình Ising hai chiều, tính từ độ, nhiệt dung và độ cảm từ theo nhiệt độ. Xác định nhiệt độ tới hạn bằng phân tích kích thước hữu hạn.",
    objectives: "Chương trình chạy cho mạng tới 256 × 256.\nƯớc lượng nhiệt độ tới hạn sai khác dưới 1%.\nSo sánh hiệu quả hai thuật toán gần điểm tới hạn.",
    requirements: "Đã học Vật lý thống kê.\nBiết Python hoặc C++.",
    department: "Vật lý Lý thuyết",
    tags: ["Monte Carlo", "Python", "C/C++"],
    lecturer: "gv.bao@example.com",
    maxStudents: 2,
  },
  {
    title: "Lọc nhiễu tín hiệu điện tim ECG bằng biến đổi wavelet",
    description:
      "Nghiên cứu các họ wavelet và ngưỡng khử nhiễu phù hợp cho tín hiệu điện tim, loại bỏ nhiễu đường nền và nhiễu điện lưới 50 Hz. Đánh giá trên bộ dữ liệu MIT-BIH.",
    objectives: "So sánh ít nhất 4 họ wavelet.\nCải thiện tỉ số tín hiệu trên nhiễu tối thiểu 10 dB.\nPhát hiện đỉnh R sau khi lọc.",
    requirements: "Đã học Xử lý tín hiệu số.\nBiết MATLAB hoặc Python.",
    department: "Vật lý Tin học",
    tags: ["Xử lý tín hiệu", "MATLAB", "Python"],
    lecturer: "gv.khoa@example.com",
    maxStudents: 2,
    status: "CLOSED",
  },
  {
    title: "Khảo sát đặc trưng detector nhấp nháy NaI(Tl) 3 × 3 inch",
    description:
      "Đo độ phân giải năng lượng, hiệu suất ghi đỉnh và độ tuyến tính của detector NaI(Tl) với bộ nguồn chuẩn. Xây dựng đường chuẩn hiệu suất phục vụ các bài thực tập hạt nhân.",
    objectives: "Đường chuẩn năng lượng và hiệu suất 60 keV – 1,4 MeV.\nĐánh giá độ ổn định theo nhiệt độ phòng.\nBộ tài liệu thực tập cập nhật.",
    requirements: "Đã hoàn thành Thực tập Vật lý hạt nhân.\nĐã qua tập huấn an toàn bức xạ.",
    department: "Vật lý Hạt nhân",
    tags: ["Python"],
    lecturer: "gv.ha@example.com",
    maxStudents: 2,
    status: "CLOSED",
  },
  {
    title: "Đo hệ số hấp thụ quang của dung dịch bằng quang phổ kế tự chế",
    description:
      "Chế tạo quang phổ kế đơn giản từ cách tử nhiễu xạ và cảm biến ảnh tuyến tính, hiệu chuẩn bước sóng bằng đèn thuỷ ngân. Dùng thiết bị đo phổ hấp thụ của các dung dịch màu và kiểm chứng định luật Beer–Lambert.",
    objectives: "Độ phân giải bước sóng dưới 3 nm.\nPhần mềm hiển thị phổ thời gian thực.\nKiểm chứng định luật với 3 dung dịch.",
    requirements: "Đã học Quang học.\nBiết lập trình vi điều khiển cơ bản.",
    department: "Vật lý Ứng dụng",
    tags: ["Quang học", "Arduino", "Python"],
    lecturer: "gv.yen@example.com",
    maxStudents: 2,
  },
  {
    title: "Tính cấu trúc vùng năng lượng của graphene bằng phương pháp liên kết chặt",
    description:
      "Xây dựng Hamiltonian liên kết chặt cho graphene đơn lớp và hai lớp, tính cấu trúc vùng và mật độ trạng thái. Khảo sát ảnh hưởng của điện trường vuông góc lên khe năng lượng của graphene hai lớp.",
    objectives: "Chương trình tính và vẽ cấu trúc vùng.\nTái lập các kết quả kinh điển trong tài liệu.\nKhảo sát khe năng lượng theo điện trường.",
    requirements: "Đã học Vật lý chất rắn và Cơ học lượng tử.\nBiết Python.",
    department: "Vật lý Chất rắn",
    tags: ["Python"],
    lecturer: "gv.bao@example.com",
    maxStudents: 1,
  },
  {
    title: "Ứng dụng web tra cứu và trực quan hoá dữ liệu khí tượng trạm Tân Sơn Hoà",
    description:
      "Thu thập dữ liệu khí tượng công khai nhiều năm của trạm Tân Sơn Hoà, chuẩn hoá và xây dựng ứng dụng web cho phép tra cứu, vẽ biểu đồ nhiệt độ, lượng mưa, độ ẩm theo tháng và theo năm.",
    objectives: "Cơ sở dữ liệu tối thiểu 20 năm.\nBiểu đồ tương tác, có bảng số liệu thay thế.\nTải dữ liệu theo khoảng thời gian chọn.",
    requirements: "Biết JavaScript/TypeScript.\nCó hiểu biết cơ bản về cơ sở dữ liệu.",
    department: "Vật lý Tin học",
    tags: ["Next.js", "PostgreSQL", "Python"],
    lecturer: "gv.khoa@example.com",
    maxStudents: 2,
  },
  {
    title: "Thiết kế nguồn dòng ổn định điều khiển số cho laser diode",
    description:
      "Thiết kế nguồn dòng 0 – 200 mA độ gợn thấp, điều khiển bằng vi điều khiển qua DAC, có bảo vệ quá dòng và khởi động mềm cho laser diode dùng trong phòng thí nghiệm quang học.",
    objectives: "Độ gợn dòng dưới 10 µA.\nĐiều khiển và hiển thị qua màn hình và máy tính.\nThử nghiệm với laser diode 650 nm.",
    requirements: "Đã học Điện tử tương tự và Vi điều khiển.\nCó kỹ năng hàn mạch.",
    department: "Vật lý Điện tử",
    tags: ["Thiết kế mạch", "C/C++", "Quang học"],
    lecturer: "gv.khoa@example.com",
    maxStudents: 2,
  },
];

// [chỉ số đề tài, email sinh viên, trạng thái, lời nhắn, phản hồi của giảng viên]
const REGISTRATIONS: [number, string, RegistrationStatus, string | null, string | null][] = [
  [0, "sv.an@example.com", "ACCEPTED", "Em đã làm đồ án môn học về ESP32, mong được thầy hướng dẫn.", "Đồng ý. Em gặp thầy sáng thứ Ba tại phòng B32."],
  [0, "sv.bich@example.com", "PENDING", "Em muốn làm phần web hiển thị dữ liệu ạ.", null],
  [0, "sv.cuong@example.com", "PENDING", null, null],
  [1, "sv.dung@example.com", "ACCEPTED", "Em đã cài được Geant4 và chạy ví dụ B1.", "Tốt. Em đọc trước chương 3 tài liệu thầy cô gửi qua email."],
  [1, "sv.duc@example.com", "REJECTED", "Em chưa học C++ nhưng sẽ cố gắng.", "Đề tài cần nền C++ ngay từ đầu, em tham khảo đề tài đo phổ gamma nhé."],
  [2, "sv.han@example.com", "PENDING", "Em quan tâm xử lý tín hiệu y sinh.", null],
  [2, "sv.huy@example.com", "PENDING", "Em đã học khoá học máy cơ bản trên mạng.", null],
  [3, "sv.cuong@example.com", "ACCEPTED", null, "Nhận em. Tuần sau bắt đầu khảo sát linh kiện."],
  [5, "sv.lan@example.com", "PENDING", "Nhóm em 2 bạn muốn đăng ký cùng ạ.", null],
  [5, "sv.an@example.com", "REJECTED", null, "Em đã được nhận ở đề tài khác."],
  [8, "sv.duc@example.com", "ACCEPTED", "Em thích mảng lượng tử và lập trình Python.", "Nhận em."],
  [11, "sv.bich@example.com", "PENDING", null, null],
  [13, "sv.huy@example.com", "ACCEPTED", "Em có thể tham gia lắp đặt cuối tuần.", "Đồng ý."],
  [13, "sv.lan@example.com", "PENDING", null, null],
  [16, "sv.han@example.com", "ACCEPTED", null, "Nhận em."],
  [16, "sv.dung@example.com", "ACCEPTED", "Em đã làm quen MATLAB wavelet toolbox.", "Nhận em. Đề tài đã đủ người."],
  [20, "sv.cuong@example.com", "PENDING", "Em muốn làm phần thu thập và chuẩn hoá dữ liệu.", null],
];

async function main() {
  const password = process.env.SEED_PASSWORD;
  if (!password || password.length < 10 || password.startsWith("REPLACE_")) {
    throw new Error("Hãy đặt SEED_PASSWORD (ít nhất 10 ký tự) trong file .env trước khi seed.");
  }

  if (process.env.SEED_RESET === "1") {
    await prisma.registration.deleteMany();
    await prisma.topic.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.department.deleteMany();
    await prisma.user.deleteMany();
    console.log("Đã xoá dữ liệu cũ (SEED_RESET=1).");
  }

  // 1. Tài khoản: tạo User + Account "credential" đúng theo cách Better Auth lưu mật khẩu.
  const passwordHash = await hashPassword(password);
  const userIdByEmail = new Map<string, string>();
  for (const account of ACCOUNTS) {
    const user = await prisma.user.upsert({
      where: { email: account.email },
      update: { name: account.name, role: account.role },
      create: {
        id: crypto.randomUUID(),
        email: account.email,
        name: account.name,
        role: account.role,
        emailVerified: true,
      },
    });
    userIdByEmail.set(account.email, user.id);

    const credential = await prisma.account.findFirst({
      where: { userId: user.id, providerId: "credential" },
      select: { id: true },
    });
    if (credential) {
      await prisma.account.update({ where: { id: credential.id }, data: { password: passwordHash } });
    } else {
      await prisma.account.create({
        data: {
          id: crypto.randomUUID(),
          userId: user.id,
          providerId: "credential",
          accountId: user.id,
          password: passwordHash,
        },
      });
    }
  }

  // 2. Danh mục.
  for (const name of DEPARTMENTS) {
    await prisma.department.upsert({ where: { name }, update: {}, create: { name, slug: slugify(name) } });
  }
  for (const name of TAGS) {
    await prisma.tag.upsert({ where: { name }, update: {}, create: { name, slug: slugify(name) } });
  }

  // 3. Đề tài và đăng ký mẫu: chỉ tạo khi chưa có đề tài nào.
  if ((await prisma.topic.count()) > 0) {
    console.log("Đã có đề tài trong database nên bỏ qua phần đề tài mẫu.");
    return;
  }

  const departments = await prisma.department.findMany({ select: { id: true, name: true } });
  const departmentIdByName = new Map(departments.map((item) => [item.name, item.id]));

  const topicIds: string[] = [];
  for (const [index, topic] of TOPICS.entries()) {
    // Đề tài đứng trước trong danh sách có thời điểm cập nhật mới hơn.
    const timestamp = new Date(BASE_TIME - index * DAY);
    const created = await prisma.topic.create({
      data: {
        title: topic.title,
        description: topic.description,
        objectives: topic.objectives,
        requirements: topic.requirements,
        maxStudents: topic.maxStudents,
        status: topic.status ?? "OPEN",
        createdAt: timestamp,
        updatedAt: timestamp,
        lecturerId: userIdByEmail.get(topic.lecturer)!,
        departmentId: departmentIdByName.get(topic.department)!,
        tags: { connect: topic.tags.map((name) => ({ name })) },
      },
      select: { id: true },
    });
    topicIds.push(created.id);
  }

  for (const [index, [topicIndex, email, status, message, lecturerNote]] of REGISTRATIONS.entries()) {
    const createdAt = new Date(BASE_TIME + (index + 1) * 60 * 60 * 1000);
    await prisma.registration.create({
      data: {
        topicId: topicIds[topicIndex],
        studentId: userIdByEmail.get(email)!,
        studentCode: `2213${String(index + 101).padStart(4, "0")}`,
        className: index % 2 === 0 ? "22VLTH" : "22VLDT",
        phone: `09${String(12345670 + index).padStart(8, "0")}`,
        message,
        status,
        lecturerNote,
        respondedAt: status === "PENDING" ? null : new Date(createdAt.getTime() + DAY),
        createdAt,
      },
    });
  }

  console.log(`Seed xong: ${ACCOUNTS.length} tài khoản, ${TOPICS.length} đề tài, ${REGISTRATIONS.length} đăng ký.`);
  console.log("Đăng nhập thử: admin@example.com · gv.khoa@example.com · sv.an@example.com (mật khẩu = SEED_PASSWORD).");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
