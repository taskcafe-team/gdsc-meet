import { ServerApplication } from "./application/ServerApplication";

async function runApplication(): Promise<void> {
  const serverApplication: ServerApplication = ServerApplication.new(); // tạo một đối tượng serverApplication bằng phương thức new()
  await serverApplication.run(); // dùng để khởi tạo các đối tượng liên quan và chạy ứng dụng nestjs

}
runApplication();
