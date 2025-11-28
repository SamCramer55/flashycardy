import { and, eq } from "drizzle-orm";
import { db, decksTable } from "../index";

export type NewDeck = typeof decksTable.$inferInsert;

export async function createDeck(deck: NewDeck) {
  const [createdDeck] = await db.insert(decksTable).values(deck).returning();
  return createdDeck;
}

export type UpdateDeck = Pick<NewDeck, "title" | "description">;

export async function getDecksForUser(userId: string) {
  return db
    .select()
    .from(decksTable)
    .where(eq(decksTable.userId, userId));
}

export async function getDeckByIdForUser(deckId: number, userId: string) {
  const [deck] = await db
    .select()
    .from(decksTable)
    .where(and(eq(decksTable.id, deckId), eq(decksTable.userId, userId)));

  return deck ?? null;
}

export async function deleteDeckForUser(deckId: number, userId: string) {
  await db
    .delete(decksTable)
    .where(and(eq(decksTable.id, deckId), eq(decksTable.userId, userId)));
}

export async function updateDeckForUser(
  deckId: number,
  userId: string,
  updates: UpdateDeck,
) {
  await db
    .update(decksTable)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(and(eq(decksTable.id, deckId), eq(decksTable.userId, userId)));
}


