import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";

async function getUserId(ctx: any): Promise<string | null> {
  const user = await authComponent.getAuthUser(ctx);
  if (!user) return null;
  return user._id as string;
}

export const list = query({
  args: { deckId: v.id("decks") },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    const deck = await ctx.db.get(args.deckId);
    if (!deck || deck.userId !== userId) return [];

    const cards = await ctx.db
      .query("cards")
      .withIndex("by_deck", (q) => q.eq("deckId", args.deckId))
      .collect();

    return cards.sort((a, b) => a.position - b.position);
  },
});

export const get = query({
  args: { id: v.id("cards") },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    const card = await ctx.db.get(args.id);
    if (!card) return null;

    const deck = await ctx.db.get(card.deckId);
    if (!deck || deck.userId !== userId) return null;

    return card;
  },
});

export const create = mutation({
  args: {
    deckId: v.id("decks"),
    frontText: v.optional(v.string()),
    frontImageUrl: v.optional(v.string()),
    backText: v.optional(v.string()),
    backImageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const deck = await ctx.db.get(args.deckId);
    if (!deck || deck.userId !== userId) {
      throw new Error("Deck not found");
    }

    const cards = await ctx.db
      .query("cards")
      .withIndex("by_deck", (q) => q.eq("deckId", args.deckId))
      .collect();
    const maxPosition = cards.reduce((max, card) => Math.max(max, card.position), -1);

    const now = Date.now();
    const cardId = await ctx.db.insert("cards", {
      deckId: args.deckId,
      frontText: args.frontText,
      frontImageUrl: args.frontImageUrl,
      backText: args.backText,
      backImageUrl: args.backImageUrl,
      position: maxPosition + 1,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.patch(args.deckId, {
      cardCount: deck.cardCount + 1,
      updatedAt: now,
    });

    return cardId;
  },
});

export const update = mutation({
  args: {
    id: v.id("cards"),
    frontText: v.optional(v.string()),
    frontImageUrl: v.optional(v.string()),
    backText: v.optional(v.string()),
    backImageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const card = await ctx.db.get(args.id);
    if (!card) throw new Error("Card not found");

    const deck = await ctx.db.get(card.deckId);
    if (!deck || deck.userId !== userId) {
      throw new Error("Card not found");
    }

    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    await ctx.db.patch(card.deckId, {
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("cards") },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const card = await ctx.db.get(args.id);
    if (!card) throw new Error("Card not found");

    const deck = await ctx.db.get(card.deckId);
    if (!deck || deck.userId !== userId) {
      throw new Error("Card not found");
    }

    await ctx.db.delete(args.id);

    await ctx.db.patch(card.deckId, {
      cardCount: Math.max(0, deck.cardCount - 1),
      updatedAt: Date.now(),
    });
  },
});

export const reorder = mutation({
  args: {
    deckId: v.id("decks"),
    cardIds: v.array(v.id("cards")),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const deck = await ctx.db.get(args.deckId);
    if (!deck || deck.userId !== userId) {
      throw new Error("Deck not found");
    }

    for (let i = 0; i < args.cardIds.length; i++) {
      await ctx.db.patch(args.cardIds[i], { position: i });
    }

    await ctx.db.patch(args.deckId, {
      updatedAt: Date.now(),
    });
  },
});
