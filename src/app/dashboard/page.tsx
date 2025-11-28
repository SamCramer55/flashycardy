import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

import { Button } from "@/components/ui/button";
import { getDecksForUser } from "@/db/queries";
import { NewDeckDialog } from "./new-deck-dialog";

export default async function DashboardPage() {
  const { userId, has } = await auth();

  if (!userId) {
    redirect("/");
  }

  const decks = await getDecksForUser(userId);

  const canUseUnlimitedDecks = has({ feature: "unlimited_decks" });
  const hasThreeDeckLimit = has({ feature: "3_deck_limit" });
  const isThreeDeckLimited = hasThreeDeckLimit && !canUseUnlimitedDecks;
  const isAtDeckLimit = isThreeDeckLimited && decks.length >= 3;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10 sm:px-10">
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">
              Manage your flashcard decks and track your learning progress.
            </p>
          </div>
          <div className="flex gap-3">
            {!isAtDeckLimit ? (
              <>
                <Button size="sm" variant="outline">
                  Import deck
                </Button>
                <NewDeckDialog />
              </>
            ) : (
              <Button asChild size="sm" variant="outline">
                <Link href="/pricing">Upgrade to create more decks</Link>
              </Button>
            )}
          </div>
        </section>

        <section className="flex flex-1 flex-col gap-4 rounded-xl border border-border/60 bg-card/60 p-6 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold">Your decks</h2>
              <p className="text-xs text-muted-foreground">
                {decks.length === 0
                  ? "No decks yet"
                  : `${decks.length} deck${decks.length === 1 ? "" : "s"}`}
              </p>
            </div>
            {isAtDeckLimit && (
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Free plan limit reached (3 decks)
              </p>
            )}
          </div>

          {decks.length === 0 ? (
            <div className="flex flex-col justify-between rounded-lg border border-border/60 bg-background/60 p-4">
              <div>
                <h3 className="text-base font-medium">Getting started</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  You don&apos;t have any decks yet. Create your first one to
                  start practicing.
                </p>
              </div>
              <Button size="sm" className="mt-4 self-start">
                Create your first deck
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {decks.map((deck) => (
                <Link
                  key={deck.id}
                  href={`/decks/${deck.id}`}
                  className="flex flex-col justify-between rounded-lg border border-border/60 bg-background/60 p-4 transition-colors hover:border-primary/50"
                >
                  <div>
                    <h3 className="text-base font-medium">{deck.title}</h3>
                    {deck.description && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {deck.description}
                      </p>
                    )}
                    {deck.updatedAt && (
                      <p className="mt-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                        Updated{" "}
                        {new Date(deck.updatedAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}


