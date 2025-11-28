"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Play } from "lucide-react";
import {
  addCardAction,
  generateAiCardsAction,
  updateCardsBulkAction,
  type CardFormState,
  type GenerateAiCardsFormState,
} from "./actions";

type Card = {
  id: number;
  front: string;
  back: string;
};

type DeckCardsClientProps = {
  deckId: number;
  cards: Card[];
  canUseAiFlashcards: boolean;
  hasDescription: boolean;
};

function CardFormError({ state }: { state: CardFormState }) {
  if (!state.error) return null;

  return (
    <p className="mt-2 text-xs font-medium text-destructive">{state.error}</p>
  );
}

function AiFormError({ state }: { state: GenerateAiCardsFormState }) {
  if (!state.error) return null;

  return (
    <p className="mt-2 text-xs font-medium text-destructive">{state.error}</p>
  );
}

function GenerateAiButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button type="submit" size="sm" variant="outline" disabled={pending}>
      {pending ? "Generating..." : "Generate cards with AI"}
    </Button>
  );
}

type FormWithStateProps = {
  initialState: CardFormState;
};

function AddCardDialog({
  deckId,
  initialState,
}: FormWithStateProps & { deckId: number }) {
  const [state, formAction] = useActionState(addCardAction, initialState);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm">Add card</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a new card</DialogTitle>
          <DialogDescription>
            Create a new flashcard for this deck.
          </DialogDescription>
        </DialogHeader>
        <form
          id="add-card-form"
          action={formAction}
          className="space-y-3 text-sm"
        >
          <input type="hidden" name="deckId" value={deckId} />
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Front
            </p>
            <textarea
              name="front"
              className="mt-1 w-full rounded-md border border-border/60 bg-background/60 px-2 py-1 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              rows={2}
              placeholder="Enter the front of the card"
            />
          </div>
          <div>
            <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Back
            </p>
            <textarea
              name="back"
              className="mt-1 w-full rounded-md border border-border/60 bg-background/60 px-2 py-1 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              rows={2}
              placeholder="Enter the back of the card"
            />
          </div>
          <CardFormError state={state} />
          <DialogFooter>
            <Button type="submit" size="sm" form="add-card-form">
              Add card
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeckCardsClient({
  deckId,
  cards,
  canUseAiFlashcards,
  hasDescription,
}: DeckCardsClientProps) {
  const initialFormState: CardFormState = {};
  const initialAiFormState: GenerateAiCardsFormState = {};
  const [isEditing, setIsEditing] = useState(false);
  const [localCards, setLocalCards] = useState<Card[]>(cards);
  const [deletedCardIds, setDeletedCardIds] = useState<number[]>([]);
  const [state, formAction] = useActionState<CardFormState, FormData>(
    updateCardsBulkAction,
    initialFormState,
  );
  const [aiState, aiFormAction] = useActionState<
    GenerateAiCardsFormState,
    FormData
  >(generateAiCardsAction, initialAiFormState);

  // Keep local cards in sync when the server-provided list changes
  useEffect(() => {
    setLocalCards(cards);
    setDeletedCardIds([]);
  }, [cards]);

  // After a successful save, exit edit mode and clear deleted ids
  useEffect(() => {
    if (state.success) {
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      setIsEditing(false);
      setDeletedCardIds([]);
    }
  }, [state.success]);

  const cardCount = localCards.length;

  return (
    <>
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
          <h2 className="text-lg font-semibold">Cards</h2>
          <p className="text-xs text-muted-foreground">
            {cardCount === 0
              ? "No cards yet"
              : `${cardCount} card${cardCount === 1 ? "" : "s"}`}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-start gap-2 sm:justify-end">
          <Button asChild size="sm" className="shadow-sm">
            <Link
              href={`/decks/${deckId}/study`}
              className="flex items-center gap-1.5"
            >
              <Play className="size-4" />
              <span>Study deck</span>
            </Link>
          </Button>
          {canUseAiFlashcards ? (
            hasDescription ? (
              <div className="flex flex-col items-end gap-2">
                <form action={aiFormAction} className="flex items-center gap-2">
                  <input type="hidden" name="deckId" value={deckId} />
                  <GenerateAiButton />
                </form>
                <AiFormError state={aiState} />
              </div>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-block">
                      <Button type="button" size="sm" variant="outline" disabled>
                        Generate cards with AI
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Add a description to this deck to enable AI card generation.
                      Click &quot;Edit deck&quot; above to add one.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button asChild size="sm" variant="outline">
                    <Link href="/pricing">Generate cards with AI</Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Generating cards with AI is a Pro feature. Upgrade to unlock
                    AI-powered flashcard generation.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <Button
            type="button"
            size="sm"
            variant={isEditing ? "outline" : "default"}
            onClick={() => setIsEditing((prev) => !prev)}
          >
            {isEditing ? "Done editing" : "Edit cards"}
          </Button>
          <AddCardDialog deckId={deckId} initialState={initialFormState} />
        </div>
      </div>

      {/* Existing cards list with read-only and edit modes */}
      {localCards.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/60 bg-background/40 p-4 text-sm text-muted-foreground">
          This deck does not have any cards yet. Use the button above to add
          your first card.
        </div>
      ) : isEditing ? (
        <form
          id="edit-cards-form"
          action={formAction}
          className="space-y-3"
        >
          <input type="hidden" name="deckId" value={deckId} />
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {localCards.map((card) => (
              <div
                key={card.id}
                className="flex flex-col gap-3 rounded-lg border border-border/60 bg-background/60 p-4 text-sm"
              >
                <input type="hidden" name="cardId" value={card.id} />
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Front
                  </p>
                  <textarea
                    name="front"
                    value={card.front}
                    onChange={(event) => {
                      const value = event.target.value;
                      setLocalCards((prev) =>
                        prev.map((currentCard) =>
                          currentCard.id === card.id
                            ? { ...currentCard, front: value }
                            : currentCard,
                        ),
                      );
                    }}
                    className="mt-1 w-full rounded-md border border-border/60 bg-background/60 px-2 py-1 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    rows={3}
                  />
                </div>
                <div>
                  <p className="mt-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Back
                  </p>
                  <textarea
                    name="back"
                    value={card.back}
                    onChange={(event) => {
                      const value = event.target.value;
                      setLocalCards((prev) =>
                        prev.map((currentCard) =>
                          currentCard.id === card.id
                            ? { ...currentCard, back: value }
                            : currentCard,
                        ),
                      );
                    }}
                    className="mt-1 w-full rounded-md border border-border/60 bg-background/60 px-2 py-1 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    rows={3}
                  />
                </div>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="h-7 w-7 text-xs"
                    onClick={() => {
                      setLocalCards((prev) =>
                        prev.filter(
                          (currentCard) => currentCard.id !== card.id,
                        ),
                      );
                      setDeletedCardIds((prev) => [...prev, card.id]);
                    }}
                  >
                    ✕
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {/* Track deleted cards so the server action can persist deletions */}
          {deletedCardIds.map((cardId) => (
            <input
              key={cardId}
              type="hidden"
              name="deletedCardId"
              value={cardId}
            />
          ))}
          <div className="mt-1 flex items-center justify-between gap-2">
            <CardFormError state={state} />
            <Button type="submit" size="sm" form="edit-cards-form">
              Save changes
            </Button>
          </div>
        </form>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {localCards.map((card) => (
            <div
              key={card.id}
              className="flex flex-col gap-2 rounded-lg border border-border/60 bg-background/60 p-4 text-sm"
            >
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Front
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm">
                  {card.front}
                </p>
              </div>
              <div>
                <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Back
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm">
                  {card.back}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
