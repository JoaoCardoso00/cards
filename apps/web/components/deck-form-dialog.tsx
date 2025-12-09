"use client"

import { useEffect } from "react"
import { useForm } from "@tanstack/react-form"
import { useMutation } from "convex/react"
import * as z from "zod"
import { api } from "@/convex/_generated/api"
import type { Doc } from "@/convex/_generated/dataModel"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@workspace/ui/components/dialog"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@workspace/ui/components/sheet"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@workspace/ui/components/field"

const deckSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  description: z.string().max(500, "Description is too long"),
})

interface DeckFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  deck?: Doc<"decks"> | null
  onSuccess?: (deckId: string) => void
}

export function DeckFormDialog({
  open,
  onOpenChange,
  deck,
  onSuccess,
}: DeckFormDialogProps) {
  const isMobile = useIsMobile()
  const createDeck = useMutation(api.decks.create)
  const updateDeck = useMutation(api.decks.update)

  const isEditing = !!deck

  const form = useForm({
    defaultValues: {
      name: deck?.name ?? "",
      description: deck?.description ?? "",
    },
    validators: {
      onSubmit: deckSchema,
    },
    onSubmit: async ({ value }) => {
      if (isEditing && deck) {
        await updateDeck({
          id: deck._id,
          name: value.name,
          description: value.description || undefined,
        })
        onOpenChange(false)
        onSuccess?.(deck._id)
      } else {
        const deckId = await createDeck({
          name: value.name,
          description: value.description || undefined,
        })
        onOpenChange(false)
        onSuccess?.(deckId)
      }
    },
  })

  // Reset form when deck changes or dialog opens
  useEffect(() => {
    if (open) {
      form.reset()
      form.setFieldValue("name", deck?.name ?? "")
      form.setFieldValue("description", deck?.description ?? "")
    }
  }, [open, deck])

  const title = isEditing ? "Edit deck" : "Create new deck"
  const description = isEditing
    ? "Update your deck's details"
    : "Add a new flashcard deck to your collection"

  const formContent = (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="flex flex-col gap-4"
    >
      <FieldGroup>
        <form.Field
          name="name"
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor="deck-name">Name</FieldLabel>
                <Input
                  id="deck-name"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g., Japanese Vocabulary"
                  autoFocus
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        />

        <form.Field
          name="description"
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor="deck-description">Description (optional)</FieldLabel>
                <Input
                  id="deck-description"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="What's this deck about?"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        />
      </FieldGroup>
    </form>
  )

  const footerContent = (
    <>
      <Button variant="outline" onClick={() => onOpenChange(false)} type="button">
        Cancel
      </Button>
      <Button onClick={() => form.handleSubmit()} disabled={form.state.isSubmitting}>
        {form.state.isSubmitting
          ? isEditing
            ? "Saving..."
            : "Creating..."
          : isEditing
            ? "Save Changes"
            : "Create Deck"}
      </Button>
    </>
  )

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-auto">
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription>{description}</SheetDescription>
          </SheetHeader>
          <div className="px-4">{formContent}</div>
          <SheetFooter>{footerContent}</SheetFooter>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {formContent}
        <DialogFooter>{footerContent}</DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
