import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "../../../../server/routers/_app.js";
import { createTRPCContext } from "../../../../server/context.js";

const isDev = process.env["NODE_ENV"] === "development";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createTRPCContext(req),
    ...(isDev
      ? {
          onError: ({ path, error }: { path: string | undefined; error: { message: string } }) => {
            console.error(`❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`);
          },
        }
      : {}),
  });

export { handler as GET, handler as POST };
