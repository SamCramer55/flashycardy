import { integer, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

// A deck of flashcards owned by a Clerk user
export const decksTable = pgTable('decks', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  // Clerk user ID (string)
  userId: varchar({ length: 255 }).notNull(),

  // Human‑readable name for the deck, e.g. "Indonesian from English"
  title: varchar({ length: 255 }).notNull(),

  // Optional longer description of what this deck is about
  description: text(),

  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

// Individual flashcards that belong to a deck
export const cardsTable = pgTable('cards', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  deckId: integer()
    .notNull()
    .references(() => decksTable.id, { onDelete: 'cascade' }),

  // The "front" of the card (prompt/question/word)
  front: text().notNull(),

  // The "back" of the card (answer/definition/translation)
  back: text().notNull(),

  // Optional field if you later want to order cards manually within a deck
  sortOrder: integer(),

  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});
