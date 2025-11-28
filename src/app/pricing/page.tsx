import { PricingTable } from "@clerk/nextjs";

export default function PricingPage() {
  return (
    <div className="flex min-h-screen justify-center bg-background px-4 pt-16 sm:pt-20">
      <main className="w-full max-w-4xl space-y-10 text-center">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Choose your plan
          </h1>
          <p className="text-lg text-muted-foreground">
            Unlock the full potential of your flashcard learning experience with
            our flexible pricing options.
          </p>
        </div>
        <PricingTable />
      </main>
    </div>
  );
}



