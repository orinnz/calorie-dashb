# YÊU CẦU XÂY DỰNG FRONTEND: DASHBOARD QUẢN LÝ BOT CHO SOCIAL CHALLENGES

Bạn đang đóng vai trò là một Frontend Developer. Nhiệm vụ của bạn là xây dựng phiên bản "Dashboard mô phỏng / Automation Test UI" dành riêng cho tính năng "Social Challenges". Do giai đoạn phát triển ban đầu hệ thống chưa có nhiều user thật, ta sẽ sử dụng danh sách 100 con Bot có sẵn trong database để tương tác chéo.

Dưới đây là mô tả User Journey và CHI TIẾT TOÀN BỘ API CONTRACTS (gồm Request & Từng Field Response). Nhiệm vụ của bạn là dán UI/UX lên và nối API mượt mà nhất. 

---

## 1. BỐ CỤC UI ĐỀ XUẤT (APP LAYOUT)
Chia layout thành 2 phần chính:
1. **Sidebar / Header (Quản lý Session):** 
   - Danh sách Dropdown list chứa tất cả các Bot.
   - Nút "Login as Bot". Khi click, tự động gọi API login và đổi Auth Context hiện tại sang Bot đó.
   - Thể hiện rõ tên Bot đang kích hoạt.
2. **Main Workspace (Không gian làm việc chính):**
   - **Tab 1 - Quản lý Nhóm:** "Tạo Challenge", "Danh sách đã tham gia", và "Join Challenge Bằng Code".
   - **Tab 2 - Submit Logs:** Khu vực gõ date `YYYY-MM-DD` => Thêm Log Dinh dưỡng (Food Log) và Log Nước uống (Water Log).
   - **Tab 3 - Tracking & Kết quả:** Giao diện xem State (Pass/Fail hôm nay) và xem Leaderboard (Xếp hạng) của một Challenge.
   - **Tab 4 - Nâng cao (Dành cho Bot tạo nhóm):** Chuyển chế độ Public/Private và Hủy Challenge.

> **💡 Quy Tắc Auth:** Base URL hãy tạm trỏ về `http://127.0.0.1:8787`. Đính kèm Header `Authorization: Bearer <accessToken>` cho TẤT CẢ các API bên dưới (ngoại trừ API `Danh sách bots` và `Đăng nhập`).

---

## 2. API CONTRACTS CHI TIẾT

### BƯỚC 1: Lấy danh sách Bots & Đăng nhập
**1.1. Lấy tất cả Bots**
- **Method:** `GET /api/auth/bots` *(Không cần Auth)*
- **Response:**
  ```json
  {
    "bots": [
      {
         "id": "uuid-cua-bot",
         "anonymousId": "uuid-anonymous",
         "displayName": "Alex Master 1",
         "isBot": true
      }
    ]
  }
  ```

**1.2. Đăng nhập với Bot đã chọn**
- **Method:** `POST /api/auth/anonymous` *(Không cần Auth)*
- **Body:** `{ "anonymous_id": "uuid-anonymous-cua-bot" }`
- **Response:**
  ```json
  {
    "user": { ... },
    "tokens": { "accessToken": "eyJ...", "refreshToken": "..." }
  }
  ```
- **Action:** Giữ `accessToken` lưu vào Store/Context. Mọi API sau đều dùng token này.

---

### BƯỚC 2: Thao tác sinh Challenge
**2.1. Tạo Quick Challenge**
- **Method:** `POST /api/challenges/quick-create`
- **Body Request:**
  ```json
  {
    "groupName": "Tên nhóm thách đấu",
    "visibility": "invite_only",
    "threshold": {
      "metric": "water_ml", 
      "operator": "gte",
      "target": 2000
    }
  }
  ```
  *(Các `metric` hợp lệ: `water_ml`, `calories`, `protein`, `carbs`. Hoặc không truyền `threshold` để tự map qua AI Food Challenge.)*
- **Response:**
  ```json
  {
    "instanceId": "id-cua-challenge",
    "groupId": "id-cua-nhom",
    "inviteCode": "CHX89K9", // <--- Quan trọng để đưa cho các bot khác
    "title": "...",
    "challengeType": "threshold",
    "status": "active"
  }
  ```

**2.2. Lấy lại mã Invite của các nhóm mình đang trong**
- **Method:** `GET /api/challenges/me/instances`
- **Query (optional):** `status` (`all` default · `active` · `ended`), `sort` (`ending_soon` · `newest`), `type`, `metric`, `search`, `limit` (default 50), `page`.
- **Response:** Phân trang. Focus vào trường `group.inviteCode` để lấy mã Invite.
  ```json
  {
    "instances": [
      {
        "id": "instance-id",
        "title": "Tên nhóm",
        "group": {
          "id": "group-id",
          "inviteCode": "CHX89K9",
          "role": "owner"
        }
      }
    ],
    "pagination": { "limit": 50, "page": 1, "totalPages": 1, "total": 1 }
  }
  ```

