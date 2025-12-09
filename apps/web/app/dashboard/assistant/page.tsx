"use client"

import { useState, FormEvent } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@workspace/ui/components/sidebar"
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
  ConversationEmptyState,
} from "@/components/ai-elements/conversation"
import {
  Message,
  MessageContent,
  MessageResponse,
  MessageAttachments,
  MessageAttachment,
} from "@/components/ai-elements/message"
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputBody,
  PromptInputHeader,
  PromptInputFooter,
  PromptInputTools,
  PromptInputSubmit,
  PromptInputAttachments,
  PromptInputAttachment,
  PromptInputActionMenu,
  PromptInputActionMenuTrigger,
  PromptInputActionMenuContent,
  PromptInputActionAddAttachments,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input"
import { Loader } from "@/components/ai-elements/loader"
import { Sparkles, CheckCircle, Layers, WrenchIcon } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import Link from "next/link"
import { Badge } from "@workspace/ui/components/badge"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  attachments?: Array<{
    name: string
    contentType: string
    url: string
  }>
  toolInvocations?: Array<{
    toolName: string
    toolCallId: string
    state: "partial-call" | "call" | "result"
    args?: Record<string, unknown>
    result?: unknown
  }>
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [attachments, setAttachments] = useState<
    Array<{ name: string; contentType: string; url: string }>
  >([])
  const [isLoading, setIsLoading] = useState(false)

  const handlePromptSubmit = async (message: PromptInputMessage) => {
    if (!message.text && message.files.length === 0) return

    const userAttachments = message.files.map((file) => ({
      name: file.filename || "file",
      contentType: file.mediaType || "application/octet-stream",
      url: file.url,
    }))

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: message.text || "Please analyze these images",
      attachments: userAttachments.length > 0 ? userAttachments : undefined,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setAttachments([])
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({
              role: m.role,
              content: m.content,
              experimental_attachments: m.attachments,
            })),
            {
              role: "user",
              content: message.text || "Please analyze these images",
              experimental_attachments: userAttachments,
            },
          ],
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No response body")

      const decoder = new TextDecoder()
      let assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
        toolInvocations: [],
      }

      let messageAdded = false

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split("\n").filter((line) => line.trim())

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6)
            if (data === "[DONE]") continue

            try {
              const parsed = JSON.parse(data)
              console.log("Parsed event:", parsed.type, parsed)

              // Handle text delta
              if (parsed.type === "text-delta" && parsed.delta) {
                assistantMessage = {
                  ...assistantMessage,
                  content: assistantMessage.content + parsed.delta,
                }
                if (!messageAdded) {
                  setMessages((prev) => [...prev, assistantMessage])
                  messageAdded = true
                } else {
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantMessage.id ? assistantMessage : m
                    )
                  )
                }
              }

              // Handle tool call start
              if (parsed.type === "tool-input-start") {
                assistantMessage = {
                  ...assistantMessage,
                  toolInvocations: [
                    ...(assistantMessage.toolInvocations || []),
                    {
                      toolName: parsed.toolName,
                      toolCallId: parsed.toolCallId,
                      state: "call" as const,
                      args: {},
                    },
                  ],
                }
                if (!messageAdded) {
                  setMessages((prev) => [...prev, assistantMessage])
                  messageAdded = true
                } else {
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantMessage.id ? assistantMessage : m
                    )
                  )
                }
              }

              // Handle tool input available (update args)
              if (parsed.type === "tool-input-available") {
                const toolIndex =
                  assistantMessage.toolInvocations?.findIndex(
                    (t) => t.toolCallId === parsed.toolCallId
                  ) ?? -1

                if (toolIndex >= 0 && assistantMessage.toolInvocations) {
                  assistantMessage.toolInvocations[toolIndex] = {
                    ...assistantMessage.toolInvocations[toolIndex],
                    args: parsed.input,
                  }
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantMessage.id ? assistantMessage : m
                    )
                  )
                }
              }

              // Handle tool call result
              if (parsed.type === "tool-output-available") {
                const toolIndex =
                  assistantMessage.toolInvocations?.findIndex(
                    (t) => t.toolCallId === parsed.toolCallId
                  ) ?? -1

                if (toolIndex >= 0 && assistantMessage.toolInvocations) {
                  const existingTool = assistantMessage.toolInvocations[toolIndex]
                  if (existingTool) {
                    assistantMessage.toolInvocations[toolIndex] = {
                      ...existingTool,
                      state: "result",
                      result: parsed.output,
                    }
                    setMessages((prev) =>
                      prev.map((m) =>
                        m.id === assistantMessage.id ? assistantMessage : m
                      )
                    )
                  }
                }
              }
            } catch {
              // Not valid JSON, skip
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error)
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, there was an error processing your request.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex h-[calc(100dvh-var(--header-height)-theme(spacing.4))] flex-col overflow-hidden">
          <Conversation className="min-h-0 flex-1">
            <ConversationContent className="mx-auto flex h-full w-full max-w-3xl px-4 py-6 lg:px-6">
              {messages.length === 0 ? (
                <ConversationEmptyState
                  className="flex-1"
                  title="Study Assistant"
                  description="Upload images of your notes to create flashcards, ask for study tips, or request help organizing your decks."
                  icon={<Sparkles className="h-8 w-8" />}
                />
              ) : (
                messages.map((message) => (
                  <div key={message.id} className="space-y-4">
                    {/* Render user attachments */}
                    {message.role === "user" &&
                      message.attachments &&
                      message.attachments.length > 0 && (
                        <MessageAttachments>
                          {message.attachments.map((attachment, i) => (
                            <MessageAttachment
                              key={i}
                              data={{
                                type: "file",
                                url: attachment.url,
                                mediaType: attachment.contentType,
                                filename: attachment.name,
                              }}
                            />
                          ))}
                        </MessageAttachments>
                      )}

                    <Message from={message.role}>
                      <MessageContent>
                        {message.content && (
                          <MessageResponse>{message.content}</MessageResponse>
                        )}

                        {/* Render tool invocations */}
                        {message.toolInvocations?.map((tool, i) => (
                          <ToolInvocationCard key={i} toolInvocation={tool} />
                        ))}
                      </MessageContent>
                    </Message>
                  </div>
                ))
              )}

              {isLoading && (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Loader size={16} />
                  <span>Thinking...</span>
                </div>
              )}

              {/* Spacer to prevent content from being hidden behind input */}
              {messages.length > 0 && <div className="h-4 shrink-0" />}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>

          <div className="mx-auto w-full max-w-3xl px-4 pb-4 lg:px-6">
            <PromptInput
              onSubmit={handlePromptSubmit}
              accept="image/*"
              multiple
              globalDrop
            >
              <PromptInputHeader className="p-0">
                <PromptInputAttachments>
                  {(attachment) => <PromptInputAttachment data={attachment} />}
                </PromptInputAttachments>
              </PromptInputHeader>
              <PromptInputBody>
                <PromptInputTextarea
                  value={input}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setInput(e.target.value)
                  }
                  placeholder="Upload notes or ask for study help..."
                  className="p-5"
                />
              </PromptInputBody>
              <PromptInputFooter>
                <PromptInputTools>
                  <PromptInputActionMenu>
                    <PromptInputActionMenuTrigger />
                    <PromptInputActionMenuContent>
                      <PromptInputActionAddAttachments label="Upload notes (images)" />
                    </PromptInputActionMenuContent>
                  </PromptInputActionMenu>
                </PromptInputTools>
                <PromptInputSubmit disabled={(!input.trim() && !isLoading)} />
              </PromptInputFooter>
            </PromptInput>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

