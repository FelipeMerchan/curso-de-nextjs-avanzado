"use client"

import { Heading, Text } from "@chakra-ui/react"

import { Bookmark } from "@/components/bookmark"
import { useQuery } from "@tanstack/react-query"
import { BookmarkType } from "./schema"

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
export default function Bookmarks() {
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
  const { data: bookmarks, status } = useQuery({
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

  console.log({ status })

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
