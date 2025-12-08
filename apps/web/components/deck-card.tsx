"use client"

import { useState } from "react"
import { useMutation } from "convex/react"
import { useRouter } from "next/navigation"
import { api } from "@/convex/_generated/api"
import type { Doc } from "@/convex/_generated/dataModel"
import { DeckFormDialog } from "@/components/deck-form-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Button } from "@workspace/ui/components/button"
import { MoreVertical, Pencil, Trash2, Layers } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

interface DeckCardProps {
  deck: Doc<"decks">
}

export function DeckCard({ deck }: DeckCardProps) {
  const router = useRouter()
  const removeDeck = useMutation(api.decks.remove)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const handleDelete = async () => {
    if (window.confirm(`Delete "${deck.name}"? This will also delete all cards in this deck.`)) {
      await removeDeck({ id: deck._id })
    }
  }

  const handleCardClick = () => {
    router.push(`/dashboard/decks/${deck._id}`)
  }

  return (
    <>
      <div className="group relative">
        {/* Actions dropdown - outside the clickable card area */}
        <div className="absolute top-3 right-3 z-20">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-md hover:bg-muted"
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

        {/* Clickable Card */}
        <div
          onClick={handleCardClick}
          className={cn(
            "aspect-[4/3] rounded-xl border-2 border-border/60 cursor-pointer",
            "bg-gradient-to-br from-card via-card to-muted/30",
            "shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1),0_8px_40px_-8px_rgba(0,0,0,0.05)]",
            "dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3),0_8px_40px_-8px_rgba(0,0,0,0.2)]",
            "overflow-hidden transition-all duration-200",
            "hover:border-primary/40 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.15),0_16px_50px_-8px_rgba(0,0,0,0.1)]",
            "dark:hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.4),0_16px_50px_-8px_rgba(0,0,0,0.3)]"
          )}
        >
          {/* Paper texture overlay */}
          <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIvPjwvc3ZnPg==')]" />

          <div className="relative h-full flex flex-col p-5">
            {/* Card count badge */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70 mb-3">
              <Layers className="h-3.5 w-3.5" />
              <span>{deck.cardCount} {deck.cardCount === 1 ? "card" : "cards"}</span>
            </div>

            {/* Deck name */}
            <div className="flex-1 flex items-center justify-center">
              <h3 className="text-lg font-semibold text-center leading-tight line-clamp-3 px-2">
                {deck.name}
              </h3>
            </div>

            {/* Description if exists */}
            {deck.description && (
              <p className="text-xs text-muted-foreground/60 text-center line-clamp-2 mt-2">
                {deck.description}
              </p>
            )}
          </div>

          {/* Bottom edge highlight */}
          <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>
      </div>

      <DeckFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        deck={deck}
      />
    </>
  )
}
