import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";

async function getUserId(ctx: any): Promise<string | null> {
  const user = await authComponent.getAuthUser(ctx);
  if (!user) return null;
  return user._id as string;
}

export const getUsage = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    const usage = await ctx.db
      .query("aiUsage")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return usage;
  },
});

export const incrementMessage = mutation({
  args: { imageCount: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const now = Date.now();
    const existing = await ctx.db
      .query("aiUsage")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        messageCount: existing.messageCount + 1,
        imageUploadCount: existing.imageUploadCount + (args.imageCount ?? 0),
        lastUsedAt: now,
      });
    } else {
      await ctx.db.insert("aiUsage", {
        userId,
        messageCount: 1,
        toolCallCount: 0,
        imageUploadCount: args.imageCount ?? 0,
        lastUsedAt: now,
        createdAt: now,
      });
    }
  },
});

export const incrementToolCall = mutation({
  args: { count: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const now = Date.now();
    const existing = await ctx.db
      .query("aiUsage")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const incrementBy = args.count ?? 1;

    if (existing) {
      await ctx.db.patch(existing._id, {
        toolCallCount: existing.toolCallCount + incrementBy,
        lastUsedAt: now,
      });
    } else {
      await ctx.db.insert("aiUsage", {
        userId,
        messageCount: 0,
        toolCallCount: incrementBy,
        imageUploadCount: 0,
        lastUsedAt: now,
        createdAt: now,
      });
    }
  },
});
