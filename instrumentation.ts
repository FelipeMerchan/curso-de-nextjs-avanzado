/* instrumentation es una nueva funcionalidad que tenemos en Next.js
que está completamente especializada para que servicios de terceros recojan
mucha más información de la aplicación de node.js que está corriendo.
Generalmente, en la mayoría de aplicaciones no deberíamos modificar este instrumentation
y nada más que dejar que otros servicios de obserbabilidad utilicen esta api para
conectarse en lo más profundo de Next.js y enviar los datos relevantes.

La mejor integración que podríamos tener con Next.js es con el archivo instrumentation.ts
porque va a capturar muchos más datos.
*/
import * as Sentry from "@sentry/nextjs"

export async function register() {
   if (process.env.NEXT_RUNTIME === "nodejs") {
     await import("./sentry.server.config")
   }
}

export const onRequestError = Sentry.captureRequestError
