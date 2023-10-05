import { ServerApplication } from "./application/ServerApplication";

async function runApplication(): Promise<void> {
  const serverApplication: ServerApplication = ServerApplication.new(); //tạo một instance serverApplication
  //với cách này, sẽ giúp code được bảo mật hơn và tiết kiệm bộ nhớ hơn.
  await serverApplication.run(); //trong hàm run là các middlewares, config env, hàm lắng nghe cổng.
}
runApplication();
