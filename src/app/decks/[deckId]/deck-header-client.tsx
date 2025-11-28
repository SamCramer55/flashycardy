"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { updateDeckAction, type DeckFormState } from "./actions";
import { DeleteDeckDialog } from "./delete-deck-dialog";

type DeckHeaderClientProps = {
  deckId: number;
  initialTitle: string;
  initialDescription: string | null;
};

export function DeckHeaderClient({
  deckId,
  initialTitle,
  initialDescription,
}: DeckHeaderClientProps) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription ?? "");
  const [isEditing, setIsEditing] = useState(false);

  const [state, formAction] = useActionState<DeckFormState, FormData>(
    updateDeckAction,
    {},
  );

  useEffect(() => {
    if (state.success) {
      setIsEditing(false);
    }
  }, [state.success]);

  return (
    <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div className="flex-1">
        {!isEditing ? (
          <>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {title}
            </h1>
            {description && (
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                {description}
              </p>
            )}
          </>
        ) : (
          <form
            action={formAction}
            className="space-y-3 rounded-lg border border-border/60 bg-background/60 p-4 text-sm"
          >
            <input type="hidden" name="deckId" value={deckId} />
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Deck name
              </p>
              <input
                name="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="mt-1 w-full rounded-md border border-border/60 bg-background/60 px-2 py-1 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Enter a name for this deck"
              />
            </div>
            <div>
              <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Description
              </p>
              <textarea
                name="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="mt-1 w-full rounded-md border border-border/60 bg-background/60 px-2 py-1 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                rows={3}
                placeholder="Optionally describe what this deck is about"
              />
            </div>
            <div className="mt-1 flex items-center justify-between gap-2">
              {state.error ? (
                <p className="text-xs font-medium text-destructive">
                  {state.error}
                </p>
              ) : state.success ? (
                <p className="text-xs text-muted-foreground">Saved</p>
              ) : null}
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Save changes
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
      <div className="flex gap-3 self-start">
        {!isEditing && (
          <>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(true)}
            >
              Edit deck
            </Button>
            <DeleteDeckDialog deckId={deckId} deckTitle={title} />
          </>
        )}
        <Button variant="outline" asChild size="sm">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    </section>
  );
}


