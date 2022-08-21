import { authRouter } from "./router/auth";
import { deviceRouter } from "./router/device";
import { plansRouter } from "./router/plans";
import { postRouter } from "./router/post";
import { processRouter } from "./router/process";
import { scheduleRouter } from "./router/schedule";
import { searchRouter } from "./router/search";
import { userRouter } from "./router/user";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  post: postRouter,
  auth: authRouter,
  user: userRouter,
  plans: plansRouter,
  device: deviceRouter,
  process: processRouter,
  search: searchRouter,
  schedule: scheduleRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
