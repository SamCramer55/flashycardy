"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

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
import { useToast } from "@/components/ui/toast";

import { createDeckAction, type CreateDeckFormState } from "./actions";

function NewDeckFormError({ state }: { state: CreateDeckFormState }) {
  if (!state.error) return null;

  return (
    <p className="mt-2 text-xs font-medium text-destructive">{state.error}</p>
  );
}

export function NewDeckDialog() {
  const initialState: CreateDeckFormState = {};
  const [state, formAction] = useActionState<CreateDeckFormState, FormData>(
    createDeckAction,
    initialState,
  );
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    if (state.success) {
      showToast({
        title: "Deck created",
        description: "Your new deck has been created successfully.",
      });
      formRef.current?.reset();
      setOpen(false);
      router.refresh();
    }
  }, [router, showToast, state.success]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">New deck</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new deck</DialogTitle>
          <DialogDescription>
            Give your deck a name and an optional description.
          </DialogDescription>
        </DialogHeader>
        <form
          ref={formRef}
          id="new-deck-form"
          action={formAction}
          className="space-y-3 text-sm"
        >
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Deck name
            </p>
            <input
              name="title"
              className="mt-1 w-full rounded-md border border-border/60 bg-background/60 px-2 py-1 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="e.g. Indonesian from English"
            />
          </div>
          <div>
            <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Description
            </p>
            <textarea
              name="description"
              className="mt-1 w-full rounded-md border border-border/60 bg-background/60 px-2 py-1 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              rows={3}
              placeholder="Optionally describe what this deck is about"
            />
          </div>
          <NewDeckFormError state={state} />
          <DialogFooter>
            <Button type="submit" size="sm" form="new-deck-form">
              Create deck
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


