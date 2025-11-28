"use client";

import { useActionState } from "react";

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
  deleteDeckAction,
  type DeleteDeckFormState,
} from "./actions";

type DeleteDeckDialogProps = {
  deckId: number;
  deckTitle: string;
};

export function DeleteDeckDialog({
  deckId,
  deckTitle,
}: DeleteDeckDialogProps) {
  const [state, formAction] = useActionState<DeleteDeckFormState, FormData>(
    deleteDeckAction,
    {},
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          Delete deck
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete this deck?</DialogTitle>
          <DialogDescription>
            This will permanently delete &quot;{deckTitle}&quot; and all of its
            cards. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <form
          action={formAction}
          className="mt-4 space-y-3 text-sm"
        >
          <input type="hidden" name="deckId" value={deckId} />
          {state.error ? (
            <p className="text-xs font-medium text-destructive">
              {state.error}
            </p>
          ) : null}
          <DialogFooter>
            <Button
              type="submit"
              size="sm"
              variant="destructive"
            >
              Delete deck
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