**2.3. Join Challenge bằng Code (cho Bot khác)**
- **Method:** `POST /api/challenges/groups/join-by-code`
- **Body:** `{ "inviteCode": "CHX89K9" }`
- **Response:**
  ```json
  {
    "joined": true,
    "member": {
      "id": "member-id",
      "challengeGroupId": "group-id",
      "userId": "bot-id",
      "role": "member"
    }
  }
  ```

---

### BƯỚC 3: Tracking Data (Submit dữ liệu kiểm thử)
Sử dụng `:date` trên URL dạng `YYYY-MM-DD`.

**3.1. Thêm Log Dinh Dưỡng (Ăn uống)**
- **Method:** `POST /api/daily-records/:date/food-logs`
- **Body Request:**
  ```json
  {
    "name": "Bát Phở Bò Khổng Lồ",
    "descriptionText": "Nhiều thịt ít bánh",
    "calories": 600,
    "protein": 30,
    "fileName": "mock-image-id-123.jpg" 
  }
  ```
- **Response (DailyRecordContract):**
  ```json
  {
    "id": "daily-record-id",
    "totalCaloriesIntake": 600,
    "foodLogs": [ { "id": "food-id", "name": "Bát Phở", "calories": 600 } ]
  }
  ```

**3.2. Thêm Log Nước Uống**
- **Method:** `POST /api/daily-records/:date/water-logs`
- **Body Request:**
  ```json
  { "amount": 250 }
  ```

---

### BƯỚC 4: Các API Thao tác nâng cao (Mode, Rời nhóm, Hủy Challenge)

**4.1. Chuyển Mode cho Challenge (Chỉ Owner mới có quyền)**
- **Method:** `PATCH /api/challenges/instances/:id` (id = instanceId)
- **Body Request:** 
  ```json
  { "visibility": "public" } 
  ```
  *(Truyền `public`, `private` hoặc `invite_only`)*
- **Response:** `{ "success": true, "message": "Challenge updated" }`

**4.2. Khai tử / Kết thúc sớm Challenge (Chỉ Owner mới có quyền)**
- **Method:** `POST /api/challenges/instances/:id/cancel` (id = instanceId)
- **Response:** `{ "success": true, "message": "Challenge cancelled" }`

**4.3. Rời Group (Member Rút lui)**
- **Method:** `POST /api/challenges/groups/:groupId/leave`
- **Response:** `{ "success": true, "message": "Left group successfully" }`

---

### BƯỚC 5: Xem Kết Quả (Dashboard Output)

**5.1. Xem màn hình Leaderboard**
- **Method:** `GET /api/challenges/instances/:instanceId/leaderboard`
- **Query Params:** `?page=1&limit=20`
- **Response:**
  ```json
  {
    "data": [
      {
        "userId": "bot-id-1",
        "displayName": "Alex Master 1",
        "isAnonymous": false,
        "totalScore": 100,
        "totalPassDays": 3,
        "lastScoredDate": "2026-04-12"
      }
    ],
    "total": 5
  }
  ```

**5.2. Xem trạng thái Daily (Pass/Fail tạm thời)**
- **Method:** `GET /api/challenges/instances/:instanceId/me/state?date=YYYY-MM-DD`
- **Response:**
  ```json
  {
    "instanceId": "id-challenge",
    "date": "2026-04-12",
    "ruleType": "threshold",
    "official": {
      "exists": false,
      "status": null
    },
    "temporary": {
      "status": "PASS_TEMP",
      "progress": 250,
      "target": 2000
    },
    "display": { "badge": "TEMPORARY", "isLockedForDate": false }
  }
  ```

---

## 3. YÊU CẦU CHO THIẾT KẾ UI & LOGIC CODE
1. Tổ chức cấu trúc rõ ràng: Tạo các thư mục `api/` chứa sẵn các call Axios.
2. Form Input linh hoạt: Đừng fix cứng parameter!
3. Notification Toast: 100% phải hiển thị Toast (success/error báo từ server về). Dùng cái notification center ở góc để người dùng biết họ (là con bot) đã join thành công hay leave thành công chưa.
4. Đọc kỹ Response Model ở trên để Type TypeScript chuẩn chỉ nhé. Chúc bạn code React mượt mà!
