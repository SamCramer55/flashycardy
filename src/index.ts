import "dotenv/config";
import { createDeck, type NewDeck } from "./db/queries/decks";

async function main() {
  const deck: NewDeck = {
    title: "Sample deck",
    description: "A sample deck created from the CLI script",
    userId: "cli-user",
  };

  const createdDeck = await createDeck(deck);
  console.log("New deck created with ID:", createdDeck.id);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

