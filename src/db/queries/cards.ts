import { and, desc, eq } from "drizzle-orm";
import { db, cardsTable, decksTable } from "../index";

export type NewCard = typeof cardsTable.$inferInsert;

export async function createCardForDeck(card: NewCard, userId: string) {
  // Ensure the deck belongs to the current user before inserting
  const [deck] = await db
    .select({ id: decksTable.id })
    .from(decksTable)
    .where(and(eq(decksTable.id, card.deckId), eq(decksTable.userId, userId)));

  if (!deck) {
    throw new Error("Deck not found or you do not have access to it.");
  }

  await db.insert(cardsTable).values(card);
}

export async function createCardsForDeckBulk(
  cards: NewCard[],
  userId: string,
) {
  if (cards.length === 0) return;

  const firstDeckId = cards[0]?.deckId;

  if (!firstDeckId) {
    throw new Error("Deck ID is required to create cards.");
  }

  const isSameDeck = cards.every((card) => card.deckId === firstDeckId);

  if (!isSameDeck) {
    throw new Error("All cards in a bulk insert must belong to the same deck.");
  }

  // Ensure the deck belongs to the current user before inserting
  const [deck] = await db
    .select({ id: decksTable.id })
    .from(decksTable)
    .where(and(eq(decksTable.id, firstDeckId), eq(decksTable.userId, userId)));

  if (!deck) {
    throw new Error("Deck not found or you do not have access to it.");
  }

  await db.insert(cardsTable).values(cards);
}

export async function getCardsForDeck(deckId: number, userId: string) {
  return db
    .select()
    .from(cardsTable)
    .innerJoin(decksTable, eq(cardsTable.deckId, decksTable.id))
    .where(and(eq(cardsTable.deckId, deckId), eq(decksTable.userId, userId)))
    // Show newest cards first while keeping a stable order when editing
    .orderBy(desc(cardsTable.createdAt), desc(cardsTable.id));
}

export async function updateCardForDeck(
  cardId: number,
  deckId: number,
  updates: Pick<NewCard, "front" | "back">,
  userId: string,
) {
  // Verify that the deck belongs to the current user
  const [deck] = await db
    .select({ id: decksTable.id })
    .from(decksTable)
    .where(and(eq(decksTable.id, deckId), eq(decksTable.userId, userId)));

  if (!deck) {
    throw new Error("Deck not found or you do not have access to it.");
  }

  await db
    .update(cardsTable)
    .set({
      front: updates.front,
      back: updates.back,
      updatedAt: new Date(),
    })
    .where(and(eq(cardsTable.id, cardId), eq(cardsTable.deckId, deckId)));
}

export async function deleteCardForDeck(
  cardId: number,
  deckId: number,
  userId: string,
) {
  // Verify that the deck belongs to the current user before deleting
  const [deck] = await db
    .select({ id: decksTable.id })
    .from(decksTable)
    .where(and(eq(decksTable.id, deckId), eq(decksTable.userId, userId)));

  if (!deck) {
    throw new Error("Deck not found or you do not have access to it.");
  }

  await db
    .delete(cardsTable)
    .where(and(eq(cardsTable.id, cardId), eq(cardsTable.deckId, deckId)));
}


