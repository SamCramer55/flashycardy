import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <main className="flex -mt-8 flex-col items-center justify-center gap-8 text-center sm:-mt-12">
        <div className="space-y-2">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            FlashyCardy
          </h1>
          <p className="text-lg text-muted-foreground">
            Your personal flashcard platform
          </p>
        </div>
        {/* Auth buttons will be rendered globally in the header via Clerk,
            but we also place them here under the headings as requested. */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <SignInButton mode="modal" forceRedirectUrl="/dashboard">
            <Button size="lg" variant="outline">
              Sign in
            </Button>
          </SignInButton>
          <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
            <Button size="lg">
              Sign up
            </Button>
          </SignUpButton>
        </div>
      </main>
    </div>
  );
}