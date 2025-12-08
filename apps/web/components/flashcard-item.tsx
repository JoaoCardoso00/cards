"use client"

import { useState } from "react"
import { useMutation } from "convex/react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { api } from "@/convex/_generated/api"
import type { Doc, Id } from "@/convex/_generated/dataModel"
import { FlashcardFormDialog } from "@/components/flashcard-form-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Button } from "@workspace/ui/components/button"
import { MoreVertical, Pencil, Trash2 } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

interface FlashcardItemProps {
  card: Doc<"cards">
  deckId: Id<"decks">
  index: number
}

export function FlashcardItem({ card, deckId, index }: FlashcardItemProps) {
  const removeCard = useMutation(api.cards.remove)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card._id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleDelete = async () => {
    if (window.confirm("Delete this card?")) {
      await removeCard({ id: card._id })
    }
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={cn(
          "group relative cursor-grab active:cursor-grabbing",
          isDragging && "z-50 opacity-50"
        )}
      >
        <div className="absolute top-2 right-2 z-20">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-md hover:bg-muted"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem onSelect={() => setIsEditOpen(true)}>
                <Pencil className="h-3.5 w-3.5 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onSelect={handleDelete}
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div
          className="relative w-full aspect-[4/3]"
          style={{ perspective: "1000px" }}
          onClick={(e) => {
            e.stopPropagation()
            setIsFlipped(!isFlipped)
          }}
        >
          <div
            className={cn(
              "absolute inset-0 transition-transform duration-500 ease-out",
              "[transform-style:preserve-3d]",
              isFlipped && "[transform:rotateY(180deg)]"
            )}
          >
            <div
              className={cn(
                "absolute inset-0 [backface-visibility:hidden]",
                "rounded-xl border-2 border-border/60",
                "bg-gradient-to-br from-card via-card to-muted/30",
                "shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1),0_8px_40px_-8px_rgba(0,0,0,0.05)]",
                "dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3),0_8px_40px_-8px_rgba(0,0,0,0.2)]",
                "overflow-hidden"
              )}
            >
              <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIvPjwvc3ZnPg==')]" />

              <div className="relative h-full flex flex-col p-5">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-medium mb-3">
                  Front
                </span>
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-base leading-relaxed text-center font-serif line-clamp-5 px-2 mb-2">
                    {card.frontText || (
                      <span className="text-muted-foreground/50 italic font-sans text-sm">
                        No content
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            </div>

            <div
              className={cn(
                "absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]",
                "rounded-xl border-2 border-primary/20",
                "bg-gradient-to-br from-primary/5 via-card to-primary/10",
                "dark:from-primary/10 dark:via-card dark:to-primary/5",
                "shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1),0_8px_40px_-8px_rgba(0,0,0,0.05)]",
                "dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3),0_8px_40px_-8px_rgba(0,0,0,0.2)]",
                "overflow-hidden"
              )}
            >
              <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIvPjwvc3ZnPg==')]" />

              <div className="relative h-full flex flex-col p-5">
                <span className="text-[10px] uppercase tracking-widest text-primary/50 font-medium mb-3">
                  Back
                </span>
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-base leading-relaxed text-center font-serif line-clamp-5 px-2 mb-2">
                    {card.backText || (
                      <span className="text-muted-foreground/50 italic font-sans text-sm">
                        No content
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            </div>
          </div>
        </div>

      </div>

      <FlashcardFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        deckId={deckId}
        card={card}
      />
    </>
  )
}

export function FlashcardDragOverlay({ card }: { card: Doc<"cards"> }) {
  return (
    <div className="w-full aspect-[4/3] cursor-grabbing">
      <div
        className={cn(
          "h-full rounded-xl border-2 border-primary/40",
          "bg-gradient-to-br from-card via-card to-muted/30",
          "shadow-[0_8px_30px_-4px_rgba(0,0,0,0.2),0_16px_60px_-8px_rgba(0,0,0,0.1)]",
          "dark:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.4),0_16px_60px_-8px_rgba(0,0,0,0.3)]",
          "overflow-hidden scale-105"
        )}
      >
        <div className="relative h-full flex flex-col p-5">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-medium mb-3">
            Front
          </span>
          <div className="flex-1 flex items-center justify-center">
            <p className="text-base leading-relaxed text-center font-serif line-clamp-5 px-2">
              {card.frontText || (
                <span className="text-muted-foreground/50 italic font-sans text-sm">
                  No content
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
