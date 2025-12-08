"use client"

import { useState } from "react"
import { useMutation } from "convex/react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { api } from "@/convex/_generated/api"
import type { Doc } from "@/convex/_generated/dataModel"
import { DeckFormDialog } from "@/components/deck-form-dialog"
import { Card } from "@workspace/ui/components/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Button } from "@workspace/ui/components/button"
import { MoreHorizontal, Pencil, Trash2, Layers } from "lucide-react"

interface DeckCardProps {
  deck: Doc<"decks">
}

export function DeckCard({ deck }: DeckCardProps) {
  const router = useRouter()
  const removeDeck = useMutation(api.decks.remove)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (window.confirm(`Delete "${deck.name}"? This will also delete all cards in this deck.`)) {
      await removeDeck({ id: deck._id })
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditOpen(true)
  }

  const handleClick = () => {
    router.push(`/dashboard/decks/${deck._id}`)
  }

  return (
    <>
      <Card
        className="group aspect-square cursor-pointer hover:shadow-md hover:border-primary/50 transition-all p-0 flex flex-col"
        onClick={handleClick}
      >
        <div className="flex-1 p-5 flex flex-col">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg leading-tight line-clamp-2">
              {deck.name}
            </h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity -mt-1 -mr-1"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEdit}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {deck.description && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
              {deck.description}
            </p>
          )}
        </div>

        <div className="px-5 py-3 border-t text-xs text-muted-foreground flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5" />
            <span>{deck.cardCount} {deck.cardCount === 1 ? "card" : "cards"}</span>
          </div>
          <span>{formatDistanceToNow(deck.updatedAt, { addSuffix: true })}</span>
        </div>
      </Card>

      <DeckFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        deck={deck}
      />
    </>
  )
}
