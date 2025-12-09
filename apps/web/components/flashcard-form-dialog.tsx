"use client"

import { useEffect } from "react"
import { useForm } from "@tanstack/react-form"
import { useMutation } from "convex/react"
import * as z from "zod"
import { api } from "@/convex/_generated/api"
import type { Doc, Id } from "@/convex/_generated/dataModel"
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
import { Label } from "@workspace/ui/components/label"
import {
  Field,
  FieldLabel,
  FieldGroup,
} from "@workspace/ui/components/field"

const cardSchema = z.object({
  frontText: z.string().max(2000, "Front text is too long"),
  backText: z.string().max(2000, "Back text is too long"),
}).refine(
  (data) => data.frontText || data.backText,
  { message: "Card must have at least front or back text" }
)

interface FlashcardFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  deckId: Id<"decks">
  card?: Doc<"cards"> | null
  onSuccess?: () => void
}

export function FlashcardFormDialog({
  open,
  onOpenChange,
  deckId,
  card,
  onSuccess,
}: FlashcardFormDialogProps) {
  const isMobile = useIsMobile()
  const createCard = useMutation(api.cards.create)
  const updateCard = useMutation(api.cards.update)

  const isEditing = !!card

  const form = useForm({
    defaultValues: {
      frontText: card?.frontText ?? "",
      backText: card?.backText ?? "",
    },
    validators: {
      onSubmit: cardSchema,
    },
    onSubmit: async ({ value }) => {
      if (isEditing && card) {
        await updateCard({
          id: card._id,
          frontText: value.frontText || undefined,
          backText: value.backText || undefined,
        })
      } else {
        await createCard({
          deckId,
          frontText: value.frontText || undefined,
          backText: value.backText || undefined,
        })
      }
      onOpenChange(false)
      form.reset()
      onSuccess?.()
    },
  })

  // Reset form when card changes or dialog opens
  useEffect(() => {
    if (open) {
      form.reset()
      form.setFieldValue("frontText", card?.frontText ?? "")
      form.setFieldValue("backText", card?.backText ?? "")
    }
  }, [open, card])

  const title = isEditing ? "Edit card" : "Add new card"
  const description = isEditing
    ? "Update your flashcard"
    : "Create a new flashcard for this deck"

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
          name="frontText"
          children={(field) => (
            <Field>
              <FieldLabel htmlFor="card-front">Front</FieldLabel>
              <textarea
                id="card-front"
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Question or prompt..."
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                autoFocus
              />
            </Field>
          )}
        />

        <form.Field
          name="backText"
          children={(field) => (
            <Field>
              <FieldLabel htmlFor="card-back">Back</FieldLabel>
              <textarea
                id="card-back"
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Answer or explanation..."
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
            </Field>
          )}
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
            : "Adding..."
          : isEditing
            ? "Save Changes"
            : "Add Card"}
      </Button>
    </>
  )

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[85vh]">
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription>{description}</SheetDescription>
          </SheetHeader>
          <div className="px-4 overflow-auto flex-1">{formContent}</div>
          <SheetFooter>{footerContent}</SheetFooter>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
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
