# PTIT LMS Study Assistant Pro (V5.1.0)

Tiện ích hỗ trợ nâng cao trải nghiệm học tập trên hệ thống LMS PTIT (kế thừa từ `PTIT-LMS-Unlock-Seek` của `hoanggxyuuki`). 
Phiên bản này được tối ưu hóa thành dạng **Userscript** bởi **Salyyy**, tạo ra một bảng điều khiển nổi (Dashboard) tinh tế trực tiếp trên màn hình môn học với 2 tính năng giáo dục cốt lõi:

## Tính năng chính

### Gói 1: 📚 Đồng bộ và Xác nhận Truy cập Bài giảng (Video Progress Sync)
Phù hợp cho các bạn sinh viên đã đọc tài liệu hoặc đã nắm vững kiến thức nhưng hệ thống vẫn yêu cầu treo máy xem video.
Tính năng này giúp **báo cáo hoàn thành tiến độ video (Youtube và Video HTML5 Nội bộ)** lên Server ngay lập tức, tiết kiệm tài nguyên mạng và thời gian chờ đợi đường truyền của sinh viên.
*Hệ thống tương tác giả lập sự kiện `ENDED` hoàn toàn tuân thủ luồng phân tải của trình duyệt nhằm giữ tính ổn định tuyệt đối cho tài khoản.*

### Gói 2: ✨ Trợ lý Ôn tập và Phân tích Trắc nghiệm (Auto-Review Heuristic V5.1)
Rất nhiều bài tập PTIT LMS không hiển thị đáp án sau khi thi (Blind Grading), gây khó khăn cho việc tự đối chiếu lỗi sai và ôn tập. Cụm tính năng này đóng vai trò như một **gia sư AI tự động rà soát điểm số**.

**Đặc điểm Kỹ thuật V5.1:**
- **Nhận diện Thông minh (Universal Scanning)**: Trợ lý tự động nhận diện tất cả các biểu mẫu nộp bài, kể cả các bài kiểm tra xây dựng trên nền tảng React/Vue render ẩn (Không cần thẻ Form truyền thống).
- **Thuật toán Leo đồi (Hill-Climbing)**: Phân tích kết quả sau mỗi lần nộp. Nếu phát hiện lựa chọn sai, trợ lý sẽ tự động tái thiết lập bài thi và loại trừ đáp án lỗi với tốc độ phản hồi cực nhanh (Cơ chế Fast-Polling 200ms) để không làm gián đoạn luồng suy nghĩ của bạn.
- **Auto-Heal Recovery**: Tự động khôi phục chu trình chạy máy học nếu mạng máy chủ PTIT LMS chậm lag (Nuốt sự kiện Click).

**Hướng dẫn sử dụng trợ lý:**
1. Mở bài kiểm tra trắc nghiệm cần ôn tập.
2. Bấm nút `< ✨ Trợ lý Ôn tập Tự động >` trên Dashboard.
3. Chờ đợi trong vài giây. Trợ lý sẽ tự động chạy rà soát hàng loạt các phương án và chốt đáp án điểm tuyệt đối để lưu vào bộ nhớ thực hành của bạn.

---

## Cài đặt Công cụ (Extension)

1. Tải ứng dụng UserScript Manager tùy chọn như **[Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)** lên các trình duyệt (Chrome / Cốc Cốc / Edge).
2. Tải đoạn file script có tên `ptit-lms-autoseek.user.js` trên Github này.
3. Kéo thả file đó vào bảng điều khiển của **Tampermonkey** hoặc tạo Script mới và dán code vào. (Nhấp `File > Save` hoặc nhấn Ctrl+S).
4. F5 Refresh lại trang LMS PTIT, một bảng Menu trợ giúp nhỏ gọn sẽ hiển thị ở góc phải dưới màn hình của bạn. 

## Lưu ý Sử dụng ⚠️
Tiện ích này được phát triển với mục đích **giáo dục và ôn luyện cá nhân**. Dù đã được áp dụng chống cảnh báo mã nguồn, sinh viên nên sử dụng một cách hợp lý và có chừng mực, tránh lạm dụng băng thông máy chủ quá đà (1 giây click hoàn thành 10 bài giảng).

Tác giả không chịu trách nhiệm pháp lý cho các vấn đề liên quan đến sử dụng sai mục đích.
Cảm ơn base logic của tác giả **_hoanggxyuuki_**.
Được duy trì và nâng cấp thuật toán V5.1 bởi **Salyyy**.
