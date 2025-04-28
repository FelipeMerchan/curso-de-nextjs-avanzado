import { Heading, Text } from "@chakra-ui/react"
/* Para usar la directris use cache ahora tendríamos a
unstable_cacheTag (porque es experimental hasta el momento) y
unstable_cacheLife.

unstable_cacheTag: para revalidar etiquetas
unstable_cacheLife: indica la revalidación que podemos hacer
*/
import { unstable_cacheLife as cacheLife } from "next/cache"

import { getClient } from "./lib"

/*
* LaunchDarkly
Existe desde hace mucho tiempo. Particualrmente no tiene tan buen soporte para next.js, pero
no significa que no soporte next.js. LaunchDarkly ofrece integraciones para clientes (aplicaciones
que funcionan únicamente en el cliente) y aplicaciones que funcionan en el servidor.
Nuestra aplicación es una aplicación que funciona con node.js, por lo cual el SDF del lado del servidor que
debemos usar es @launchdarkly/node-server-sdk y del lado del cliente es launchdarkly-react-client-sdk.
*/

// @see https://docs.launchdarkly.com/home/observability/contexts
/* En el contexto pueden ir los valores de geolocalización,
permisos y roels de los usuarios para saber si se habiltia o no el valor
de la flag. */
const context = {
  kind: "app-page",
  key: "feature-flags",
}

/*
* Nota
Nuestra página en react server components es estática, lo que significa que en el momento en que hacemos
npm run build, next.js está trayendo la información de LaunchDarkly y la está poniendo de forma estática
y únicamente está generando 1 html que siempre se lo da al usuario, lo que implica que por defecto Next.js
no va a hacer ningún trabajo de servidor si volvemos a entrar a la página por lo cual no obtiene
información nueva de LaunchDarkly y por lo tanto no podemos ver cambios en nuestras feature flags porque
se quedó con el valor que obtuvo en el npm run build.

Next.js nos ofrece formas de modificar este cache y de modificar las revalidaciones de cada página
para que nos funcione LaunchDarkly como esperamos.

Tenemos 2 formas en que podemos controlar esto:
1. exportando una variable llamada dynamic con el valor "force-dynamic". dynamic controla la forma
en que el servidor va a funcionar y va a tratar esta información. Con el valor "force-dynamic"
lo que hará es que cada vez que haya una petición a la página, es decir, cada vez que entre el usuario a
esta ruta, va a ejecutar toda la página (resovlerá todo lo asíncrono) y va a retornar el HTML.

2. Utilizar revalidate, con revalidate podemos especificarle a Next.js cada cuánto queremos
que se revalide la información de nuestras páginas. Esto es lo que se conoce en Next.js como Dynamic
Site Generation, es decir, que de forma incremental estamos cambiando nuestro sitio de acuerdo a los parámetros
que le demos. Revalidate tiene varios parámetros, uno de ellos es un número que indica en segundos cada cuánto
se debe procesar está información, por ejemplo:
export const revalidate = 10 <- serían 10 segundos
Si queremos ver este comportamiento no lo podrémos ver con npm run dev, porque esto solo funciona en producción.
Debemos hacer un build y un npm run start.
Con un revalidate de 10 segundos el comportamiento que tendrémos será que Next.js es que la página la primera vez que hicimos
build llamará todas las peticiones que necesita, entre ellas la de launchdarkly, y construirá la página. Luego
de los 10 segundos, y de que llegue una visita a la página, Next.js irá de nueva a LaunchDarkly, traerá la
nueva información sin hacer re-build y únicamente después de los 10 segundos trae lo nuevo que se encuentra
en nuestra API y revalida las páginas a las que les hemos pasado esta directiva.

* Cached data can be revalidated in two ways:

- Time-based revalidation: Automatically revalidate data after a certain amount of time has passed. This is
useful for data that changes infrequently and freshness is not as critical.

- On-demand revalidation: Manually revalidate data based on an event (e.g. form submission). On-demand
revalidation can use a tag-based or path-based approach to revalidate groups of data at once. This
is useful when you want to ensure the latest data is shown as soon as possible (e.g. when content
from your headless CMS is updated):
'use server'

import { revalidateTag } from 'next/cache'

export default async function action() {
  revalidateTag('collection')
}
*/

