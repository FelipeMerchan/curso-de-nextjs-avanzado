"use server"

import { cache } from "react"
import { init, type LDClient } from "@launchdarkly/node-server-sdk"

/* cache is only for use with React Server Components. */
export const getClient = cache(async function (): Promise<LDClient> {
  const client = init(process.env.LAUNCHDARKLY_SDK_KEY!)
  /* Esperamos que haga lo que tenga que hacer para inicializar el cliente: */
  await client.waitForInitialization({
    timeout: 10, // 10 seconds
  })

  /* Retornamos el cliente para poderlo usar dentro de la aplicación. El
  cliente debería de ser un singleton, para asegurarnos de que sea un singleton
  podemos hacer uso de cache de React. cache permite asegurar que el valor que nosotros
  pasemos sea instanciado y sea reutilizado a través de técnicas de memoization una
  y otra vez para que no creemos múltiples instancias. Cada vez que llamemos getClient el método cache se
  va a encargar de mantener el valor en memoria y si la forma en como nosotros llamamos esta aplicación
  no cambia el valor que obtenemos de regreso será exactamente el mismo, es decir, tenemos un singleton: */
  return client
})
