import { Suspense } from "react"
import Image from "next/image"

import { Heading, Text } from "@chakra-ui/react"

import { Bookmark } from "@/components/bookmark"
import Loading from "./loading"
import { orm } from "../db"
import { isInWhitelist } from "../utils/whitelist"

/* React server actions y react server components tienen una gran vetaja y es que nos
permite cargar desde el server toda la información que necesitamos en nuestra página
web, sin embargo, en la vida real la cantidad de datos que tenemos que manejar puede ser
siempre un reto en nuestras aplicaciones. Es por esto que entre más datos nosotros necesitemos
cargar desde el servidor, más lento y más va a impactar la respuesta en nuestros usuarios finales
en el cliente.
Es por esto que se hablará de Suspense en esta clase. Suspense es un feature de react que anunciaron
que iba a tener un gran impacto en cómo funcionaba todo, al principio no entendían los desarrolladores,
pero cuando entraron los react server components se dieron cuenta que era una parte fundamental
en la forma en que podíamos controlar y darle pistas a react y a next.js de lo que iba a suceder para
que nos ayudara poniendo spinners de carga y que ayudaran esperando a que llegara la información y que
nos dieran toda esta flexibilidad para hacer mejores páginas web.

Con el componente Suspense podemos implementar streaming.

Sin streaming el navegador tiene que esperar a que todo el servidor resuelva su respuesta para poder obtener
la respuesta en el navegador y renderizar toda la información.
*/

/* En esta clase se analizarán diferentes enfoques para mejorar la forma
en cómo se consultan y cómo se estructuran los llamados a las bases de datos
y a los servicios para mejorar el performance. Estos enfoques también sirven para
proteger los recursos de nuestros servidores y de nuestros servicios.

Estos enfoques son: consumo de datos en paralelo, consumo de datos secuencial
y a través de preload.

* Secuencial
Signfica que resolvemos primero una cosa y después la segunda.

Por ejemplo,
const author = await getAuthor(username);
const bookmarks = await getBookmarksByAuthorId(props.authorId);

Primero traemos el autor (con const author = await getAuthor(username))
y posteriormente volvemos a la base de datos (con const bookmarks = await getBookmarksByAuthorId(props.authorId))
para traer otra información.

Este formato funciona en el sentido de que podemos cargar nuestra página
y funciona para los usuarios, pero entre más datos tenga nuestra aplicación
y cuando tenemos servidores en distintas regiones del mundo vamos a notar que va
a ser muy lento porque necesitamos traer mucha información de diferentes partes
y esto se traduce en que el usuario necesita esperar mucho tiempo para poder ver
la información que necesita.

Secuancial es lo que principalmente debemos evitar cuando traigamos datos.
Hay 2 formas de solucionarlo: resolver de forma paralela y preload.

* Paralelo
Consiste en traer la información al mismo tiempo.
Para esto podemos usar el método Promise.all para correr peticiones en paralelo:

const [author, bookmarks] = await Promise.all([getAuthor(username), getBookmarksByAuthorUsername(username)])

Siempre que podamos utilizar Promise.all debemos usarlo. Es la forma más
óptima en que podemos traer datos.

Sin embargo puede que no tengamos forma de modificar nuestro backend para poder tener
servicios que se puedan correr en paralelo, es decir, puede que para disparar la segunda petición
necesitemos un dato que obtenemos en la respuesta de la primera petición y en este caso
tenemos que esperar a que la primera petición se resuelva para poder lanzar la segunda petición. Es por esto
que hay otro enfoque llamado preload.

* Preload
El preoload le va a ayudar mucho a next.js a que traiga la información mucho antes de que nosotros
la necesitemos con el único fin de brindarle a nuetros usuarios una mejor experiencia.

Cabe resaltar que los mejores resultados que se obtienen con este enfoque es utilizar el fetch de next.js
porque cuando se utiliza este fetch junto con las opciones de cache que nos brinda next.js vamos a tener resultados
mejores y más instantaneos para nuestros usuarios.

* Nota
Siempre que podamos utilicemos cargas en paralelo para mejorar nuestros recursos y la forma óptima
para que Next.js traiga datos. Cuando no se pueda y siempre que sea necesario utilizaremos entonces técnicas y
estrategias de preload para acelerar la carga de recursos que necesitaremos en un futuro.
*/

