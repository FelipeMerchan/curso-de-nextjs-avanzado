"use client"

import * as Sentry from "@sentry/nextjs"
import NextError from "next/error"
import { useEffect } from "react"

/*
 * 3. Cómo manejar errores de forma global.
  global-error.tsx nos va a capturar todos los errores que no sean capturados
  por una página, es decir, si en una página se nos olvida manejar y capturar el error
  el error seguirá y escalará hasta llegar a global-error.tsx.

  * Nota
  El global-error.tsx no va a funcionar en el modo desarrollo. Si queremos verlo
  funcionando tendrémos que hacer un despliegue para producción y correr el servidor en producción para
  poder ver este error.

  Estas páginas también tienen una función muy especial y es que las podemos reutilizar para hacer observabilidad
  comov emos en el useEffect:
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  Como una buena práctica, siempre está muy bien manejar los errores dentro de cada página específica. Es decir,
  usar la segunda forma de manejar errores: 2. Cómo manejar errores dentro de páginas de Next.js.
  Entre más personalizado sea nuestro error y más se parezca a la página en la que el usuario está mejor
  experiencia le estaremos dando a nuestros usuarios.
*/

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
