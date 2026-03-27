# PTIT LMS Auto-Complete Pro Max (V5.1.0)

Tool hỗ trợ học tập trên hệ thống LMS PTIT (mở rộng từ `PTIT-LMS-Unlock-Seek` gốc của `hoanggxyuuki`). 
Phiên bản này được viết lại dưới dạng cường hóa siêu tốc (Pro Max) bởi **Salyyy** để thêm một bảng điều khiển nổi (Dashboard) ngay trên màn hình môn học LMS, bao gồm các tính năng:
1. **Tự động xem & báo cáo hoàn thành video (Bypass chặn tua).**
2. **Auto-Solver V5.1 (Universal DOM Spammer - Vượt Chấm Mù)**: Thuật toán dò tìm đáp án ngầm với tốc độ siêu thanh chuyên trị các bài kiểm tra ẩn đáp án.

## Tính năng chi tiết

### Tính năng 1: ⏭️ Tự Động Xong Video
Dựa trên cốt lõi của tác giả gốc *hoanggxyuuki*, tool vẫn chặn hàm `_checkCurrentTime` không cho LMS bắt lỗi "tua video trộm".
Nhưng điểm mạnh mẽ hơn là Tool hiện tại hỗ trợ cường chế ép tua ở **CẢ 2 DẠNG VIDEO**:
- **Ngắn & Video Youtube Nhúng**: Dùng PostMessage ép nhảy tới 99% thời lượng.
- **Video Nội Bộ (Ví dụ môn Kinh Tế Chính Trị, Triết Học...)**: Can thiệp thẳng vào bộ phát `<video>` HTML5 nội bộ của web để kéo thời gian về phút cuối cùng và bấm play.
Điều này giúp video tự động nhả event `ENDED` để LMS tính rằng "Bạn đã xem xong 100% video" ngay lập tức mà không cần click play hay đợi mòn mỏi.

### Tính năng 2: 💀 Hack Siêu Tốc V5.1 UI (Auto-Solver Vượt Chấm Mù)
Hệ thống PTIT LMS dùng nhân React/VueJS ẩn Form gốc và trả điểm mù (Chỉ hiện `Kết quả: 2/10` chứ không cho biết câu nào sai).
Tính năng này sẽ sử dụng thuật toán **Hill-Climbing (Leo Đồi Mù)** để thử nghiệm mọi sự kết hợp đáp án khả thi với tốc độ kinh hoàng.

**Đặc điểm V5.1:**
- **Không Cần Form HTML**: Dò tìm bằng nút bấm Universal, miễn màn hình có nút "Nộp bài" hoặc "Làm lại" là tool tự giác bấm.
- **Bypass Animations**: Bỏ qua hoàn toàn Animation rề rà của Moodle/edX. Script bắt sự thay đổi kết quả trong màn hình, nếu thấy rớt điểm nó sẽ ngay lập tức kích hoạt vòng lặp Làm Lại liên thanh.
- **Tính Năng Auto-Heal (Tự Phục Hồi Lỗi Nuốt Click)**: Trị dứt điểm chứng bệnh "Kẹt ở trang kết quả hoặc Nút Nộp Bài không ăn" của ReactJS. Nếu web ảo hoá làm mất sự kiện click, tool tự động nhận diện và nhồi hàng chục cú click mỗi 200ms cho tới khi web nhận lệnh mới thôi. Bỏ qua hoàn toàn thao tác tay của con người.

**Cách dùng:**
1. Vào trang bài kiểm tra trắc nghiệm (đang hiện câu hỏi).
2. Bấm nút đỏ `< 💀 Hack Siêu Tốc V5.1 UI >`.
3. Bỏ tay khỏi chuột. Hệ thống sẽ tự động Nộp => Xem Điểm => Rút kinh nghiệm => Bấm Làm Lại => Tích Đáp Án => Nộp, tuần hoàn liên tục với độ trễ 200ms bằng 1 luồng duy nhất cho đến khi đạt `10/10` thì dừng lại và báo chiến thắng.

---

## Cách cài đặt (Dùng Userscript)

1. Tải ứng dụng mở rộng (Extension) **[Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)** về trình duyệt Web tự do (Google Chrome / Cốc Cốc / Edge / Brave).
2. Tải đoạn file script có đuôi `.user.js` ở kho lưu trữ hoặc mở file `ptit-lms-autoseek.user.js` trên Github này.
3. Nhấp vào bảng **Tampermonkey** góc trên trình duyệt -> Add a new script (Thêm một kịch bản mới).
4. Xóa những dòng có sẵn và dán (Paste) toàn bộ nội dung của file mã nguồn `ptit-lms-autoseek.user.js` vào đó. Nhấp `File > Save` (hoặc nhấn Ctrl+S).
5. Refresh lại trang web PTIT LMS. Một cửa sổ ngầu lòi tự đính bên góc phải phía dưới màn hình sẽ hiện lên. 

## Cảnh báo rủi ro ⚠️
Sử dụng các Tool Auto-LMS luôn đi kèm rủi ro nếu nền tảng rà soát hệ thống chống gian lận (Anti-Cheat / Analytics logs). Mặc dù tool đã fix `_checkCurrentTime` để lừa log, bạn nên ghim nút "Tự hoàn thành video" cách nhau khoảng thời gian ngắn để giả lập thời gian chuyển tab. Không nên "1 second = 5 module lms". 
Đối với tính năng **Hack Siêu Tốc**, script sẽ ping lên server PTIT rất gắt. Tool đã được gắn khoá an toàn delay ngầm (Sleep) để tránh bị Cloudflare khoá IP vì DDOS, nhưng hãy dùng lượng bài vừa phải.

Tác giả không chịu trách nhiệm cho điểm số cũng như rủi ro khóa tài khoản (nếu có). 
Cảm ơn base logic và kịch bản bắt lỗi của **_hoanggxyuuki (Tác giả gốc)_**.
Mod thành Vũ khí Hạng nặng V5.1 (Pro Max) bởi **Salyyy**.
