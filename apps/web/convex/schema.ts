import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  folders: defineTable({
    userId: v.string(), // Better Auth user ID
    name: v.string(),
    parentId: v.optional(v.id("folders")), // For nested folders
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  tags: defineTable({
    userId: v.string(),
    name: v.string(),
    color: v.optional(v.string()), // Hex color for UI
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  decks: defineTable({
    userId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    isPublic: v.boolean(),
    folderId: v.optional(v.id("folders")),
    forkedFromId: v.optional(v.id("decks")), // Original deck if forked
    cardCount: v.number(), // Denormalized for performance
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_folder", ["folderId"])
    .index("by_public", ["isPublic"]),

  deckTags: defineTable({
    deckId: v.id("decks"),
    tagId: v.id("tags"),
  })
    .index("by_deck", ["deckId"])
    .index("by_tag", ["tagId"]),

  cards: defineTable({
    deckId: v.id("decks"),
    frontText: v.optional(v.string()),
    frontImageUrl: v.optional(v.string()),
    backText: v.optional(v.string()),
    backImageUrl: v.optional(v.string()),
    position: v.number(), // Order within deck
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_deck", ["deckId"])
    .index("by_deck_position", ["deckId", "position"]),

  cardProgress: defineTable({
    userId: v.string(),
    cardId: v.id("cards"),
    deckId: v.id("decks"), // Denormalized for efficient deck queries
    status: v.union(
      v.literal("new"),
      v.literal("learning"),
      v.literal("review"),
      v.literal("relearning")
    ),
    easeFactor: v.number(), // SM-2 ease factor (default 2.5)
    interval: v.number(), // Days until next review
    repetitions: v.number(), // Successful review count
    nextReviewAt: v.number(), // Timestamp for next review
    lastReviewedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user_card", ["userId", "cardId"])
    .index("by_user_deck", ["userId", "deckId"])
    .index("by_user_due", ["userId", "nextReviewAt"]),

  studySessions: defineTable({
    userId: v.string(),
    deckId: v.id("decks"),
    startedAt: v.number(),
    endedAt: v.optional(v.number()), // null if ongoing
    cardsStudied: v.number(),
    correctCount: v.number(),
    incorrectCount: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_date", ["userId", "startedAt"]),

  userStats: defineTable({
    userId: v.string(), // Better Auth user ID (unique per user)
    currentStreak: v.number(),
    longestStreak: v.number(),
    lastStudyDate: v.string(), // ISO date (YYYY-MM-DD) for streak calc
    totalCardsStudied: v.number(),
    totalTimeSpent: v.number(), // Total study time in seconds
  }).index("by_user", ["userId"]),
});
