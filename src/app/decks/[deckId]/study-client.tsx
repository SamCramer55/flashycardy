"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

type StudyCard = {
  id: number;
  front: string;
  back: string;
};

type DeckStudyClientProps = {
  cards: StudyCard[];
};

function shuffleArray<T>(items: T[]): T[] {
  const array = [...items];

  for (let index = array.length - 1; index > 0; index -= 1) {
    const j = Math.floor(Math.random() * (index + 1));
    [array[index], array[j]] = [array[j], array[index]];
  }

  return array;
}

export function DeckStudyClient({ cards }: DeckStudyClientProps) {
  const [sessionId, setSessionId] = useState(0);
  const [shuffledCards, setShuffledCards] = useState<StudyCard[]>(cards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [answers, setAnswers] = useState<("correct" | "incorrect" | null)[]>(
    () => Array(cards.length).fill(null),
  );

  const totalCards = shuffledCards.length;
  const currentCard =
    totalCards > 0 && currentIndex >= 0 && currentIndex < totalCards
      ? shuffledCards[currentIndex]
      : null;

  const correctCount = answers.filter((answer) => answer === "correct").length;
  const incorrectCount = answers.filter(
    (answer) => answer === "incorrect",
  ).length;
  const answeredCount = correctCount + incorrectCount;
  const accuracy =
    totalCards === 0 ? 0 : Math.round((correctCount / totalCards) * 100);
  const isFinished = totalCards > 0 && answeredCount === totalCards;
  const progress =
    totalCards === 0 ? 0 : Math.min(100, (answeredCount / totalCards) * 100);

  useEffect(() => {
    const nextCards = cards.length > 0 ? shuffleArray(cards) : [];
    setShuffledCards(nextCards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setAnswers(Array(nextCards.length).fill(null));
  }, [cards, sessionId]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName;
      const isEditable = target?.isContentEditable;

      if (
        tagName === "INPUT" ||
        tagName === "TEXTAREA" ||
        tagName === "SELECT" ||
        isEditable
      ) {
        return;
      }

      if (totalCards === 0 || isFinished) {
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setCurrentIndex((previous) => (previous > 0 ? previous - 1 : previous));
        setIsFlipped(false);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        setCurrentIndex((previous) =>
          previous < totalCards - 1 ? previous + 1 : previous,
        );
        setIsFlipped(false);
      } else if (event.code === "Space" || event.key === " ") {
        event.preventDefault();
        setIsFlipped((previous) => !previous);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [totalCards, isFinished]);

  function handleShowAnswer() {
    setIsFlipped(true);
  }

  function handleMark(correct: boolean) {
    if (!currentCard) return;

    setAnswers((previous) => {
      const next = [...previous];
      if (currentIndex >= 0 && currentIndex < next.length) {
        next[currentIndex] = correct ? "correct" : "incorrect";
      }
      return next;
    });

    setCurrentIndex((previous) =>
      previous < totalCards - 1 ? previous + 1 : previous,
    );
    setIsFlipped(false);
  }

  function handleRestart() {
    setSessionId((previous) => previous + 1);
  }

  function handlePrevious() {
    setCurrentIndex((previous) => (previous > 0 ? previous - 1 : previous));
    setIsFlipped(false);
  }

  function handleNext() {
    setCurrentIndex((previous) =>
      previous < totalCards - 1 ? previous + 1 : previous,
    );
    setIsFlipped(false);
  }

  if (cards.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-background/40 p-8 text-center text-sm text-muted-foreground">
        <p>This deck doesn&apos;t have any cards yet.</p>
        <p className="mt-1">
          Add a few cards first, then come back here to start studying.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-2 text-xs text-muted-foreground">
        <div className="flex items-center justify-between">
          <p>
            Card {Math.min(currentIndex + 1, totalCards)} of {totalCards}
          </p>
          <div className="flex items-center gap-3">
            <p>
              Correct:{" "}
              <span className="font-medium text-emerald-400">
                {correctCount}
              </span>{" "}
              · Incorrect:{" "}
              <span className="font-medium text-red-400">
                {incorrectCount}
              </span>
            </p>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground"
              onClick={handleRestart}
            >
              Restart
            </Button>
          </div>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-border/60">
          <div
            className="h-full rounded-full bg-primary transition-[width]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {isFinished ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-xl border border-border/60 bg-background/60 p-8 text-center">
          <h2 className="text-xl font-semibold">Session complete</h2>
          <p className="text-sm text-muted-foreground">
            You reviewed {totalCards} card
            {totalCards === 1 ? "" : "s"}. Great work!
          </p>
          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
            <p>
              Correct:{" "}
              <span className="font-semibold text-emerald-400">
                {correctCount}
              </span>
            </p>
            <p>
              Incorrect:{" "}
              <span className="font-semibold text-red-400">
                {incorrectCount}
              </span>
            </p>
            <p>
              Accuracy:{" "}
              <span className="font-semibold text-primary">
                {accuracy}
                %
              </span>
            </p>
          </div>
          <Button size="sm" className="mt-4" onClick={handleRestart}>
            Study again
          </Button>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setIsFlipped((previous) => !previous)}
            className="flex flex-1 cursor-pointer flex-col items-center justify-center rounded-xl border border-border/60 bg-background/80 p-8 text-center shadow-sm transition hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {isFlipped ? "Back" : "Front"}
            </p>
            <p className="whitespace-pre-wrap text-base sm:text-lg">
              {isFlipped ? currentCard?.back : currentCard?.front}
            </p>
          </button>

          <div className="flex items-center justify-between gap-3">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              Previous
            </Button>

            {!isFlipped ? (
              <Button size="sm" onClick={handleShowAnswer}>
                <span aria-hidden="true" className="mr-2 text-xl leading-none">
                  ↺
                </span>
                Flip card
              </Button>
            ) : (
              <div className="flex gap-3">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleMark(false)}
                >
                  I need to review this
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleMark(true)}
                >
                  I got it right
                </Button>
              </div>
            )}

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleNext}
              disabled={currentIndex >= totalCards - 1}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
}


