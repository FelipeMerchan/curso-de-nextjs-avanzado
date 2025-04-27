"use client"

import * as Sentry from "@sentry/nextjs"
import NextError from "next/error"
import { useEffect } from "react"

/* Este global-error fue creado automáticamente por Sentry al correr el comando:
npx @sentry/wizard@latest -i nextjs --saas --org test-uy9 --project javascript-nextjs */

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string }
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body>
        {/* `NextError` is the default Next.js error page component. Its type
        definition requires a `statusCode` prop. However, since the App Router
        does not expose status codes for errors, we simply pass 0 to render a
        generic error message. */}
        <NextError statusCode={0} />
      </body>
    </html>
  )
}
