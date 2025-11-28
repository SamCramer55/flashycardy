"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  createCardForDeck,
  createCardsForDeckBulk,
  deleteCardForDeck,
  deleteDeckForUser,
  getDeckByIdForUser,
  updateCardForDeck,
  updateDeckForUser,
  type NewCard,
} from "@/db/queries";
import {
  generateFlashcards,
  isLanguageLearningDeck,
} from "@/lib/ai-flashcards";

const baseCardSchema = z.object({
  deckId: z.number().int().positive(),
  front: z.string().min(1, "Front is required").max(2000),
  back: z.string().min(1, "Back is required").max(2000),
});

const generateAiCardsSchema = z.object({
  deckId: z.number().int().positive(),
});

export type CardFormState = {
  error?: string;
  success?: boolean;
};

export type DeckFormState = {
  error?: string;
  success?: boolean;
};

export type DeleteDeckFormState = {
  error?: string;
  success?: boolean;
};

export type GenerateAiCardsFormState = {
  error?: string;
  success?: boolean;
};

export async function addCardAction(
  _prevState: CardFormState,
  formData: FormData,
): Promise<CardFormState> {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const raw = {
    deckId: Number(formData.get("deckId")),
    front: String(formData.get("front") ?? ""),
    back: String(formData.get("back") ?? ""),
  };

  let parsed: z.infer<typeof baseCardSchema>;

  try {
    parsed = baseCardSchema.parse(raw);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues?.[0]?.message ?? "Invalid input" };
    }

    return { error: "Something went wrong" };
  }

  const newCard: NewCard = {
    deckId: parsed.deckId,
    front: parsed.front,
    back: parsed.back,
  };

  try {
    await createCardForDeck(newCard, userId);
  } catch (error) {
    console.error(error);
    return { error: "Failed to create card" };
  }

  redirect(`/decks/${parsed.deckId}`);
}

export async function generateAiCardsAction(
  _prevState: GenerateAiCardsFormState,
  formData: FormData,
): Promise<GenerateAiCardsFormState> {
  const { userId, has } = await auth();
  if (!userId) {
    redirect("/");
  }

  const canUseAiFlashcards = has({ feature: "ai_flashcard_generation" });

  if (!canUseAiFlashcards) {
    redirect("/pricing");
  }

  const raw = {
    deckId: Number(formData.get("deckId")),
  };

  let parsed: z.infer<typeof generateAiCardsSchema>;

  try {
    parsed = generateAiCardsSchema.parse(raw);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues?.[0]?.message ?? "Invalid input" };
    }

    return { error: "Something went wrong" };
  }

  const deck = await getDeckByIdForUser(parsed.deckId, userId);

  if (!deck) {
    return { error: "Deck not found" };
  }

   if (!deck.title || deck.title.trim() === "") {
     return {
       error:
         "Please add a title to this deck before generating cards with AI.",
     };
   }

   if (!deck.description || deck.description.trim() === "") {
     return {
       error:
         "Please add a description to this deck before generating cards with AI.",
     };
   }

  const topicParts = [
    deck.title,
    deck.description ? `Description: ${deck.description}` : "",
  ].filter(Boolean);

  const topic = topicParts.join(" - ");

  // Detect if this is a language learning deck
  const isLanguageLearning = isLanguageLearningDeck(
    deck.title,
    deck.description,
  );

  try {
    const flashcards = await generateFlashcards({
      topic,
      cardCount: 20,
      isLanguageLearning,
    });

    const newCards: NewCard[] = flashcards.map((card) => ({
      deckId: parsed.deckId,
      front: card.question,
      back: card.answer,
    }));

    await createCardsForDeckBulk(newCards, userId);
  } catch (error) {
    console.error("Failed to generate AI cards:", error);
    return {
      error: "Failed to generate AI cards. Please try again.",
    };
  }

  redirect(`/decks/${parsed.deckId}`);
}

const updateCardSchema = baseCardSchema.extend({
  cardId: z.number().int().positive(),
});

export async function updateCardAction(
  _prevState: CardFormState,
  formData: FormData,
): Promise<CardFormState> {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const raw = {
    cardId: Number(formData.get("cardId")),
    deckId: Number(formData.get("deckId")),
    front: String(formData.get("front") ?? ""),
    back: String(formData.get("back") ?? ""),
  };

  let parsed: z.infer<typeof updateCardSchema>;

  try {
    parsed = updateCardSchema.parse(raw);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues?.[0]?.message ?? "Invalid input" };
    }

    return { error: "Something went wrong" };
  }

  try {
    await updateCardForDeck(
      parsed.cardId,
      parsed.deckId,
      {
        front: parsed.front,
        back: parsed.back,
      },
      userId,
    );
  } catch (error) {
    console.error(error);
    return { error: "Failed to update card" };
  }

  return { success: true };
}

