"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { useRouter } from "next/navigation"
import { api } from "@/convex/_generated/api"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { DeckCard } from "@/components/deck-card"
import { DeckFormDialog } from "@/components/deck-form-dialog"
import {
  SidebarInset,
  SidebarProvider,
} from "@workspace/ui/components/sidebar"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Plus, Layers } from "lucide-react"

export default function DecksPage() {
  const router = useRouter()
  const decks = useQuery(api.decks.list)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const handleCreateSuccess = (deckId: string) => {
    router.push(`/dashboard/decks/${deckId}`)
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
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-6 py-6 px-4 lg:px-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Decks</h1>
                  <p className="text-muted-foreground">
                    Create and manage your flashcard decks
                  </p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="h-4 w-4" />
                  New Deck
                </Button>
              </div>

              {decks === undefined ? (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="aspect-[4/3] rounded-xl" />
                  ))}
                </div>
              ) : decks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="rounded-full bg-muted p-4 mb-4">
                    <Layers className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h2 className="text-lg font-semibold mb-1">No decks yet</h2>
                  <p className="text-muted-foreground mb-4 max-w-sm">
                    Create your first deck to start studying with flashcards
                  </p>
                  <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create your first deck
                  </Button>
                </div>
              ) : (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {decks.map((deck) => (
                    <DeckCard key={deck._id} deck={deck} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>

      <DeckFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={handleCreateSuccess}
      />
    </SidebarProvider>
  )
}