/*
  * Gestión de caché en Next.js con dynamic y revalidate
  En la versión 15 la forma en cómo funciona el cache ha cambiado.
  Ahora Next.js está dejando de tomar tantas decisiones de cache y se las está dando
  a los usuarios.

  * dynamic
  export const dynamic = "force-dynamic" hace que la página siempre vaya al servidor para validar
  la información para que siempre sea fresca. Es como server site generation.

  export const dynamic = "force-static", Next.js por defecto va a prerenderizar todas las páginas.
  force-static le indica a Next.js que, sin importar que Next.js piense que la página no es estática, hazla
  estática y cuando hagamos build haz un prerender de esta página. Es como static site generation.

  export const dynamic = "auto", por defecto dynamic viene en auto así que si no especificaramos un valor en dynamic
  Next.js haría su mejor intento por prerenderizar la página y dar el mejor resutlado.

  export const dynamic = "error", Next.js intentaría hacer un renderizado estático, pero en caso de que haya un error
  el proceso de build terminaría con un error y no sería exitoso.

  * revalidate
  Es una palbar reservada de Next.js. Con revalidate podemos espeficifar un periodo de tiempo en segundos y cuando se cumpla
  ese periodo nuestro servidor va a revalidar la inforamción asíncrona que tengamos. Durante ese periodo de tiempo
  la información se va a considerar fresca así que si hay un request a nuestra página se va a utilizar el mismo html. Luego
  de que el periodo haya pasado si hay un nuevo request a la página se va a ir al servidor y servicios externos
  para traer la información con el fin de devovlerla al usuario y vuelve y la almacena.

  export const revalidate = Infinity y export const revalidate = 0 hacen exactamente lo mismo y le dicen a Next.js
  que jamas revalide la información porque la información nunca va a cambiar, es lo mismo que static site generation o usar
  export const dynamic = "force-static".

  export const revalidate = false, ignora por completo esta medida.
*/
export const dynamic = "force-dynamic" // 'auto' | 'force-dynamic' | 'error' | 'force-static'
/* export const revalidate = 10 */ // false, Infinity, number

export default async function FeatureFlags() {
  /*
  * "use cache"
  Apartir de Next.js 15 llegó la directiva "use cache", permite controlar absolutamente todo lo que hemos visto
  de cache. Hasta el día de hoy esta funcionalidad está en fase de experimentación asi que por defecto no viene en la instalación
  de Next.js 15, pero se espera que esta nueva funcionalidad llegue antes de la versión 16. */
  /* "use cache" */
  /* cacheLife es lo mismo que usar revalidate, pero ahora podemos
  especificar el tiempo de forma más humana (minutes, weeks, etc): */
  /* cacheLife("minutes") */
  const client = await getClient()
  /* "feature-new-color" es el id de la feature flag en LaunchDarkly: */
  const variation = await client.variation("feature-new-color", context, false)

  const backgroundColor = variation ? "bg-purple-200" : "bg-green-200"

  return (
    <main className="mt-12">
      <header className="">
        <Heading size="lg" className="mb-1">
          Feature flags: LaunchDarkly
        </Heading>
        <Text>
          Experimentación A/B y feature flags con LaunchDarkly. Nuestra
          aplicación leerá el estado de feature flags en tiempo real y
          dependiendo de su valor renderizará una cosa u otra.
        </Text>
      </header>
      <div
        className={`mt-10 max-w-xl mx-auto rounded ${backgroundColor} p-6 min-h-56 flex items-center justify-center`}
      >
        <Text fontSize="lg">
          Mi nueva funcionalidad:{" "}
          <span className="font-semibold">
            {variation ? "Activada" : "Desactivada"}
          </span>
        </Text>
      </div>
    </main>
  )
}
