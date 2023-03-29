/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1)
 * 2. You want to create a new middleware or type of procedure (see Part 3)
 *
 * tl;dr - this is where all the tRPC server stuff is created and plugged in.
 * The pieces you will need to use are documented accordingly near the end
 */
import { TRPCError, initTRPC } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import superjson from "superjson";
import { ZodError } from "zod";

import { prisma } from "@acme/db";

/**
 * This helper generates the "internals" for a tRPC context. If you need to use
 * it, you can export it from here
 *
 * Examples of things you may need it for:
 * - testing, so we dont have to mock Next.js' req/res
 * - trpc's `createSSGHelpers` where we don't have req/res
 * @see https://create.t3.gg/en/usage/trpc#-servertrpccontextts
 */
// Helper function for generating context
export const createInnerTRPCContext = (req: CreateNextContextOptions["req"]) => {
  return {
    prisma,
    search: req.query,
    body: req.body as { 0: { json: { token: string } } } | undefined,
  };
};

/**
 * This is the actual context you'll use in your router. It will be used to
 * process every request that goes through your tRPC endpoint
 * @link https://trpc.io/docs/context
 */
export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { req } = opts;

  return createInnerTRPCContext(req);
};

/**
 * 2. INITIALIZATION
 *
 * This is where the trpc api is initialized, connecting the context and
 * transformer
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these
 * a lot in the /src/server/api/routers folder
 */

/**
 * This is how you create new routers and subrouters in your tRPC API
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Public (unauthed) procedure
 *
 * This is the base piece you use to build new queries and mutations on your
 * tRPC API. It does not guarantee that a user querying is authorized, but you
 * can still access user session data if they are logged in
 */
export const publicProcedure = t.procedure;

function isTokened(input: unknown): input is { token: string } {
  return !!(
    input &&
    Object.hasOwn(input, "token") &&
    typeof (input as Record<string, unknown>).token === "string"
  );
}

/**
 * Reusable middleware that enforces users are logged in before running the
 * procedure
 */
const enforceUserIsAuthed = t.middleware(async ({ ctx, next }) => {
  let input;
  if (ctx.search["input"]) {
    input = (
      JSON.parse(ctx.search["input"] as string) as { 0: { json: unknown } }
    )[0].json;
    if (!isTokened(input)) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Missing token parameter",
      });
    }
  } else {
    input = ctx.body![0].json;
  }

  const { token } = input;

  const userFound = await ctx.prisma.user.findFirst({
    where: {
      sessions: {
        some: {
          sessionToken: token,
        },
      },
    },
  });

  if (userFound) {
    return next({
      ctx: {
        ...ctx,
        user: userFound,
      },
    });
  }

  throw new TRPCError({
    code: "UNAUTHORIZED",
    message: "User not found in database",
  });
});

/**
 * Protected (authed) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use
 * this. It verifies the session is valid and guarantees ctx.session.user is not
 * null
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);
