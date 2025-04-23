import { Heading, Text } from "@chakra-ui/react"

import { Bookmark } from "@/components/bookmark"
import { BookmarkType } from "./schema"

/* Los React server components son una herramienta muy poderosa que tenemos
que utilizar porque en performance y seo sone xcelentes, desde el primer
momento en que el navegador recibe la primer llamada del htlm ya tenemos
la mayor información disponible para darle al usuario,e s decir,
hace un renderizado del lado del servidor. Esto no solamente mejora los
tiempos de carga sino que también nos ayuda a que nuestro sitio sea mejor indexado
por los navegadores y desde el primer render vamos a tener toda la inforamción disponible
para el usuario de forma instantanea. */

/* Para volver el componente un componente del servidor debemos
volver el componente aincrono: */
export default async function Bookmarks() {
  /* Si trabajamos desde un server component las rutas relativas no existen
  por lo cual no podemos usar await fetch("/bookmarks/api"), en su lugar,
  debemos usar rutas absolutas como http://localhost:3000/bookmarks/api */
  const bookmarksResponse = await fetch("http://localhost:3000/bookmarks/api")
  const bookmarks = (await bookmarksResponse.json()) as { data: BookmarkType[] }

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
        {bookmarks?.data.map((bookmark) => (
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
