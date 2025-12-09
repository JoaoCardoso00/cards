import { streamText } from "ai"
import { google } from "@ai-sdk/google"
import { z } from "zod"
import { getToken } from "@/lib/auth-server"
import { fetchQuery, fetchMutation } from "convex/nextjs"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"

export const maxDuration = 60

const SYSTEM_PROMPT = `You are a helpful flashcard study assistant for the Cards app. You help users:

1. **Create flashcards from their notes** - When users upload images of handwritten or typed notes, analyze them carefully and create comprehensive flashcard decks. Extract key concepts, definitions, formulas, and facts.

2. **Create and organize decks** - Help users structure their learning material into logical decks.

3. **Provide study advice** - Give tips on spaced repetition, active recall, and effective studying.

## When processing note images:
- Carefully read all text in the image
- Identify key concepts, definitions, terms, and facts
- Create clear, concise flashcards with:
  - Front: A question, term, or prompt
  - Back: The answer, definition, or explanation
- Group related cards into appropriately named decks
- For complex topics, break down into multiple cards
- Include context when necessary for understanding

## Card creation guidelines:
- Keep fronts short and specific (one concept per card)
- Make backs complete but concise
- Use active recall format (questions, not just statements)
- For definitions: Front = term, Back = definition
- For processes: Front = "What are the steps of X?", Back = numbered steps
- For formulas: Front = "Formula for X", Back = formula with variable explanations

## Important:
- When creating multiple cards, create them one at a time using the addCardToDeck tool
- Always create a deck first before adding cards to it
- After creating content, summarize what was created for the user`

export async function POST(req: Request) {
  try {
    const token = await getToken()
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    const { messages: rawMessages } = await req.json()

    // Count images in the latest message for usage tracking
    const latestMessage = rawMessages[rawMessages.length - 1]
    const imageCount =
      latestMessage?.experimental_attachments?.filter(
        (a: { contentType?: string }) => a.contentType?.startsWith("image/")
      )?.length ?? 0

    // Track message usage
    await fetchMutation(api.aiUsage.incrementMessage, { imageCount }, { token })

    // Fetch user's decks for context
    const decks = await fetchQuery(api.decks.list, {}, { token })
    const deckContext =
      decks.length > 0
        ? `\n\n## Current user's decks:\n${decks.map((d) => `- "${d.name}" (ID: ${d._id}, ${d.cardCount} cards)${d.description ? `: ${d.description}` : ""}`).join("\n")}`
        : "\n\n## Current user's decks:\nNo decks yet."

    // Convert messages with experimental_attachments to the new format
    const messages = rawMessages.map((msg: {
      role: string
      content: string
      experimental_attachments?: Array<{
        url: string
        contentType: string
        name?: string
      }>
    }) => {
      if (msg.experimental_attachments && msg.experimental_attachments.length > 0) {
        // Convert to multi-part content format
        const content: Array<{ type: string; text?: string; data?: string; mediaType?: string }> = []

        // Add text part if present
        if (msg.content) {
          content.push({ type: "text", text: msg.content })
        }

        // Add file parts for each attachment
        for (const attachment of msg.experimental_attachments) {
          if (attachment.contentType?.startsWith("image/")) {
            content.push({
              type: "file",
              data: attachment.url,
              mediaType: attachment.contentType,
            })
          }
        }

        return { role: msg.role, content }
      }
      return msg
    })

    // Stream response
    const result = streamText({
      model: google("gemini-2.5-flash", {
        thinkingConfig: { thinkingBudget: 0 },
      }),
      system: SYSTEM_PROMPT + deckContext,
      messages,
      tools: {
        testTool: {
          description: "A test tool that returns a greeting. Use this when the user asks to test tools.",
          inputSchema: z.object({
            name: z.string().describe("Name to greet"),
          }),
          execute: async ({ name }: { name: string }) => {
            console.log("Test tool called with:", name)
            return {
              success: true,
              message: `Hello, ${name}! The tool is working correctly.`,
            }
          },
        },

        createDeck: {
          description: "Create a new flashcard deck for the user",
          inputSchema: z.object({
            name: z.string().describe("Name of the deck"),
            description: z
              .string()
              .optional()
              .describe("Optional description of the deck"),
          }),
          execute: async ({
            name,
            description,
          }: {
            name: string
            description?: string
          }) => {
            const deckId = await fetchMutation(
              api.decks.create,
              { name, description },
              { token }
            )
            await fetchMutation(api.aiUsage.incrementToolCall, {}, { token })
            return {
              success: true,
              deckId: String(deckId),
              message: `Created deck "${name}"`,
            }
          },
        },

        addCardToDeck: {
          description: "Add a flashcard to an existing deck",
          inputSchema: z.object({
            deckId: z.string().describe("ID of the deck to add the card to"),
            frontText: z
              .string()
              .describe("Front side text of the card (question or term)"),
            backText: z
              .string()
              .describe("Back side text of the card (answer or definition)"),
          }),
          execute: async ({
            deckId,
            frontText,
            backText,
          }: {
            deckId: string
            frontText: string
            backText: string
          }) => {
            const cardId = await fetchMutation(
              api.cards.create,
              {
                deckId: deckId as Id<"decks">,
                frontText,
                backText,
              },
              { token }
            )
            await fetchMutation(api.aiUsage.incrementToolCall, {}, { token })
            return {
              success: true,
              cardId: String(cardId),
              message: `Added card to deck`,
            }
          },
        },

        getDecks: {
          description: "Get all decks belonging to the user",
          inputSchema: z.object({}),
          execute: async () => {
            const userDecks = await fetchQuery(api.decks.list, {}, { token })
            return {
              decks: userDecks.map((d) => ({
                id: String(d._id),
                name: d.name,
                cardCount: d.cardCount,
                description: d.description,
              })),
            }
          },
        },

        getDeckCards: {
          description: "Get all cards in a specific deck",
          inputSchema: z.object({
            deckId: z.string().describe("ID of the deck"),
          }),
          execute: async ({ deckId }: { deckId: string }) => {
            const cards = await fetchQuery(
              api.cards.list,
              { deckId: deckId as Id<"decks"> },
              { token }
            )
            return {
              cards: cards.map((c) => ({
                id: String(c._id),
                frontText: c.frontText,
                backText: c.backText,
              })),
            }
          },
        },
      },
      toolChoice: "auto",
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