const bulkUpdateCardsSchema = z.object({
  deckId: z.number().int().positive(),
  cards: z
    .array(
      z.object({
        cardId: z.number().int().positive(),
        front: z.string().min(1, "Front is required").max(2000),
        back: z.string().min(1, "Back is required").max(2000),
      }),
    )
    .optional()
    .default([]),
  deletedCardIds: z
    .array(z.number().int().positive())
    .optional()
    .default([]),
});

export async function updateCardsBulkAction(
  _prevState: CardFormState,
  formData: FormData,
): Promise<CardFormState> {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const deckId = Number(formData.get("deckId"));
  const cardIds = formData.getAll("cardId").map((value) => Number(value));
  const fronts = formData.getAll("front").map((value) => String(value ?? ""));
  const backs = formData.getAll("back").map((value) => String(value ?? ""));
  const deletedCardIds = formData
    .getAll("deletedCardId")
    .map((value) => Number(value));

  const cards = cardIds.map((cardId, index) => ({
    cardId,
    front: fronts[index] ?? "",
    back: backs[index] ?? "",
  }));

  let parsed: z.infer<typeof bulkUpdateCardsSchema>;

  try {
    parsed = bulkUpdateCardsSchema.parse({
      deckId,
      cards,
      deletedCardIds,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues?.[0]?.message ?? "Invalid input" };
    }

    return { error: "Something went wrong" };
  }

  if (parsed.cards.length === 0 && parsed.deletedCardIds.length === 0) {
    return { success: true };
  }

  try {
    await Promise.all([
      Promise.all(
        parsed.cards.map((card) =>
          updateCardForDeck(
            card.cardId,
            parsed.deckId,
            { front: card.front, back: card.back },
            userId,
          ),
        ),
      ),
      Promise.all(
        Array.from(new Set(parsed.deletedCardIds)).map((cardId) =>
          deleteCardForDeck(cardId, parsed.deckId, userId),
        ),
      ),
    ]);
  } catch (error) {
    console.error(error);
    return { error: "Failed to update cards" };
  }

  return { success: true };
}

const deleteDeckSchema = z.object({
  deckId: z.number().int().positive(),
});

export async function deleteDeckAction(
  _prevState: DeleteDeckFormState,
  formData: FormData,
): Promise<DeleteDeckFormState> {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const raw = {
    deckId: Number(formData.get("deckId")),
  };

  let parsed: z.infer<typeof deleteDeckSchema>;

  try {
    parsed = deleteDeckSchema.parse(raw);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues?.[0]?.message ?? "Invalid input" };
    }

    return { error: "Something went wrong" };
  }

  try {
    // Deleting the deck will also cascade delete all associated cards
    // via the foreign key constraint defined in the schema.
    await deleteDeckForUser(parsed.deckId, userId);
  } catch (error) {
    console.error("Failed to delete deck", error);
    return { error: "Failed to delete deck" };
  }

  redirect("/dashboard");
}

const deleteCardSchema = z.object({
  deckId: z.number().int().positive(),
  cardId: z.number().int().positive(),
});

export async function deleteCardAction(
  cardId: number,
  deckId: number,
  _formData: FormData,
): Promise<void> {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const raw = {
    deckId,
    cardId,
  };

  let parsed: z.infer<typeof deleteCardSchema>;

  try {
    parsed = deleteCardSchema.parse(raw);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error deleting card", error.issues);
      return;
    }

    console.error("Unknown error validating deleteCardAction input", error);
    return;
  }

  try {
    await deleteCardForDeck(parsed.cardId, parsed.deckId, userId);
  } catch (error) {
    console.error("Failed to delete card", error);
  }
}

const updateDeckSchema = z.object({
  deckId: z.number().int().positive(),
  title: z.string().min(1, "Title is required").max(255),
  description: z
    .string()
    .max(2000, "Description is too long")
    .optional()
    .default(""),
});

export async function updateDeckAction(
  _prevState: DeckFormState,
  formData: FormData,
): Promise<DeckFormState> {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const raw = {
    deckId: Number(formData.get("deckId")),
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
  };

  let parsed: z.infer<typeof updateDeckSchema>;

  try {
    parsed = updateDeckSchema.parse(raw);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues?.[0]?.message ?? "Invalid input" };
    }

    return { error: "Something went wrong" };
  }

  try {
    await updateDeckForUser(
      parsed.deckId,
      userId,
      {
        title: parsed.title,
        description:
          parsed.description.trim() === "" ? null : parsed.description,
      },
    );
  } catch (error) {
    console.error(error);
    return { error: "Failed to update deck" };
  }

  return { success: true };
}


