import { SignUp } from "@clerk/tanstack-react-start"
import { createFileRoute } from "@tanstack/react-router"
import { AuthPage } from "../features/app-shell/auth-page"

export const Route = createFileRoute("/sign-up/$")({
  head: () => ({ meta: [{ title: "Create account · Flashcard" }] }),
  component: () => (
    <AuthPage>
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        fallbackRedirectUrl="/study"
      />
    </AuthPage>
  ),
})
