import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { Button } from "@/components/ui/button";
import { getCardsForDeck, getDeckByIdForUser } from "@/db/queries";
import { DeckStudyClient } from "../study-client";

type DeckStudyPageProps = {
  params: Promise<{
    deckId: string;
  }>;
};

export default async function DeckStudyPage({ params }: DeckStudyPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const { deckId: deckIdParam } = await params;
  const deckId = Number(deckIdParam);

  if (!Number.isInteger(deckId)) {
    notFound();
  }

  const deck = await getDeckByIdForUser(deckId, userId);

  if (!deck) {
    notFound();
  }

  const cardsWithJoin = await getCardsForDeck(deckId, userId);
  const cards = cardsWithJoin.map((row) => row.cards);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-10 sm:px-10">
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="flex-1">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Study: {deck.title}
            </h1>
            {deck.description && (
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                {deck.description}
              </p>
            )}
          </div>
          <div className="flex gap-3 self-start">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/decks/${deckId}`}>Back to deck</Link>
            </Button>
          </div>
        </section>

        <section className="flex flex-1 flex-col gap-4 rounded-xl border border-border/60 bg-card/60 p-6 shadow-sm backdrop-blur">
          <DeckStudyClient cards={cards} />
        </section>
      </main>
    </div>
  );
}