function ToolInvocationCard({
  toolInvocation,
}: {
  toolInvocation: {
    toolName: string
    toolCallId: string
    state: "partial-call" | "call" | "result"
    args?: Record<string, unknown>
    result?: unknown
  }
}) {
  const { toolName, state, args, result } = toolInvocation
  const typedResult = result as
    | { success?: boolean; deckId?: string; cardId?: string; message?: string }
    | undefined

  const toolDisplayNames: Record<string, string> = {
    createDeck: "Create Deck",
    addCardToDeck: "Add Card",
    getDecks: "List Decks",
    getDeckCards: "Get Cards",
  }

  if (
    toolName === "createDeck" &&
    state === "result" &&
    typedResult?.success &&
    typedResult?.deckId
  ) {
    return (
      <div className="my-2 flex items-center gap-3 rounded-md border bg-card p-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">{typedResult.message}</p>
          <p className="text-muted-foreground text-xs">
            Deck created successfully
          </p>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href={`/dashboard/decks/${typedResult.deckId}`}>
            <Layers className="mr-2 h-4 w-4" />
            Open
          </Link>
        </Button>
      </div>
    )
  }

  if (
    toolName === "addCardToDeck" &&
    state === "result" &&
    typedResult?.success
  ) {
    return (
      <div className="my-1 flex items-center gap-2 text-muted-foreground text-xs">
        <CheckCircle className="h-3 w-3 text-green-600" />
        <span>Card added</span>
      </div>
    )
  }

  if (state === "call" || state === "partial-call") {
    return (
      <div className="my-2 flex items-center gap-2 rounded-md border bg-muted/50 p-3">
        <WrenchIcon className="h-4 w-4 text-muted-foreground animate-pulse" />
        <span className="text-sm text-muted-foreground">
          {toolDisplayNames[toolName] || toolName}...
        </span>
        <Badge variant="secondary" className="text-xs">
          Running
        </Badge>
      </div>
    )
  }

  if (state === "result" && result) {
    return (
      <div className="my-2 flex items-center gap-2 rounded-md border bg-muted/50 p-3">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <span className="text-sm">
          {toolDisplayNames[toolName] || toolName}
        </span>
        <Badge variant="secondary" className="text-xs">
          Done
        </Badge>
      </div>
    )
  }

  return null
}
