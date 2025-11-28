"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createDeck, getDecksForUser, type NewDeck } from "@/db/queries";

export type CreateDeckFormState = {
  error?: string;
  success?: boolean;
};

const createDeckSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z
    .string()
    .max(2000, "Description is too long")
    .optional()
    .default(""),
});

export async function createDeckAction(
  _prevState: CreateDeckFormState,
  formData: FormData,
): Promise<CreateDeckFormState> {
  const { userId, has } = await auth();

  if (!userId) {
    redirect("/");
  }

  const canUseUnlimitedDecks = has({ feature: "unlimited_decks" });
  const hasThreeDeckLimit = has({ feature: "3_deck_limit" });
  const isThreeDeckLimited = hasThreeDeckLimit && !canUseUnlimitedDecks;

  if (isThreeDeckLimited) {
    const existingDecks = await getDecksForUser(userId);

    if (existingDecks.length >= 3) {
      return {
        error:
          "You’ve reached the 3 deck limit on the free plan. Upgrade to Pro for unlimited decks.",
      };
    }
  }

  const raw = {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
  };

  let parsed: z.infer<typeof createDeckSchema>;

  try {
    parsed = createDeckSchema.parse(raw);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues?.[0]?.message ?? "Invalid input" };
    }

    return { error: "Something went wrong" };
  }

  const newDeck: NewDeck = {
    userId,
    title: parsed.title,
    description: parsed.description.trim() === "" ? null : parsed.description,
  };

  try {
    await createDeck(newDeck);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to create deck" };
  }
}


