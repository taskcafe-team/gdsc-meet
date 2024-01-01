**Hướng Dẫn Chạy Ứng Dụng:**

1. **Yêu Cầu Trước Khi Chạy:**
    - Đảm bảo **Docker** và **Docker Compose** đã được cài đặt và đang hoạt động.

2. **Cài Đặt Biến Môi Trường:**
    - Tạo hai file **.env** dựa trên **.env.example** trong thư mục **./server/** và **./deploy/**.
    - Chỉnh sửa giá trị biến môi trường trong file **.env** theo nhu cầu.

3. **File **.env** Trong **./server/**:**
    - Cấu hình biến môi trường liên quan đến server, database, và các dịch vụ khác.
    - Biến Môi Trường **API NODE_ENV**: Môi trường chạy ứng dụng.
    - **API_*:** Cấu hình cho API, bao gồm host, port, secret cho token và session, cấu hình CORS.
    - **DB_*:** Thông tin kết nối đến PostgreSQL.
    - **REDIS_*:** Thông tin kết nối đến Redis.
    - **GOOGLE_*:** Thông tin cho Google OAuth.
    - **EMAIL_*:** Thông tin để ứng dụng có thể gửi email.
    - **WEBRTC_LIVEKIT_*:** Thông tin kết nối đến API của LiveKit.

4. **File **.env** Trong **./deploy/**:**
    - Dành cho việc triển khai ứng dụng, có thể là production hoặc staging.
    - Cấu hình biến môi trường cho môi trường triển khai cụ thể.
    - **APP_DOMAIN:** Địa chỉ miền chính của ứng dụng.
    - **APP_WEBRTC_DOMAIN:** Địa chỉ miền được sử dụng cho dịch vụ WebRTC.
    - **APP_WEBRTC_TURN_DOMAIN:** Địa chỉ miền được sử dụng cho dịch vụ TURN trong WebRTC.
    - **APP_SECRET_CF_API_EMAIL và APP_SECRET_CF_API_KEY:** Thông tin đăng nhập vào API Cloudflare, có thể được sử dụng.

5. **Các Công Cụ Cần Thiết:**
    - Đảm bảo các công cụ như **grep, egrep, xargs, sed, và mv** đã được cài đặt.

6. **Kiểm Tra Các Công Cụ:**
    - Mở terminal và chạy lệnh sau để kiểm tra các công cụ:

    ```bash
    grep --version
    egrep --version
    xargs --version
    sed --version
    mv --version
    ```

    - Lưu ý: Cài đặt các công cụ trước khi chạy script.

7. **Chạy Ứng Dụng:**
    - Mở terminal và thực thi script bằng lệnh:

    ```bash
    bash ./deploy/docker-script.sh webapi # to run webapi
    bash ./deploy/docker-script.sh webui # to run webui
    ```

    - Có thể truyền các tùy chọn của **docker-compose up** vào script.

8. *Chi Tiết Hoạt Động của **docker-script.sh***:
    - **Xử Lý Biến Môi Trường:** Script bắt đầu bằng cách đọc file **.env** và xuất các biến môi trường.
    - **Kiểm Tra Biến Môi Trường:** Script kiểm tra xem biến môi trường đã được định nghĩa trong file **.env** có tồn tại trong các file **./livekit/livekit.yaml** và **./livekit/egress.yaml** hay không.
    - **Thay Thế Biến Môi Trường:** Nếu tất cả các biến môi trường đều tồn tại, script sẽ thay thế chúng trong các file gốc bằng các giá trị tương ứng của chúng, sử dụng lệnh **sed**.
    - **Chạy Docker Compose:** Script kiểm tra xem một mạng Docker có tên **proxy-network** có tồn tại hay không. Nếu không, nó sẽ tạo một. Sau đó, script chạy **docker-compose up --build -d** để tạo và khởi động các Docker containers theo cấu hình trong file **docker-compose.yml**.
9 **Chạy Prisma Client:**
$env:DB_URL="postgresql://postgres:123456@localhost:5433/mydb?schema=public"; npx prisma studio
