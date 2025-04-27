"use client"
import * as Sentry from "@sentry/nextjs"

export default function Page() {
  return (
    <main>
      <button
        type="button"
        style={{ backgroundColor: "red", color: "white", padding: "10px" }}
        onClick={async () => {
          await Sentry.startSpan(
            {
              name: "Example Frontend Span",
              op: "test",
            },
            async () => {
              throw new Error("Sentry Example Frontend Error")
            },
          )
        }}
      >
        Throw error!
      </button>
    </main>
  )
}
