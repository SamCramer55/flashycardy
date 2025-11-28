import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { getCardsForDeck, getDeckByIdForUser } from "@/db/queries";
import { DeckCardsClient } from "./deck-cards-client";
import { DeckHeaderClient } from "./deck-header-client";

type DeckPageProps = {
  params: Promise<{
    deckId: string;
  }>;
};

export default async function DeckPage({ params }: DeckPageProps) {
  const { userId, has } = await auth();

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

  const hasProPlan = has({ plan: "pro_plan" });
  const hasAiFeature = has({ feature: "ai_flashcard_generation" });
  const canUseAiFlashcards = hasProPlan || hasAiFeature;
  const hasTitle = !!deck.title && deck.title.trim() !== "";
  const hasDescription = !!deck.description && deck.description.trim() !== "";
  const canGenerateAi = hasTitle && hasDescription;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-10 sm:px-10">
        <DeckHeaderClient
          deckId={deckId}
          initialTitle={deck.title}
          initialDescription={deck.description}
        />

        <section className="flex flex-1 flex-col gap-4 rounded-xl border border-border/60 bg-card/60 p-6 shadow-sm backdrop-blur">
          <DeckCardsClient
            deckId={deckId}
            cards={cards}
            canUseAiFlashcards={canUseAiFlashcards}
            hasDescription={canGenerateAi}
          />
        </section>
      </main>
    </div>
  );
}