export default async function Author({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params

  const author = await getAuthor(username)

  if (!author) {
    return null
  }

  /* Para acelerar las cosas desde el FE podemos hacer un preload de la
  información que nos interesa. preload trae la información que intentará
  obtener el componente AuthorBookmarksById si se cumple la condición isWhitelisted,
  en caso de que isWhitelisted sea true, es decir, se anticipa a traer estos datos
  mientras la promesa de isInWhitelist se resuelve. */
  preload(author.id)

  /* isInWhitelist es un chequeo que tenemos que hacer antes de renderizar
  un autor, esto lo hacemos solo para agregar más espera a nuestro llamado como si
  se tratara de un caso mucho más real. Es decir, no hace parte de los conceptos
  que se explican en esta clase sino que sirve solo para simular un caso más real. */
  const isWhitelisted = await isInWhitelist(author)

  return (
    <main className="my-10">
      <header>
        <Heading size="lg" className="mb-4">
          Marcadores de:
        </Heading>
        <figure className="pl-4 pr-8 py-6 inline-flex items-center">
          <div className="rounded-full border inline-block mr-4">
            <Image
              src={author.avatarUrl!}
              alt={author.name!}
              width="60"
              height="60"
              style={{
                maxWidth: "100%",
                height: "auto",
              }}
            />
          </div>
          <figcaption>
            <Heading size="lg" className="">
              {author.name}
            </Heading>
            <Heading as="p" size="md" className="" color="gray.500">
              {author.username}
            </Heading>
          </figcaption>
        </figure>
      </header>
      <Text className="mt-2">Patrones de consumo de datos usando promesas</Text>
      <Heading size="lg" className="mb-1 mt-14">
        Marcadores
      </Heading>
      {/* Mientras carga vamos a colocar un loading, este loading lo veremos en la primera respuesta
      que el servidor envia al navegador, por lo cual podremos renderizar los datos que ya tenemos
      listos y los que pueden tardarse tendrán un loading mientras los datos están listos. Sin suspense
      la respuesta al cliente se dará hasta que el servidor termine todas las peticiones así que el navegador
      no pintará nada hasta que esto termine. Con suspense les podemos mostrar un loading mientras se terminan
      de ejecutar las peticiones y así el servidor le enviará al navegador lo que ya tenga listo para renderizarlo
      y cuando termine lo que está con suspense se lo enviará al navegador para que termine de mostrar toda la
      información. Lograr esto antes involucraba usar un useEffect para que desde del cliente se hiciera la petición
      y se mostrara un loading con algún useState, con Suspense esto lo hace ahora React y Next.js de forma
      más óptima.
      En algunos casos el servidor sí nos va a dar toda la información y no usará el loading, esto es dependiendo
      de qué tan rápido el servidor pueda resolver todas las peticiones lo va a renderizar y va a terminar el trabajo en el
      servidor o en el cliente. Este proceso se le conoce como streaming y es el que gracias a Suspense podemos
      lograr y darle mayor agilidad en el renderizado en el cliente. Gracias a Next.js y la gran integración que tiene
      con las nuevas versiones de React hay otra forma en que podemos usar Suspense a nivel de páginas usando el archico loading.tsx.
      */}
      {/* You can wrap any part of your application with a Suspense boundary.
      React will display your loading fallback until all the code and data needed by the children has been loaded. */}
      <Suspense fallback={<Loading />}>
        {/* Como Next.js está muy integrado con React podemos usar nuestro componente loading.tsx
      en nuestro Suspense: <Suspense fallback={<Loading />}> */}
        {/* Dependiendo de la validación vamos a renderizar
      la información de AuthorBookmarksById (el cual hace la segunda petición) */}
        {isWhitelisted && <AuthorBookmarksById authorId={author.id} />}
      </Suspense>
    </main>
  )
}

async function AuthorBookmarksById(props: { authorId: number }) {
  const bookmarks = await getBookmarksByAuthorId(props.authorId)

  return (
    <ul className="mt-8 text-lg">
      {bookmarks?.map((bookmark) => (
        <li className="border-b-2 py-4 px-6 my-2" key={bookmark.id}>
          <Bookmark {...bookmark} />
        </li>
      ))}
    </ul>
  )
}

async function getBookmarksByAuthorId(authorId: number) {
  return orm.query.bookmarks.findMany({
    where: (entry, { eq }) => eq(entry.authorId, authorId),
  })
}

async function getAuthor(username: string) {
  return orm.query.authors.findFirst({
    where: (entry, { eq }) => eq(entry.username, username),
  })
}

/* el void va a evaluar la función getBookmarksByAuthorId, sin embargo,
siempre nos va a retornar undefined. No nos interesa qué nos retorne sino que
getBookmarksByAuthorId se evalue de la forma más pronta posible para que Next.js
por dentro empiece a traer esa información antes de que se renderice: */
function preload(authorId: number) {
  void getBookmarksByAuthorId(authorId)
}
