import { SignIn } from "@clerk/tanstack-react-start"
import { createFileRoute } from "@tanstack/react-router"
import { AuthPage } from "../features/app-shell/auth-page"

export const Route = createFileRoute("/sign-in/$")({
  head: () => ({ meta: [{ title: "Sign in · Flashcard" }] }),
  component: () => (
    <AuthPage>
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/study"
      />
    </AuthPage>
  ),
})
