import { ServerApplication } from "./application/ServerApplication";

export async function runApplication(): Promise<void> {
  const serverApplication: ServerApplication = ServerApplication.new();
  await serverApplication.run();
}
runApplication();
