"use server"

import { Heading, Text } from "@chakra-ui/react"

import { Bookmark } from "@/components/bookmark"
import { useQuery } from "@tanstack/react-query"
import { BookmarkType, bookmarks } from "./schema"
import { useEffect, useState } from "react"
import { unstable_cacheTag as cacheTag } from "next/cache"

/* Los React server components son una herramienta muy poderosa que tenemos
que utilizar porque en performance y seo son excelentes, desde el primer
momento en que el navegador recibe la primer llamada del htlm ya tenemos
la mayor información disponible para darle al usuario, es decir,
hace un renderizado del lado del servidor. Esto no solamente mejora los
tiempos de carga sino que también nos ayuda a que nuestro sitio sea mejor indexado
por los navegadores y desde el primer render vamos a tener toda la información disponible
para el usuario de forma instantanea. */

/* Para volver el componente un componente del servidor debemos
volver el componente asíncrono (export default async function Bookmarks()): */
export default async function Bookmarks() {
  /* Si trabajamos desde un server component las rutas relativas no existen
  por lo cual no podemos usar await fetch("/bookmarks/api"), en su lugar,
  debemos usar rutas absolutas como http://localhost:3000/bookmarks/api */
  /* Primera forma de consumir datos desde el servidor, usando fetch hablando
  con una api: */
  /* const bookmarksResponse = await fetch("http://localhost:3000/bookmarks/api")
  const bookmarks = (await bookmarksResponse.json()) as { data: BookmarkType[] } */

  /* La tercera forma de hacer consumo de datos desde el servidor consiste en hacerlo desde
  un ORM. Un ORM es un manejador de datos relacionales que nos permite la comunicación
  con nuestras bases de datos de forma más simple.

  No únicamente tenemos que poner una api y hacer un fetch sino que podemos también hacerlo
  de forma directa con lo que sea que estemos utilizando en nuestro servidor.
  Next.js se va a encargar de hacer las optimizaciones necesarias para que nuestro código
  del servidor no se vaya hacia el cliente.
  En la vida profesional, lo que más nos vamos a encontrar son trabajos directos con
  orm. Las ORM nos permiten solucionar queries de forma más eficiente con nuestra
  base de datos.
  */
  /* const bookmarks = await orm.query.bookmarks.findMany({
    limit: 10,
    with: {
      author: true,
    },
  }) */

  /* Consumo de datos desde el cliente */
  /* Primera forma, con useState y useEffect */
  /* const [bookmarks, setBookmarks] = useState<BookmarkType[]>([])
  const [status, setStatus] = useState<
    "iddle" | "loading" | "error" | "success"
  >("iddle")

  useEffect(() => {
    setStatus("loading")
    fetch("/bookmarks/api")
      .then((response) => {
        return response.json()
      })
      .then(({ data }) => {
        setBookmarks(data)
        setStatus("success")
      })
      .catch((error) => {
        setStatus("error")
      })
  }, []) */

  /* Segunda forma de consumir datos desde el cliente.
  Con una librería muy buena como lo es React Query.
  Si queremos hacer una app robusta debemos utilizar librerías
  como react query para manejar todo lo asíncrono. */
  /* const { data: bookmarks, status } = useQuery({
    queryKey: ["bookmarks"], // identificador para caché
    queryFn: async () => {
      return fetch("/bookmarks/api")
        .then((response) => {
          return response.json()
        })
        .then(({ data }) => {
          return data as BookmarkType[]
        })
        .catch((error) => {
          console.log({ error })
        })
    },
  })

  console.log({ status }) */

  //const [bookmarks, setBookmarks] = useState<BookmarkType[]>([])

  //useEffect(() => {
  /*
    * Gestión de caché en Next.js con fetch
    Podemos crear cache a través de fetch. Next.js ha hecho a fetch disponible en todos los navegadores y
    además lo ha extendido para agregarle funcionalidades.
    */
  //fetch("/bookmarks/api", {
  /* cache:
        la configuración cache dentro de fetch tiene 2 funcionalidades dependiendo
        del lugar en que se use (servidor o navegador). Como estamos en un componente de cliente las opciones de cache
        ya existen dentro del protocolo de http y la web api, es decir, que tenemos las mismas
        que tenemos las mismas que hemos tenido siempre en el navegador.
        El cache que estamos tocando aquí es el cache del navegador.

        Si el fetch fuera en el servidor en un react server component las opciones de cache afectarán
        lo que suceda entre el servidor y el servicio externo al cual nos comuniquemos.
      */
  //cache: "force-cache",
  //next: { tags: ["bookmarks"] },
  //})
  //.then((response) => response.json() as Promise<{ data: BookmarkType[] }>)
  //.then(({ data }) => setBookmarks(data))
  //}, [])
  const { data: bookmarks } = await fetch(
    "http://localhost:3000/bookmarks/api",
    {
      /* cache: "no-cache", <- indica a Next.js que no utilice cache y siempre que se haga la petición */
      /* cache: "force-cache", <- indica a Next.js que guarde en el cache del servidor y siempre dame esa respuesta */
      /* Next.js le agregó una nueva propiedad llamada next que es exclusiva de Next.js */
      next: {
        /* El revalidate funciona exactamente igual que como funcionaría en una página,
      permite indicarle cada cuánto tiempo revalidar la respuesta */
        /* revalidate: 10, */
        /* tags, son IDs que podemos asignar a un request en particular para identificarlo posteriormente.
      son útiles para invalidar la cache en otro momento y lugar de la aplicación usando revalidateTag.
      los tags son como los query keys de React Query. Permiten identificar el cache para que nosotros de forma
      manual podamos invaldiar según consideremos sea necesario. */
        tags: ["bookmarks"],
      },
    },
  ).then((response) => response.json())
  /* En futuras versiones de next.js 15 el fetch cambiará debido a que
  la implementación usando la propiedad next no gustó a la comunidad, ahora
  se hará de la siguiente forma:
  export default async function Bookmarks() {
    "use cache"
    cacheTag('bookmarks')
    const { data: bookmarks } = await fetch("http://localhost:3000/bookmarks/api")
    .then((response) => response.json())
    Así le indicamos a Next.js que vamos a usar cache ("use cache") y vamos a guardar ese
    cache a través del identificador bookmarks (cacheTag('bookmarks')).
    La forma de usar revalidateTag será exactamente igual. Usamos
    revalidateTag("bookmarks") donde lo consideremos necesario.
  }
  */

  return (
    <main className="mt-12">
      <header className="">
        <Heading size="lg" className="mb-1">
          Marcadores
        </Heading>
        <Text>
          Estrategías de consumo de datos desde el servidor y el cliente
        </Text>
      </header>

      <ul className="text-lg mt-10">
        {bookmarks?.map((bookmark) => (
          <li className="border-b-2 py-4 px-6 my-2" key={bookmark.id}>
            <Bookmark {...bookmark} />
            {/* <div className="my-1 text-gray-600 text-xs ml-7">
              Creado por {bookmark.author?.name || "Anónimo"}
            </div> */}
          </li>
        ))}
      </ul>
    </main>
  )
}
