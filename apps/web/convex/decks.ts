import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";

async function getUserId(ctx: any): Promise<string | null> {
  const user = await authComponent.getAuthUser(ctx);
  if (!user) return null;
  return user._id as string;
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    const decks = await ctx.db
      .query("decks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return decks.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

export const get = query({
  args: { id: v.id("decks") },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    const deck = await ctx.db.get(args.id);
    if (!deck || deck.userId !== userId) return null;

    return deck;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const now = Date.now();
    const deckId = await ctx.db.insert("decks", {
      userId,
      name: args.name,
      description: args.description,
      isPublic: args.isPublic ?? false,
      cardCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    return deckId;
  },
});

export const update = mutation({
  args: {
    id: v.id("decks"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const deck = await ctx.db.get(args.id);
    if (!deck || deck.userId !== userId) {
      throw new Error("Deck not found");
    }

    await ctx.db.patch(args.id, {
      ...(args.name !== undefined && { name: args.name }),
      ...(args.description !== undefined && { description: args.description }),
      ...(args.isPublic !== undefined && { isPublic: args.isPublic }),
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("decks") },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const deck = await ctx.db.get(args.id);
    if (!deck || deck.userId !== userId) {
      throw new Error("Deck not found");
    }

    const cards = await ctx.db
      .query("cards")
      .withIndex("by_deck", (q) => q.eq("deckId", args.id))
      .collect();

    for (const card of cards) {
      await ctx.db.delete(card._id);
    }

    const deckTags = await ctx.db
      .query("deckTags")
      .withIndex("by_deck", (q) => q.eq("deckId", args.id))
      .collect();

    for (const deckTag of deckTags) {
      await ctx.db.delete(deckTag._id);
    }

    await ctx.db.delete(args.id);
  },
});
