import { Suspense } from "react"
import { MessagesPageClient } from "@/components/messages/messages-page-client"

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
          Loading messages…
        </div>
      }
    >
      <MessagesPageClient />
    </Suspense>
  )
}
