"use client"

import { useState, useMemo, useEffect } from "react"
import { useQuery, useMutation } from "convex/react"
import { useParams } from "next/navigation"
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { DeckFormDialog } from "@/components/deck-form-dialog"
import { FlashcardFormDialog } from "@/components/flashcard-form-dialog"
import { FlashcardItem, FlashcardDragOverlay } from "@/components/flashcard-item"
import {
  SidebarInset,
  SidebarProvider,
} from "@workspace/ui/components/sidebar"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Plus, Pencil, Play, LayoutGrid, Stars } from "lucide-react"

export default function DeckDetailPage() {
  const params = useParams()
  const deckId = params.id as Id<"decks">

  const deck = useQuery(api.decks.get, { id: deckId })
  const cards = useQuery(api.cards.list, { deckId })
  const reorderCards = useMutation(api.cards.reorder)

  const [isEditDeckOpen, setIsEditDeckOpen] = useState(false)
  const [isAddCardOpen, setIsAddCardOpen] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [optimisticCards, setOptimisticCards] = useState(cards)

  useEffect(() => {
    if (cards) {
      setOptimisticCards(cards)
    }
  }, [cards])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const displayCards = optimisticCards ?? cards

  const cardIds = useMemo(
    () => displayCards?.map((card) => card._id) ?? [],
    [displayCards]
  )

  const activeCard = useMemo(
    () => displayCards?.find((card) => card._id === activeId),
    [displayCards, activeId]
  )

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id && displayCards) {
      const oldIndex = displayCards.findIndex((c) => c._id === active.id)
      const newIndex = displayCards.findIndex((c) => c._id === over.id)
      const newOrder = arrayMove(displayCards, oldIndex, newIndex)

      setOptimisticCards(newOrder)

      reorderCards({
        deckId,
        cardIds: newOrder.map((c) => c._id),
      })
    }

    setActiveId(null)
  }

  function handleDragCancel() {
    setActiveId(null)
  }

  if (deck === undefined) {
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
          <SiteHeader
            breadcrumbs={[
              { label: "Decks", href: "/dashboard/decks" },
              { label: "Loading..." },
            ]}
          />
          <div className="flex flex-1 flex-col">
            <div className="flex flex-col gap-6 py-6 px-4 lg:px-6">
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="aspect-[4/3] rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (deck === null) {
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
          <SiteHeader
            breadcrumbs={[
              { label: "Decks", href: "/dashboard/decks" },
              { label: "Not Found" },
            ]}
          />
          <div className="flex flex-1 flex-col items-center justify-center">
            <h1 className="text-xl font-semibold mb-2">Deck not found</h1>
            <p className="text-muted-foreground mb-4">
              This deck doesn't exist or you don't have access to it.
            </p>
            <Button asChild>
              <a href="/dashboard/decks">Back to Decks</a>
            </Button>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
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
        <SiteHeader
          breadcrumbs={[
            { label: "Decks", href: "/dashboard/decks" },
            { label: deck.name },
          ]}
        />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-6 py-6 px-4 lg:px-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold tracking-tight">
                      {deck.name}
                    </h1>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setIsEditDeckOpen(true)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                  {deck.description && (
                    <p className="text-muted-foreground mt-1">
                      {deck.description}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">
                    {deck.cardCount} {deck.cardCount === 1 ? "card" : "cards"}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <Button variant="outline">
                    <Stars className="h-4 w-4" />
                    Assistant
                  </Button>
                  <Button onClick={() => setIsAddCardOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Add Card
                  </Button>
                </div>
              </div>

              {displayCards === undefined ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
                  {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="aspect-[4/3] rounded-xl" />
                  ))}
                </div>
              ) : displayCards.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-xl bg-muted/20">
                  <div className="rounded-full bg-muted p-4 mb-4">
                    <LayoutGrid className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h2 className="text-lg font-semibold mb-1">No cards yet</h2>
                  <p className="text-muted-foreground mb-4 max-w-sm">
                    Add your first flashcard to start building this deck
                  </p>
                  <Button onClick={() => setIsAddCardOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add your first card
                  </Button>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onDragCancel={handleDragCancel}
                >
                  <SortableContext
                    items={cardIds}
                    strategy={rectSortingStrategy}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
                      {displayCards.map((card, index) => (
                        <FlashcardItem
                          key={card._id}
                          card={card}
                          deckId={deckId}
                          index={index}
                        />
                      ))}
                    </div>
                  </SortableContext>
                  <DragOverlay>
                    {activeCard ? (
                      <div className="w-[280px]">
                        <FlashcardDragOverlay card={activeCard} />
                      </div>
                    ) : null}
                  </DragOverlay>
                </DndContext>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>

      <DeckFormDialog
        open={isEditDeckOpen}
        onOpenChange={setIsEditDeckOpen}
        deck={deck}
      />

      <FlashcardFormDialog
        open={isAddCardOpen}
        onOpenChange={setIsAddCardOpen}
        deckId={deckId}
      />
    </SidebarProvider>
  )
}
