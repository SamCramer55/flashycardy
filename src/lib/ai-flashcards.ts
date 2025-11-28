import { z } from "zod";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";

// Shape of one card
export const flashcardSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

// Full response shape
export const flashcardsSchema = z.object({
  cards: z.array(flashcardSchema),
});

export type Flashcard = z.infer<typeof flashcardSchema>;

/**
 * Detects if a deck is for language learning based on title and description.
 * Uses conservative detection to avoid false positives - requires clear signals
 * like explicit translation patterns or language names in learning context.
 */
export function isLanguageLearningDeck(
  title: string,
  description: string | null,
): boolean {
  const text = `${title} ${description || ""}`.toLowerCase();

  // Language names (common ones)
  const languageNames = [
    "spanish",
    "french",
    "german",
    "italian",
    "portuguese",
    "russian",
    "chinese",
    "japanese",
    "korean",
    "arabic",
    "hindi",
    "indonesian",
    "dutch",
    "polish",
    "turkish",
    "vietnamese",
    "thai",
    "swedish",
    "norwegian",
    "danish",
    "finnish",
    "greek",
    "hebrew",
    "czech",
    "romanian",
    "hungarian",
    "ukrainian",
  ];

  // Strong signal: explicit translation patterns like "X from Y" or "X to Y"
  const hasTranslationPattern =
    /(from|to)\s+(english|spanish|french|german|italian|portuguese|russian|chinese|japanese|korean|arabic|hindi|indonesian|dutch|polish|turkish|vietnamese|thai|swedish|norwegian|danish|finnish|greek|hebrew|czech|romanian|hungarian|ukrainian)/i.test(
      text,
    );

  // Strong signal: language name combined with learning/translation context
  const hasLanguageName = languageNames.some((lang) => text.includes(lang));
  const hasLearningContext =
    /\b(learn|learning|translation|translate|vocabulary|vocab)\b/i.test(text);

  // Only return true if we have strong signals
  return hasTranslationPattern || (hasLanguageName && hasLearningContext);
}

export async function generateFlashcards({
  topic,
  cardCount,
  isLanguageLearning = false,
}: {
  topic: string;
  cardCount: number;
  isLanguageLearning?: boolean;
}): Promise<Flashcard[]> {
  let prompt: string[];

  if (isLanguageLearning) {
    // Simple format for language learning: word/sentence on front, direct translation on back
    // Let the topic guide what languages and content to use
    prompt = [
      `You are an expert flashcard generator.`,
      `Generate ${cardCount} high-quality flashcards about: "${topic}".`,
      ``,
      `Return ONLY data that matches this JSON schema:`,
      `{
        "cards": [
          { "question": string, "answer": string },
          ...
        ]
      }`,
      ``,
      `Format guidelines:`,
      `- Use a simple translation format: word or sentence on the front, direct translation on the back.`,
      `- Do not include descriptions, explanations, or additional context in the answer field.`,
      `- Keep answers concise - just the translation.`,
      `- Let the topic determine the specific languages and vocabulary to use.`,
    ];
  } else {
    // More detailed format for other subjects (history, science, etc.)
    prompt = [
      `You are an expert flashcard generator.`,
      `Generate ${cardCount} high-quality study flashcards about: "${topic}".`,
      ``,
      `Return ONLY data that matches this JSON schema:`,
      `{
        "cards": [
          { "question": string, "answer": string },
          ...
        ]
      }`,
      ``,
      `Questions should be clear and focused.`,
      `Answers should be concise but accurate.`,
    ];
  }

  const { object } = await generateObject({
    // 🔑 DIRECT OpenAI provider, no Gateway
    model: openai("gpt-4o-mini"),

    // 🔑 Explicitly use JSON mode for object generation
    mode: "json",

    schema: flashcardsSchema,

    prompt: prompt.join("\n"),
  });

  return object.cards;
}


